<template>
	<div v-html="jdenticonAvatar" />
</template>

<script type="text/javascript">
	import jdenticon from "jdenticon";

	export default {
		props: ["address"],
		name: "user-avatar",
		data() {
			return {
				address: ""
			};
		},
		computed: {
			jdenticonAvatar() {
				return jdenticon.toSvg(this.address, 64);
			}
		}
	}
</script>