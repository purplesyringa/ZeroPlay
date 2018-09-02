<template>
	<div class="game-chat" ref="messages">
		<h2>Chat</h2>

		<template v-for="message, i in messages">
			<div :class="['message', {'message-right': message.from === 'me'}]">
				<h3>{{message.title}}</h3>
				{{message.content}}
			</div>
			<div class="clearfix" />

			<div v-if="i === messages.length - 1" class="padding" />
		</template>

		<input @keyup.enter="send" v-model="message" />
		<button @click="send">&gt;</button>
	</div>
</template>

<style lang="sass" scoped>
	.game-chat
		position: fixed
		right: 0
		top: 0

		display: block
		width: 384px
		height: 100%
		overflow-y: scroll

		padding: 16px
		background-color: rgba(0, 0, 0, 0.2)
		color: #FFF

	h2
		font-weight: normal
		font-size: 24px

	.message
		margin: 8px 0
		padding: 16px
		width: 80%
		float: left

		background-color: rgba(0, 255, 255, 0.1)
		border-radius: 8px

		&.message-right
			text-align: right
			float: right
			background-color: rgba(255, 0, 0, 0.1)

		h3
			margin: 0

	.clearfix
		clear: both

	.padding
		margin-bottom: 64px

	input
		position: fixed
		bottom: 0
		right: 64px
		width: 384px - 64px

	button
		position: fixed
		bottom: 0
		right: 0
		width: 64px

		background-color: #DB6
</style>

<script type="text/javascript">
	import Users from "@/libs/users";
	import Game from "@/libs/game";
	import {zeroPage} from "@/zero";

	export default {
		name: "game-chat",
		data() {
			return {
				message: "",
				messages: [],
				myNickname: ""
			};
		},

		async mounted() {
			const siteInfo = await zeroPage.getSiteInfo();
			const authAddress = siteInfo.auth_address;

			const info = await Users.addressToInfo(authAddress);
			this.myNickname = info.username;

			const opponentInfo = await Users.addressToInfo(this.opponentAddress);
			this.opponentNickname = opponentInfo.username;

			this.off = await Game.onFrom(this.opponentAddress, `chat/${this.gameId}`, message => {
				this.messages.push({
					from: "opponent",
					title: this.opponentNickname,
					content: message
				});

				setTimeout(() => {
					this.$refs.messages.scrollTop = 10000000;
				}, 0);
			});
		},
		destroyed() {
			if(this.off) {
				this.off();
			}
		},

		computed: {
			gameId() {
				return this.$router.currentParams.gameId;
			},
			opponentAddress() {
				return this.$router.currentParams.opponentAddress;
			}
		},

		methods: {
			send() {
				this.message = this.message.trim();
				if(!this.message) {
					return;
				}

				this.messages.push({
					from: "me",
					title: this.myNickname,
					content: this.message
				});

				Game.sendTo(this.opponentAddress, `chat/${this.gameId}`, this.message);

				this.message = "";
				setTimeout(() => {
					this.$refs.messages.scrollTop = 10000000;
				}, 0);
			}
		}
	};
</script>