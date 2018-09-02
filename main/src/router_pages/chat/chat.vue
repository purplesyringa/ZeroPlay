<template>
	<div class="chat--chat">
		<a class="back" @click="$router.navigate('play')">&lt; Back</a>

		<div class="middle">
			<header>
				0Play Chat
			</header>

			<main ref="messages">
				<template v-for="message in messages">
					<article :class="{right: message.me}" :ref="message.ref" :key="message.ref">
						<div class="logo" v-html="message.icon" />
						<div class="author" v-if="!message.me">{{message.username}}</div>
						<div v-html="textToHtml(message.text)" />
						<div class="date">
							<a @click="typeRef(message)">{{(new Date(message.date)).toLocaleString()}}</a>
						</div>
					</article>
					<div class="clearfix" />
				</template>
			</main>

			<input placeholder="Type here" @keyup.enter="submit" v-model="message" />
		</div>
	</div>
</template>

<style lang="sass">
	.chat--chat
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

				.date
					color: rgba(255, 255, 255, 0.5)
					margin-top: 16px
					cursor: pointer

					&:hover
						text-decoration: underline

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

			.submessage
				padding: 16px
				background-color: rgba(0, 0, 0, 0.2)

			article, .submessage
				.author
					color: #DB6
					margin-bottom: 16px

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

			this.off = await Game.onBroadcast("chat/message", this.handleMessage.bind(this));

			this.myJsonId = await zeroDB.getJsonID(`users/${authAddress}/data.json`, 2);

			this.messageCache = {};

			this.messages = (await zeroDB.query(`
				SELECT
					chat.*,
					json.cert_user_id,
					json.username,
					json.directory
				FROM chat

				LEFT JOIN json ON (chat.json_id = json.json_id)

				ORDER BY chat.date ASC
			`)).map(message => {
				return {
					certUserId: message.cert_user_id,
					username: message.username,
					me: message.json_id === this.myJsonId,
					text: message.text,
					icon: jdenticon.toSvg(message.directory.replace("users/", ""), 64),
					auth_address: message.directory.replace("users/", ""),
					date: message.date,
					ref: `message_${message.directory.replace("users/", "")}_${message.date}`
				};
			});
			for(const message of this.messages) {
				this.messageCache[message.ref] = message;
			}

			this.scroll();

			if(this.$router.currentParams.id) {
				setTimeout(() => {
					const node = this.$refs[this.$router.currentParams.id][0];
					node.scrollIntoView();
				}, 500);
			}
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

				const date = Date.now();
				const message = {
					certUserId: this.$store.state.siteInfo.cert_user_id,
					username: this.username,
					me: true,
					text: this.message,
					icon: jdenticon.toSvg(this.$store.state.siteInfo.auth_address, 64),
					auth_address: this.$store.state.siteInfo.auth_address,
					date,
					ref: `message_${this.$store.state.siteInfo.auth_address}_${date}`
				};
				this.messages.push(message);
				this.messageCache[message.ref] = message;

				Game.broadcast("chat/message", this.message);

				zeroDB.insertRow(
					`data/users/${this.$store.state.siteInfo.auth_address}/data.json`,
					`data/users/${this.$store.state.siteInfo.auth_address}/content.json`,
					"chat",
					{
						date,
						text: this.message
					}
				);

				this.message = "";
				this.scroll();
			},

			async handleMessage(fromAddress, text) {
				const info = await Users.addressToInfo(fromAddress);
				const date = Date.now();
				const message = {
					certUserId: info.cert_user_id,
					username: info.username,
					me: false,
					text,
					icon: jdenticon.toSvg(fromAddress, 64),
					auth_address: fromAddress,
					date,
					ref: `message_${fromAddress}_${date}`
				};
				this.messages.push(message);
				this.messageCache[message.ref] = message;

				this.scroll();
			},

			typeRef(message) {
				this.message += `?![tc_${message.ref}]`;
			},

			textToHtml(text) {
				return text
					.replace(/&/g, "&amp;")
					.replace(/</g, "&lt;")
					.replace(/>/g, "&gt;")

					.replace(/\?!\[tc_([^\]]+)\]/g, (all, id) => {
						const rnd = "submessage_" + Math.random().toString(36).substr(2);

						(async () => {
							const message = await this.getMessage(id);
							if(message) {
								document.getElementById(rnd).innerHTML = `
									<div class="author">${message.username}</div>
									${this.textToHtml(message.text)}
								`;
							} else {
								document.getElementById(rnd).innerHTML = `
									Error getting message ${id}
								`;
							}

							this.scroll();
						})();

						return `<div class="submessage" id="${rnd}"></div>`;
					});
			},

			async getMessage(id) {
				if(this.messageCache[id]) {
					return this.messageCache[id];
				}

				let authAddress, date;
				try {
					[authAddress, date] = id.split("message_")[1].split("_");
				} catch(e) {
					return null;
				}

				return (await zeroDB.query(`
					SELECT
						chat.*,
						json.cert_user_id,
						json.username,
						json.directory
					FROM chat

					LEFT JOIN json ON (chat.json_id = json.json_id)

					WHERE json.directory = :directory AND chat.date = :date
				`, {
					directory: `users/${authAddress}`,
					date: parseInt(date)
				})).map(message => {
					message = {
						certUserId: message.cert_user_id,
						username: message.username,
						me: message.json_id === this.myJsonId,
						text: message.text,
						icon: jdenticon.toSvg(message.directory.replace("users/", ""), 64),
						auth_address: message.directory.replace("users/", ""),
						date: message.date,
						ref: `message_${message.directory.replace("users/", "")}_${message.date}`
					};
					this.messageCache[message.ref] = message;
					return message;
				})[0];
			},

			scroll() {
				setTimeout(() => {
					this.$refs.messages.scrollTop = 1000000;
				}, 0);
			}
		}
	};
</script>