<template>
	<div class="root">
		<h2>Username</h2>
		<input v-model="username" />

		<h2>IP mode</h2>
		<select v-model="ipmode">
			<option value="ipify">Ipify (ClearNet)</option>
			<option value="broadcast">ZeroNet only (slower)</option>
		</select>

		<h2>Avatar</h2>
		<input type="file" ref="avatar" @change="addAvatarFile" />
		<button @click="removeAvatar" v-if="hasAvatar">Remove</button>

		<button class="save" @click="save">Save</button>
	</div>
</template>

<style lang="sass" scoped>
	.root
		width: 100%

		position: absolute
		top: 50%
		transform: translateY(-50%)

		text-align: center

	h2
		color: #FFF
		font-weight: normal
		font-size: 20px
		margin: 32px 0 16px

	.save
		display: block
		margin: 48px auto 0
</style>

<script type="text/javascript">
	import Users from "@/libs/users";
	import {zeroPage, zeroFS} from "@/zero";

	export default {
		name: "settings",
		data() {
			return {
				username: "",
				ipmode: "",
				hasAvatar: false,
				avatarExt: ""
			};
		},

		async mounted() {
			const authAddress = this.$store.state.siteInfo.auth_address;
			const info = await Users.addressToInfo(authAddress);
			this.username = info.username;
			this.ipmode = info.ipmode || "broadcast";
			this.hasAvatar = info.hasAvatar || false;
			this.avatarExt = info.avatarExt || "";
		},

		methods: {
			async save() {
				if(this.hasAvatar) {
					const file = this.$refs.avatar.files[0];
					if(file) {
						let ext = file.name.split(".").slice(-1)[0];
						if(ext === "gz") {
							// E.g. tar.gz or json.gz
							ext = file.name.split(".").slice(-2).join(".");
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

						// Write to disk
						const directory = `data/users/${this.$store.state.siteInfo.auth_address}`;
						await zeroFS.writeFile(
							`${directory}/avatar.${ext}`,
							arrayBuffer,
							"arraybuffer"
						);
						const contentJson = JSON.parse(await zeroFS.readFile(`${directory}/content.json`));
						contentJson.optional = ".*[.]png|.*[.]gif|.*[.]jpeg|.*[.]jpg|.*[.]piecemap[.]msgpack";
						await zeroFS.writeFile(`${directory}/content.json`, JSON.stringify(contentJson, null, 1));
					}
				}

				await Users.setInfo({
					username: this.username,
					ipmode: this.ipmode,
					hasAvatar: this.hasAvatar,
					avatarExt: this.avatarExt
				});

				this.$router.navigate("play");
			},

			removeAvatar() {
				this.hasAvatar = false;
				this.$refs.avatar.value = "";
			},

			addAvatarFile() {
				const file = this.$refs.avatar.files[0];
				if(file) {
					this.hasAvatar = true;
					const ext = file.name.split(".").slice(-1)[0].toLowerCase();
					if(!["png", "gif", "jpeg", "jpg"].includes(ext)) {
						zeroPage.alert("You can only use PNG, GIF and JP[E]G files for avatar");
						this.removeAvatar();
						return;
					}
					this.avatarExt = ext;
				} else {
					this.hasAvatar = false;
				}
			}
		}
	};
</script>