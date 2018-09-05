<template>
	<div v-if="!hasAvatar" v-html="jdenticonAvatar" />
	<img v-else :src="avatarSrc" :width="width || 64" :height="width || 64" />
</template>

<script type="text/javascript">
	import jdenticon from "jdenticon";
	import Users from "@/libs/users";

	export default {
		props: ["address", "width"],
		name: "user-avatar",
		data() {
			return {
				address: "",
				width: 0
			};
		},
		computed: {
			jdenticonAvatar() {
				return jdenticon.toSvg(this.address, this.width || 64);
			}
		},
		asyncComputed: {
			async hasAvatar() {
				if(!this.address) {
					return false;
				}

				const info = await Users.addressToInfo(this.address);
				return !!info.hasAvatar;
			},
			async avatarSrc() {
				const info = await Users.addressToInfo(this.address);
				return `data/users/${this.address}/avatar.${info.avatarExt}`;
			}
		}
	}
</script>