<template>
	<div class="root">
		<div class="container">
			<div class="user user-left">
				<div :class="my">{{my}}</div>
				<div v-html="myIcon"></div>
				<h2>{{myUsername}}</h2>
				<h3>{{myCertUserId}}</h3>
				<div class="turn" v-if="turn === 'me'">Your turn</div>
			</div>

			<div class="user user-right">
				<div class="turn" v-if="turn === 'opponent'">Opponent's turn</div>
				<h3>{{opponentCertUserId}}</h3>
				<h2>{{opponentUsername}}</h2>
				<div v-html="opponentIcon"></div>
				<div :class="opponent">{{opponent}}</div>
			</div>

			<div class="result win" v-if="isWin">
				You win!
			</div>
			<div class="result lose" v-else-if="isLose">
				You lose.
			</div>
			<div class="result draw" v-else-if="isDraw">
				Draw
			</div>

			<table>
				<tr v-for="i in 3">
					<template v-for="j in 3">
						<td v-if="field[i - 1][j - 1] == 'x'" class="x" @click="click(i - 1, j - 1)">&times;</td>
						<td v-else-if="field[i - 1][j - 1] == 'o'" class="o" @click="click(i - 1, j - 1)">o</td>
						<td v-else @click="click(i - 1, j - 1)"></td>
					</template>
				</tr>
			</table>

			<a @click="$router.navigate('play')">Play another game</a>
		</div>
	</div>
</template>

<style lang="sass" scoped>
	.root
		height: 100%
		background-color: #223
	.container
		position: absolute
		left: 50%
		top: 50%
		transform: translateX(-50%) translateY(-50%)

		text-align: center

	.result
		position: absolute
		width: 100%
		margin-top: -32px
		text-align: center

		font-size: 32px

		&.win
			color: #DB6
		&.lose
			color: #B6D
		&.draw
			color: #6DB

	table
		margin: 32px 256px

		td
			width: 68px
			height: 68px
			border: 2px solid rgba(255, 255, 255, 0.5)
			padding: 0

			font-size: 48px
			text-align: center
			vertical-align: top

			&:hover
				background-color: rgba(255, 255, 255, 0.2)

			&.o
				line-height: 52px

	.user
		width: 256px
		margin: -64px 128px

		position: absolute

		.x, .o
			margin: 16px 0
			font-size: 48px
			line-height: 56px

		h2
			margin: 0
			font-weight: normal
			font-size: 32px
			color: #FFF
		h3
			margin: 0
			font-weight: normal
			font-size: 16px
			color: rgba(255, 255, 255, 0.5)

		.turn
			margin: 16px 0
			color: #DB6
			font-size: 16px
			font-weight: bold


		&.user-left
			left: -128px
			top: 0
			text-align: right
			margin-left: 0

		&.user-right
			right: -128px
			bottom: 0
			text-align: left
			margin-right: 0


	.x
		color: #F36
	.o
		color: #36F


	a
		font-size: 20px
		color: #FFF
		text-decoration: underline
		cursor: pointer
</style>

<script type="text/javascript">
	import Users from "@/libs/users";
	import Game from "@/libs/game";
	import {zeroPage} from "@/zero";
	import jdenticon from "jdenticon";

	export default {
		name: "tic-tac-toe",
		data() {
			let field = [];
			for(let i = 0; i < 3; i++) {
				field.push([]);
				for(let j = 0; j < 3; j++) {
					field[i].push("-");
				}
			}

			return {
				field,
				myUsername: "",
				myCertUserId: "",
				opponentUsername: "",
				opponentCertUserId: "",
				turn: "",
				isWin: false,
				isLose: false,
				isDraw: false
			};
		},

		async mounted() {
			const myAddress = this.$store.state.siteInfo.auth_address;
			const opponentAddress = this.$router.currentParams.opponentAddress;

			// Show my info
			const me = await Users.addressToInfo(myAddress);
			this.myUsername = me.username;
			this.myCertUserId = me.cert_user_id;
			this.myIcon = jdenticon.toSvg(myAddress, 96);

			// Show opponent info
			const opponent = await Users.addressToInfo(opponentAddress);
			this.opponentAddress = opponentAddress;
			this.opponentUsername = opponent.username;
			this.opponentCertUserId = opponent.cert_user_id;
			this.opponentIcon = jdenticon.toSvg(opponentAddress, 96);

			// Set current turn
			if(this.$router.currentParams.first) {
				this.turn = "me";
				this.my = "x";
				this.opponent = "o";
			} else {
				this.turn = "opponent";
				this.my = "o";
				this.opponent = "x";
			}

			this.gameId = this.$router.currentParams.gameId;
			this.off = await Game.onFrom(this.opponentAddress, `game/tic-tac-toe/${this.gameId}/set`, this.handleSet);
		},
		destroyed() {
			if(this.off) {
				this.off();
			}
		},

		methods: {
			async click(i, j) {
				if(this.turn !== "me") {
					// Not my turn -- return
					return;
				}
				if(this.field[i][j] !== "-") {
					// Cell is not empty
					return;
				}

				this.turn = "opponent";

				// Set locally
				this.$set(this.field[i], j, this.my);

				// Send to the opponent
				await Game.sendTo(this.opponentAddress, `game/tic-tac-toe/${this.gameId}/set`, [i, j]);

				this.checkWinner();
			},
			handleSet([i, j]) {
				if(this.turn !== "opponent") {
					this.reportCheater("Two turns in a row");
					return;
				}

				if(this.field[i][j] !== "-") {
					this.reportCheater("The cell isn't empty");
					return;
				}

				// Set locally
				try {
					this.$set(this.field[i], j, this.opponent);
				} catch(e) {
					this.reportCheater(e.message);
				}

				// My turn
				this.turn = "me";

				this.checkWinner();
			},

			reportCheater(reason) {
				zeroPage.alert("<b>Cheater found! Reason:</b> " + reason);
			},

			reportWin() {
				// We win!
				this.isWin = true;
				this.turn = "";
			},
			reportLose() {
				// We lose.
				this.isLose = true;
				this.turn = "";
			},
			reportDraw() {
				// Draw
				this.isDraw = true;
				this.turn = "";
			},

			checkWinner() {
				// Check whether we win, lose or it's draw

				// Horizontal
				for(let i = 0; i < 3; i++) {
					if(
						this.field[i][0] === this.my &&
						this.field[i][1] === this.my &&
						this.field[i][2] === this.my
					) {
						this.reportWin();
						return;
					}
					if(
						this.field[i][0] === this.opponent &&
						this.field[i][1] === this.opponent &&
						this.field[i][2] === this.opponent
					) {
						this.reportLose();
						return;
					}
				}

				// Vertical
				for(let i = 0; i < 3; i++) {
					if(
						this.field[0][i] === this.my &&
						this.field[1][i] === this.my &&
						this.field[2][i] === this.my
					) {
						this.reportWin();
						return;
					}
					if(
						this.field[0][i] === this.opponent &&
						this.field[1][i] === this.opponent &&
						this.field[2][i] === this.opponent
					) {
						this.reportLose();
						return;
					}
				}

				// Main diagonal aka backslash
				if(
					this.field[0][0] === this.my &&
					this.field[1][1] === this.my &&
					this.field[2][2] === this.my
				) {
					this.reportWin();
					return;
				}
				if(
					this.field[0][0] === this.opponent &&
					this.field[1][1] === this.opponent &&
					this.field[2][2] === this.opponent
				) {
					this.reportLose();
					return;
				}

				// Reverse diagonal aka forward slash
				if(
					this.field[2][0] === this.my &&
					this.field[1][1] === this.my &&
					this.field[0][2] === this.my
				) {
					this.reportWin();
					return;
				}
				if(
					this.field[2][0] === this.opponent &&
					this.field[1][1] === this.opponent &&
					this.field[0][2] === this.opponent
				) {
					this.reportLose();
					return;
				}

				let isDraw = true;
				for(let i = 0; i < 3; i++) {
					for(let j = 0; j < 3; j++) {
						if(this.field[i][j] === "-") {
							isDraw = false;
						}
					}
				}
				if(isDraw) {
					this.reportDraw(0);
				}
			}
		}
	};
</script>