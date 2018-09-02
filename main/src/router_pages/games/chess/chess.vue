<template>
	<div class="root">
		<div class="container">
			<div class="user user-left">
				<div :class="my">
					<template v-if="my === 'b'">&#9817;</template>
					<template v-if="my === 'w'">&#9823;</template>
				</div>
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
				<div :class="opponent">
					<template v-if="opponent === 'b'">&#9817;</template>
					<template v-if="opponent === 'w'">&#9823;</template>
				</div>
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
			<div class="result draw" v-else-if="isStalement">
				Stalement
			</div>
			<div class="result notice" v-else-if="isCheck">
				Check
			</div>

			<div ref="board" class="board"></div>

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
		&.notice
			color: #88A

	.board
		width: 512px
		margin: 32px 256px

	.user
		width: 256px
		margin: 0 128px

		position: absolute

		.b, .w
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


	.b
		color: #962
	.w
		color: #FDB


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
	import Chess from "chess.js";
	import ChessBoard from "chessboardjs";
	import "chessboardjs/www/css/chessboard.css";

	export default {
		name: "chess",
		data() {
			return {
				chess: new Chess(),
				board: null,
				myUsername: "",
				myCertUserId: "",
				opponentUsername: "",
				opponentCertUserId: "",
				turn: "",
				isCheck: false,
				isWin: false,
				isLose: false,
				isDraw: false,
				isStalemate: false
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
				this.my = "w";
				this.opponent = "b";
			} else {
				this.turn = "opponent";
				this.my = "b";
				this.opponent = "w";
			}

			this.gameId = this.$router.currentParams.gameId;
			this.off = await Game.onFrom(this.opponentAddress, `game/chess/${this.gameId}/move`, this.handleMove);

			this.board = ChessBoard(this.$refs.board, {
				pieceTheme: "chessboard-img/chesspieces/wikipedia/{piece}.png",
				position: "start",
				draggable: true,
				onDrop: (src, dst, piece, newPos, oldPos, orientation) => {
					if(this.chess.move({
						from: src,
						to: dst,
						promotion: "q"
					})) {
						console.log(src, "->", dst);

						// It's opponent's turn
						this.turn = "opponent";

						// Send to opponent
						Game.sendTo(this.opponentAddress, `game/chess/${this.gameId}/move`, [src, dst]);

						this.checkWinner();
					} else {
						console.log("Incorrect", src, "->", dst);
						return "snapback";
					}
				},
				onDragStart: (src, piece, pos, orientation) => {
					return piece[0] === this.my && this.turn === "me";
				}
			});
			if(this.my === "b") {
				this.board.flip();
			}
		},
		destroyed() {
			if(this.off) {
				this.off();
			}
		},

		methods: {
			handleMove([src, dst]) {
				if(this.turn !== "opponent") {
					this.reportCheater("Two turns in a row");
				}

				const piece = this.chess.get(src);
				if(!piece) {
					this.reportCheater("Moving unexisting piece");
				} else if(piece.color !== this.opponent) {
					this.reportCheater("He's moving my pieces!");
					return;
				} else if(!this.chess.move({
					from: src,
					to: dst,
					promotion: "q"
				})) {
					this.reportCheater(`Incorrect move: ${src} -> ${dst}`);
					return;
				}

				console.log("Opponent", src, "->", dst);

				// Draw
				this.board.position(this.chess.fen());

				// Turn
				this.turn = "me";

				this.checkWinner();
			},

			reportCheater(reason) {
				zeroPage.alert("<b>Cheater detected! Reason:</b> " + reason);
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
			reportStalemate() {
				// Stalemate
				this.isStalemate = true;
				this.turn = "";
			},

			checkWinner() {
				// Check whether it's check
				this.isCheck = this.chess.in_check();

				// Check whether it's lose
				if(this.chess.in_checkmate()) {
					this.reportLose();
					return;
				}

				// Check whether it's draw
				if(this.chess.in_draw()) {
					this.reportDraw();
					return;
				}

				// Check whether it's stalemate
				if(this.chess.in_stalemate()) {
					this.reportStalemate();
					return;
				}

				// Check whether it's win
				if(this.chess.game_over()) {
					this.reportWin();
				}
			}
		}
	};
</script>