<template>
	<div class="root">
		<h2>Username</h2>
		<input v-model="username" />

		<h2>IP mode</h2>
		<select v-model="ipmode">
			<option value="ipify">Ipify (ClearNet)</option>
			<option value="broadcast">ZeroNet only (slower)</option>
		</select>

		<button @click="save">Save</button>
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

	button
		display: block
		margin: 48px auto 0
</style>

<script type="text/javascript">
	import Users from "@/libs/users";
	import {zeroPage, zeroAuth} from "@/zero";

	export default {
		name: "settings",
		data() {
			return {
				username: "",
				ipmode: ""
			};
		},

		async mounted() {
			const authAddress = this.$store.state.siteInfo.auth_address;
			const info = await Users.addressToInfo(authAddress);
			this.username = info.username;
			this.ipmode = info.ipmode || "broadcast";
		},

		methods: {
			async save() {
				await Users.setInfo({
					username: this.username,
					ipmode: this.ipmode
				});

				this.$router.navigate("play");
			}
		}
	};
</script>