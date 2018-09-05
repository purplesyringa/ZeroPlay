<template>
	<div class="chat--chat">
		<a class="back" @click="$router.navigate('play')">&lt; Back</a>

		<div class="middle">
			<header>
				0Play Chat

				<div :class="['follow', {following}]" @click="follow">
					<icon name="share-alt" />
					<template v-if="following">
						Following
					</template>
					<template v-else>
						Follow
					</template>
				</div>
			</header>

			<main ref="messages" @scroll="scrolled">
				<template v-for="message in cMessages">
					<article :class="{right: message.me, compact: message.compact, 'last-compact': message.lastCompact}" :ref="message.ref" :key="message.ref">
						<div class="logo" v-html="message.icon" />
						<div class="author" v-if="!message.me" @click="typeMenion(message)">{{message.username}}</div>
						<div v-html="message.html" />
						<div class="date">
							<a @click="typeRef(message)">{{(new Date(message.date)).toLocaleString()}}</a>
						</div>
					</article>
					<div class="clearfix" :key="'clearfix_' + message.ref" />
				</template>

				<template v-if="currentlyTyping.length === 1">
					<div class="typing">
						{{currentlyTyping[0].username}} is typing...
					</div>
				</template>
				<template v-else-if="currentlyTyping.length > 1">
					<div class="typing">
						{{currentlyTyping.map(user => user.username).join(", ")}} are typing...
					</div>
				</template>
				<div class="typing" v-else />
			</main>

			<div class="input-container">
				<label class="like-button">
					<icon name="image" class="icon" />
					<input type="file" @change="insertImage" />
				</label>
				<autosize-textarea v-model="message" placeholder="Type here" @keydown.native.enter="submit" />
			</div>
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

			display: flex
			flex-direction: column

		header
			padding: 16px 0
			text-align: center
			font-size: 24px
			height: 64px
			position: relative

			background-color: rgba(0, 0, 0, 0.5)
			box-shadow: 0 4px 4px rgba(0, 0, 0, 0.1)
			color: #DB6

			.follow
				padding: 8px 16px
				background-color: rgba(0, 255, 255, 0.2)
				cursor: pointer
				border-radius: 8px

				position: absolute
				top: 14px
				right: 16px

				color: #FFF
				font-size: 16px

				&.following
					background-color: rgba(255, 127, 0, 0.2)


		main
			background-color: rgba(0, 0, 0, 0.2)

			overflow-x: hidden
			overflow-y: scroll

			flex: 1

			&::-webkit-scrollbar
				background-color: rgba(185, 185, 185, 0.2)
				border-radius: 4px
			&::-webkit-scrollbar-thumb
				background-color: rgba(0, 0, 0, 0.5)
				border-radius: 4px

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
					display: none
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

				&.compact
					margin-top: -12px
					.logo
						display: none
					&::before
						display: none
					.author
						display: none
				&.last-compact
					.date
						display: block

			.submessage
				padding: 16px
				margin: 16px 0
				background-color: rgba(0, 0, 0, 0.2)

			article, .submessage
				.author
					color: #DB6
					margin-bottom: 16px
					cursor: pointer

				pre
					display: block
					padding: 16px
					background-color: rgba(0, 0, 0, 0.2)
					font-family: monospace

				h2
					font-size: 20px
				h1
					font-size: 28px

				img
					max-width: 100%

				code
					padding: 8px
					background-color: rgba(0, 0, 0, 0.2)
					font-family: monospace

				blockquote
					margin-left: 0
					border-left: 4px solid rgba(255, 255, 255, 0.2)
					padding-left: 32px
					padding-top: 0.1px
					padding-bottom: 0.1px

			.typing
				padding: 16px
				height: 64px
				margin-left: 64px + 16px
				font-size: 16px
				color: #DB6

		.clearfix
			clear: both


		.input-container
			display: flex
			flex-direction: row
			align-items: stretch

			.like-button
				display: inline-flex
				width: 56px
				vertical-align: top
				justify-content: center
				align-items: center

				.icon
					width: 24px
					height: 24px

			input[type=file]
				position: fixed
				left: -10000px

			textarea
				width: calc(100% - 56px)
				padding: 16px
				font-size: 16px
				height: 56px
				resize: none
				vertical-align: top

				background-color: rgba(0, 0, 0, 0.5)
				box-shadow: 0 -4px 4px rgba(0, 0, 0, 0.1)
				color: #FFF

				transition: none
</style>

<script type="text/javascript">
	import Users from "@/libs/users";
	import Game from "@/libs/game";
	import jdenticon from "jdenticon";
	import {zeroPage, zeroDB, zeroFS} from "@/zero";
	import marked from "marked";
	import "vue-awesome/icons/share-alt";
	import "vue-awesome/icons/image";
	import autosize from "autosize";
	import hljs from "highlightjs";
	import "highlightjs/styles/railscasts.css";
	import stringReplaceAsync from "string-replace-async";

	let messageCache = {};

	const PAGE_SIZE = 20;

	export default {
		name: "chat",
		data() {
			return {
				message: "",
				messages: [],
				typing: false,
				currentlyTyping: [],
				lastPing: {},
				username: "",
				following: false,
				pageHeights: []
			};
		},

		async mounted() {
			if(!(await Users.isRegistered())) {
				this.$router.navigate("");
				return;
			}

			const feedList = await zeroPage.cmd("feedListFollow");
			this.following = !!feedList.Chat;

			const authAddress = this.$store.state.siteInfo.auth_address;
			this.username = (await Users.addressToInfo(authAddress)).username;

			this.off = await Game.onBroadcast("chat/message", this.handleMessage.bind(this));
			this.off2 = await Game.onBroadcast("chat/ping", this.handlePing.bind(this));
			this.interval = setInterval(() => {
				Game.broadcast("chat/ping", {typing: this.typing, username: this.username});
				this.currentlyTyping = this.currentlyTyping.filter(({address}) => {
					return Date.now() - this.lastPing[address] <= 10000;
				});
			}, 5000);

			this.myJsonId = await zeroDB.getJsonID(`users/${authAddress}/data.json`, 2);

			this.$nextTick(() => {
				this.queryOldMessages();
			});

			window.loadImageChat = this.loadImageChat;
		},
		destroyed() {
			if(this.off) {
				this.off();
			}
			if(this.interval) {
				clearInterval(this.interval);
			}
			delete window.loadImageChat;
		},

		methods: {
			async submit(e) {
				if(e.shiftKey) {
					return;
				}

				e.preventDefault();

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
					html: await this.textToHtml(this.message),
					icon: jdenticon.toSvg(this.$store.state.siteInfo.auth_address, 64),
					auth_address: this.$store.state.siteInfo.auth_address,
					date,
					ref: `message_${this.$store.state.siteInfo.auth_address}_${date}`
				};
				this.messages.push(message);
				messageCache[message.ref] = message;

				Game.broadcast("chat/message", {
					text: this.message,
					date
				});

				zeroDB.insertRow(
					`data/users/${this.$store.state.siteInfo.auth_address}/data.json`,
					`data/users/${this.$store.state.siteInfo.auth_address}/content.json`,
					"chat",
					{
						date,
						text: this.message
					}
				);

				setTimeout(() => {
					this.message = "";
				}, 1);
				this.scroll();
			},

			async handleMessage(fromAddress, {text, date}) {
				const info = await Users.addressToInfo(fromAddress);
				const message = {
					certUserId: info.cert_user_id,
					username: info.username,
					me: false,
					text,
					html: await this.textToHtml(text),
					icon: jdenticon.toSvg(fromAddress, 64),
					auth_address: fromAddress,
					date,
					ref: `message_${fromAddress}_${date}`
				};
				this.messages.push(message);
				messageCache[message.ref] = message;

				this.scroll();
			},

			handlePing(fromAddress, {typing, username}) {
				this.currentlyTyping = this.currentlyTyping.filter(({address}) => {
					if(address === fromAddress) {
						return typing;
					} else {
						return true;
					}
				});
				if(typing && !this.currentlyTyping.find(user => user.address === fromAddress)) {
					this.currentlyTyping.push({
						address: fromAddress,
						username
					});
				}
				this.scroll();
				this.lastPing[fromAddress] = Date.now();
			},

			typeRef(message) {
				this.message += `?![tc_${message.ref}]`;
			},
			typeMenion(message) {
				this.message += `@${message.username} `;
			},

			async textToHtml(text) {
				console.log("textToHtml()");
				const html = await stringReplaceAsync(
					marked(text, {
						highlight: (code, lang) => {
							try {
								return lang ? hljs.highlight(lang, code).value : hljs.highlightAuto(code).value;
							} catch(e) {
								return hljs.highlightAuto(code).value;
							}
						}
					}),
					/\?!\[tc_([^\]]+)\]/g,
					async (all, id) => {
						console.log("Message quote", id);
						const message = await this.getMessage(id);
						if(message) {
							return `
								<div class="submessage">
									<div class="author">${message.username}</div>
									${await this.textToHtml(message.text)}
								</div>
							`;
						} else {
							return `
								<div class="submessage">
									Error getting message ${id}
								</div>
							`;
						}
					});

				const node = document.createElement("div");
				node.innerHTML = html;
				for(const image of node.querySelectorAll("img")) {
					console.log("Image", image.getAttribute("src"));
					if(image.getAttribute("src").startsWith("data/users/")) {
						// It's local file
						console.log("Reading", image.getAttribute("src"));
						if((await zeroPage.cmd("siteInfo", [image.getAttribute("src")])).event) {
							// Already downloaded
							console.log("Already downloaded", image.getAttribute("src"));
							continue;
						}
					}

					console.log("Adding link", image.getAttribute("src"));
					const loadImage = document.createElement("div");
					loadImage.innerHTML = `
						<button onclick="window.loadImageChat(event.target)" data-src="${image.src}">Load image ${image.alt}</button>
					`;
					image.parentNode.replaceChild(loadImage, image);
				}

				return node.innerHTML;
			},

			async getMessage(id) {
				if(messageCache[id]) {
					return messageCache[id];
				}

				let authAddress, date;
				try {
					[authAddress, date] = id.split("message_")[1].split("_");
				} catch(e) {
					return null;
				}

				return (await Promise.all((await zeroDB.query(`
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
				})).map(async message => {
					message = {
						certUserId: message.cert_user_id,
						username: message.username,
						me: message.json_id === this.myJsonId,
						text: message.text,
						html: await this.textToHtml(message.text),
						icon: jdenticon.toSvg(message.directory.replace("users/", ""), 64),
						auth_address: message.directory.replace("users/", ""),
						date: message.date,
						ref: `message_${message.directory.replace("users/", "")}_${message.date}`
					};
					messageCache[message.ref] = message;
					return message;
				})))[0];
			},

			scroll() {
				const dist = Math.abs(
					this.$refs.messages.scrollTop +
					document.body.offsetHeight -
					this.$refs.messages.scrollHeight
				);
				if(dist < 128) {
					setTimeout(() => {
						this.$refs.messages.scrollTop = 1000000;
					}, 0);
				}
			},

			sendTyping(typing) {
				this.typing = typing;
				Game.broadcast("chat/ping", {typing, username: this.username});
				this.scroll();
			},

			async follow() {
				const feedList = await zeroPage.cmd("feedListFollow");
				if(feedList.Chat) {
					delete feedList.Chat;
					this.following = false;
				} else {
					feedList.Chat = [`
						SELECT
							"@" || json.username || ": " || chat.text AS body,
							chat.date AS date_added,
							"comment" AS type,
							"?/chat" AS url,
							"0Play Chat" AS title
						FROM chat

						LEFT JOIN json ON (chat.json_id = json.json_id)
					`, []];
					this.following = true;
				}
				await zeroPage.cmd("feedFollow", [feedList]);
			},

			async queryOldMessages() {
				console.log("query");

				const lastMessageTimestamp = this.messages.reduce((a, b) => Math.min(a, b.date), Infinity);

				const newMessages = await Promise.all((await zeroDB.query(`
					SELECT
						chat.*,
						json.cert_user_id,
						json.username,
						json.directory
					FROM chat

					LEFT JOIN json ON (chat.json_id = json.json_id)

					${lastMessageTimestamp === Infinity ? "" : "WHERE chat.date < :before"}

					ORDER BY chat.date DESC

					LIMIT ${PAGE_SIZE}
				`, {
					before: lastMessageTimestamp
				})).reverse().map(async message => {
					return {
						certUserId: message.cert_user_id,
						username: message.username,
						me: message.json_id === this.myJsonId,
						text: message.text,
						html: await this.textToHtml(message.text),
						icon: jdenticon.toSvg(message.directory.replace("users/", ""), 64),
						auth_address: message.directory.replace("users/", ""),
						date: message.date,
						ref: `message_${message.directory.replace("users/", "")}_${message.date}`
					};
				}));

				const oldScrollBottom = this.$refs.messages.scrollHeight - this.$refs.messages.scrollTop;
				const oldScrollHeight = this.messages.length === 0 ? 0 : this.$refs.messages.scrollHeight;

				this.messages = newMessages.concat(this.messages);

				this.$nextTick(() => {
					this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight - oldScrollBottom;
					this.pageHeights.push(this.$refs.messages.scrollHeight - oldScrollHeight);

					if(this.$router.currentParams.id) {
						const node = this.$refs[this.$router.currentParams.id][0];
						this.$router.navigate("chat");
						node.scrollIntoView();
					}
				});
			},

			removeOldMessages() {
				if(this.messages.length <= PAGE_SIZE) {
					return;
				}

				this.messages = this.messages.slice(PAGE_SIZE);
				const oldScrollTop = this.$refs.messages.scrollTop;

				this.$nextTick(() => {
					this.$refs.messages.scrollTop = oldScrollTop - this.pageHeights.pop();

					if(this.$router.currentParams.id) {
						const node = this.$refs[this.$router.currentParams.id][0];
						this.$router.navigate("chat");
						node.scrollIntoView();
					}
				});
			},

			scrolled() {
				if(this.$refs.messages.scrollTop < 512) {
					this.queryOldMessages();
				} else if(this.pageHeights.slice(-1)[0] - this.$refs.messages.scrollTop < -512) {
					this.removeOldMessages();
				}
			},

			async insertImage(e) {
				const file = e.target.files[0];
				if(!file) {
					return;
				}

				let ext = file.name.split(".").slice(-1)[0];
				if(ext.toLowerCase() === "gz") {
					// e.g. tar.gz or json.gz
					ext = file.name.split(".").slice(-2).join(".");
				}
				if(!["png", "gif", "jpeg", "jpg"].includes(ext)) {
					zeroPage.alert("You can only upload PNG, GIF and JP[E]G files.");
					return;
				}

				// File to ArrayBuffer
				const arrayBuffer = await new Promise((resolve, reject) => {
					const fr = new FileReader();
					fr.onload = () => {
						resolve(fr.result);
					};
					fr.onerror = e => {
						reject(e);
					};
					fr.readAsArrayBuffer(file);
				});

				// Generate ID
				let id = "";
				id += Math.random().toString(36).substr(2);
				id += Math.random().toString(36).substr(2);
				id += Math.random().toString(36).substr(2);

				// Write to disk
				const directory = `data/users/${this.$store.state.siteInfo.auth_address}`;
				await zeroFS.writeFile(
					`${directory}/${id}.${ext}`,
					arrayBuffer,
					"arraybuffer"
				);
				const contentJson = JSON.parse(await zeroFS.readFile(`${directory}/content.json`));
				contentJson.optional = ".*[.]png|.*[.]gif|.*[.]jpeg|.*[.]jpg|.*[.]piecemap[.]msgpack";
				await zeroFS.writeFile(`${directory}/content.json`, JSON.stringify(contentJson, null, 1));
				await zeroPage.publish(
					`${directory}/content.json`
				);

				// Insert
				this.message += `![alt text](${directory}/${id}.${ext})`;
			},

			loadImageChat(target) {
				const oldScrollHeight = this.$refs.messages.scrollHeight;

				const img = document.createElement("img");
				img.src = target.getAttribute("data-src");
				target.parentNode.replaceChild(img, target);

				setTimeout(() => {
					this.pageHeights[this.pageHeights.length - 1] += this.$refs.messages.scrollHeight - oldScrollHeight;
				}, 0);
			}
		},

		watch: {
			message(newValue, oldValue) {
				if(newValue && !oldValue) {
					this.sendTyping(true);
				} else if(oldValue && !newValue) {
					this.sendTyping(false);
				}
			}
		},

		computed: {
			cMessages() {
				return this.messages
					.map((message, i) => {
						return Object.assign({
							compact: i > 0 && message.auth_address === this.messages[i - 1].auth_address && message.date - this.messages[i - 1].date < 5 * 60 * 1000
						}, message);
					})
					.map((message, i, messages) => {
						return Object.assign({
							lastCompact: i === messages.length - 1 || !messages[i + 1].compact
						}, message);
					});
			}
		},

		components: {
			"autosize-textarea": {
				props: ["value"],
				template: `<textarea @input="input">{{value}}</textarea>`,
				methods: {
					input(e) {
						this.value = this.$el.value;
						this.$emit("input", this.value);
					}
				},
				mounted() {
					autosize(this.$el);
				},
				watch: {
					value(newValue) {
						this.$el.value = newValue;
						setTimeout(() => {
							autosize.update(this.$el);
						}, 1);
					}
				}
			}
		}
	};
</script>