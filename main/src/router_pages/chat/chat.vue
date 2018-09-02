<template>
	<div class="root">
		<a class="back" @click="$router.navigate('play')">&lt; Back</a>

		<div class="middle">
			<header>
				0Play Chat
			</header>

			<main ref="messages">
				<template v-for="message in messages">
					<article :class="{right: message.me}">
						<div class="logo" v-html="message.icon" />
						<div class="author" v-if="!message.me">{{message.username}}</div>
						{{message.text}}
					</article>
					<div class="clearfix" />
				</template>
			</main>

			<input placeholder="Type here" @keyup.enter="submit" v-model="message" />
		</div>
	</div>
</template>

<style lang="sass" scoped>
	.root
		width: 100%
		height: 100%
		font-size: 0

	.back
		color: #88D
		font-size: 20px
		text-decoration: none
		cursor: pointer

		position: absolute
		top: 16px
		left: 16px


	.middle
		width: 1024px
		max-width: 100%
		height: 100%
		margin: 0 auto

	header
		padding: 16px 0
		text-align: center
		font-size: 24px
		height: 64px

		background-color: rgba(0, 0, 0, 0.5)
		box-shadow: 0 4px 4px rgba(0, 0, 0, 0.1)
		color: #DB6

	main
		height: calc(100% - 64px - 48px)
		background-color: rgba(0, 0, 0, 0.2)

		overflow-y: scroll

		article
			display: inline-block
			padding: 16px
			margin: 16px 32px + 64px
			border-radius: 4px

			position: relative

			font-size: 16px
			background-color: rgba(0, 255, 255, 0.1)
			color: #FFF

			.author
				color: #DB6
				margin-bottom: 16px

			&::before
				content: ""
				display: inline-block

				width: 0
				height: 0
				border-right: 8px solid rgba(0, 255, 255, 0.1)
				border-top: 8px solid transparent
				border-bottom: 8px solid transparent

				position: absolute
				left: -8px
				top: 16px

			.logo
				position: absolute
				left: -64px - 16px
				top: 0

			&.right
				float: right

				&::before
					border-left: 8px solid rgba(0, 255, 255, 0.1)
					border-right: none
					left: auto
					right: -8px

				.logo
					left: auto
					right: -64px - 16px

	.clearfix
		clear: both

	input
		width: 100%
		padding: 16px
		font-size: 16px
		height: 48px

		background-color: rgba(0, 0, 0, 0.5)
		box-shadow: 0 -4px 4px rgba(0, 0, 0, 0.1)
		color: #FFF
</style>

<script type="text/javascript">
	import Users from "@/libs/users";
	import Game from "@/libs/game";
	import jdenticon from "jdenticon";
	import {zeroDB} from "@/zero";

	export default {
		name: "chat",
		data() {
			return {
				message: "",
				messages: []
			};
		},

		//asyncComputed: {
		//	async username() {
		//		const authAddress = this.$store.state.siteInfo.auth_address;
		//		return (await Users.addressToInfo(authAddress)).username;
		//	}
		//},

		async mounted() {
			if(!(await Users.isRegistered())) {
				this.$router.navigate("");
				return;
			}

			const authAddress = this.$store.state.siteInfo.auth_address;
			this.username = (await Users.addressToInfo(authAddress)).username;

			this.off = await Game.onBroadcast("chat/messsage", this.handleMessage);

			const myJsonId = await zeroDB.getJsonID(`users/${authAddress}/data.json`, 2);

			this.messages = (await zeroDB.query(`
				SELECT
					chat.*,
					json.cert_user_id,
					json.username,
					json.directory
				FROM chat

				LEFT JOIN json ON (chat.json_id = json.json_id)
			`)).map(message => {
				return {
					certUserId: message.cert_user_id,
					username: message.username,
					me: message.json_id === myJsonId,
					text: message.text,
					icon: jdenticon.toSvg(message.directory.replace("users/", ""), 64),
					date: message.date
				};
			});

			setTimeout(() => {
				this.$refs.messages.scrollTop = 1000000;
			}, 0);
		},
		destroyed() {
			if(this.off) {
				this.off();
			}
		},

		methods: {
			async submit() {
				this.message = this.message.trim();
				if(!this.message) {
					return;
				}

				this.messages.push({
					certUserId: this.$store.state.siteInfo.cert_user_id,
					username: this.username,
					me: true,
					text: this.message,
					icon: jdenticon.toSvg(this.$store.state.siteInfo.auth_address, 64),
					date: Date.now()
				});

				Game.broadcast("chat/message", this.message);

				zeroDB.insertRow(
					`data/users/${this.$store.state.siteInfo.auth_address}/data.json`,
					`data/users/${this.$store.state.siteInfo.auth_address}/content.json`,
					"chat",
					{
						date: Date.now(),
						text: this.message
					}
				);

				this.message = "";
				setTimeout(() => {
					this.$refs.messages.scrollTop = 1000000;
				}, 0);
			},

			async handleMessage(fromAddress, text) {
				const info = await Users.addressToInfo(fromAddress);
				this.messages.push({
					certUserId: info.cert_user_id,
					username: info.username,
					me: false,
					text,
					icon: jdenticon.toSvg(fromAddress, 64),
					date: Date.now()
				});
			}
		}
	};
</script>