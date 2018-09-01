<template>
	<div class="root">
		<!-- Header -->
		<h1>
			<span class="zero">Zer0</span>
			<span class="p">P</span>
			<span class="l">l</span>
			<span class="a">a</span>
			<span class="y">y</span>
		</h1>
		<h2>
			Game Center
		</h2>

		<!-- Not logged in ZeroNet -->
		<template v-if="!loggedIn">
			<button @click="signUp">
				Sign up/in
			</button>
		</template>
		<!-- Logged to ZeroNet, but not registered yet -->
		<template v-else-if="!registered">
			<input v-model="username" placeholder="Choose username">
			<button @click="register">Register</button>
			<button @click="signUp">Choose another ID</button>
			<div class="error">{{error}}</div>
		</template>
	</div>
</template>

<style lang="sass" scoped>
	.root
		width: 100%

		position: absolute
		top: 50%
		transform: translateY(-50%)

		text-align: center

	h1
		font-weight: bold
		font-size: 0

		span
			font-size: 64px
			line-height: 48px

		.zero
			color: #BBB
		.p
			color: #68F
		.l
			color: #F66
		.a
			color: #DB6
		.y
			color: #6B6

	h2
		font-weight: normal
		font-size: 32px
		line-height: 0
		color: #B6B
		margin-bottom: 64px


	.error
		color: #F66
		font-size: 16px
		height: 16px
		margin-top: 16px
</style>

<script type="text/javascript">
	import {zeroAuth, zeroPage} from "@/zero";
	import Users from "@/libs/users";

	export default {
		name: "home",
		data() {
			return {
				username: "",
				error: ""
			};
		},

		computed: {
			loggedIn() {
				return !!this.$store.state.siteInfo.cert_user_id;
			}
		},
		asyncComputed: {
			async registered() {
				return this.loggedIn && await Users.isRegistered();
			}
		},

		watch: {
			"$store.state.siteInfo.cert_user_id"(newValue, oldValue) {
				if(!oldValue && newValue) {
					// Sign up
					let certUserId = this.$store.state.siteInfo.cert_user_id;
					this.username = certUserId.split("@")[0];
				}
			},
			registered(newValue) {
				if(newValue) {
					// Registered user
					this.$router.navigate("play");
				}
			}
		},

		methods: {
			signUp() {
				// Not logged in yet
				// We're not using ZeroAuth.requestAuth() because it won't
				// work for re-login
				zeroPage.cmd("certSelect", {
					accepted_domains: zeroAuth.acceptedDomains
				});
			},
			async register() {
				// Check that a username is passed
				if(!this.username) {
					this.error = "Please, choose a username";
					return;
				}
				this.error = "";

				await Users.register(this.username);

				this.$router.navigate("play");
			}
		}
	};
</script>