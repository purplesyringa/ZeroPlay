<template>
	<div class="root">
		<!-- Game list -->
		<div class="groups" v-if="!readyToPlay">
			<a @click="$router.navigate('play')" class="back">Choose another game</a>

			<span>With whom are you going to play?</span>
			<input v-model="username" placeholder="Choose username" />
			<button @click="play">Play</button>
		</div>
		<div class="groups" v-else>
			<span>Now ask your friend to do the same</span>
		</div>
	</div>
</template>

<style lang="sass" scoped>
	.root
		width: 100%
		height: 100%
		font-size: 0

		background-color: #B12

	.groups
		width: 100%
		position: absolute
		top: 50%
		transform: translateY(-50%)
		text-align: center

		.back
			color: #FFF
			font-size: 20px
			text-decoration: underline
			text-align: center
			cursor: pointer

			position: absolute
			left: 0
			width: 100%
			margin-top: -64px

		span
			color: #FFF
			font-size: 20px
			text-align: center
			cursor: pointer

		input, button
			display: block
			margin: 16px auto 0
			font-size: 16px
</style>

<script type="text/javascript">
	import Game from "@/libs/game";
	import Users from "@/libs/users";
	import {zeroPage} from "@/zero";

	export default {
		name: "play",
		data() {
			return {
				username: "",
				readyToPlay: false
			};
		},

		computed: {
			game() {
				return this.$router.currentParams.game;
			}
		},

		methods: {
			async play() {
				if(!this.username) {
					zeroPage.alert("Please, type in your friend's username");
					return;
				}

				// Get friend's address
				let opponentAddress;
				try {
					opponentAddress = await Users.userNameToAddress(this.username);
				} catch(e) {
					zeroPage.error(e.message);
					return;
				}

				this.readyToPlay = true;

				// Send a request for playing to the friend
				Game.sendTo(opponentAddress, `with-a-friend/join/${this.game}`);

				// Listen to with-a-friend/join/${this.game}
				const off = Game.onFrom(opponentAddress, `with-a-friend/join/${this.game}`, () => {
					off();

					// It's join request -- accept it
					Game.sendTo(opponentAddress, `with-a-friend/accept-join/${this.game}`);

					// Start the game
					this.$router.navigate(`play/${this.game}/with-a-friend/${opponentAddress}/${gameId}`);
				});

				// Wait for this message from the opponent
				const gameId = await Game.waitFrom(opponentAddress, `with-a-friend/accept-join/${this.game}`);

				// The opponent agreed to start the game, so we agree as well
				this.$router.navigate(`play/${this.game}/with-a-friend/${opponentAddress}/${gameId}`);
			}
		}
	};
</script>