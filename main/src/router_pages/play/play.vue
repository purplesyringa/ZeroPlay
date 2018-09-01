<template>
	<div class="root">
		<!-- Game list -->
		<div class="games">
			<h1>Welcome, {{username}}</h1>

			<div class="game" @click="$router.navigate('play/chess')">
				<img src="@/assets/chess.png" />
				<h2>Chess</h2>
			</div>

			<div class="game" @click="$router.navigate('play/tic-tac-toe')">
				<img src="@/assets/tic-tac-toe.png" />
				<h2>Tic Tac Toe</h2>
			</div>
		</div>

		<div class="credits">
			Game icons by <a href="https://www.iconfinder.com/quizanswers">Vlad Marin</a>
		</div>

		<a class="logout" @click="logout">Log out/choose another ID</a>
	</div>
</template>

<style lang="sass" scoped>
	.root
		width: 100%
		height: 100%
		font-size: 0

		background-color: #223

	h1
		font-size: 32px
		color: #FFF
		text-align: center

		width: 100%
		position: absolute
		margin-top: -64px

	.logout
		color: #88D
		font-size: 20px
		text-decoration: none
		cursor: pointer

		position: absolute
		left: 16px
		top: 16px

	.games
		width: 100%
		position: absolute
		top: 50%
		transform: translateY(-50%)
		text-align: center

		.game
			display: inline-block
			width: 208px
			height: 256px
			padding: 32px 0
			margin: 16px
			border-radius: 16px
			background-color: #FFF
			box-shadow: 0 16px 16px rgba(0, 0, 0, 0.3)

			text-align: center
			cursor: pointer

			img
				width: 128px
				height: 128px

			h2
				font-size: 32px
				line-height: 0
				font-weight: normal

	.credits
		position: absolute
		left: 0
		bottom: 16px

		width: 100%
		text-align: center

		font-size: 20px
		color: #FFF

		a
			color: inherit
</style>

<script type="text/javascript">
	import Users from "@/libs/users";
	import {zeroPage, zeroAuth} from "@/zero";

	export default {
		name: "play",

		asyncComputed: {
			async username() {
				const authAddress = this.$store.state.siteInfo.auth_address;
				return (await Users.addressToInfo(authAddress)).username;
			}
		},

		async mounted() {
			if(!(await Users.isRegistered())) {
				this.$router.navigate("");
			}
		},

		methods: {
			logout() {
				// We're not using ZeroAuth.requestAuth() because it won't
				// work for logout
				zeroPage.cmd("certSelect", {
					accepted_domains: zeroAuth.acceptedDomains
				});
			}
		},

		watch: {
			"$store.state.siteInfo.cert_user_id"(newValue) {
				this.$router.navigate("");
			}
		}
	};
</script>