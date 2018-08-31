<template>
	<header @click="$router.navigate('')">
		<h1>ZMS</h1>
		<h2>Zero Management System &mdash; First CMS for ZeroNet</h2>
	</header>
</template>

<style lang="sass" scoped>
	@import "../../sass/media.sass"

	header
		background-color: #327ACE
		padding: 32px 256px
		cursor: pointer

		@include apply-to(less-than, 1280px)
			padding: 32px 8px
			text-align: center

	h1, h2
		display: inline-block
		margin: 0

		font-size: 32px
		font-family: Lobster, Verdana, Arial, sans-serif

	h1
		width: 128px
		color: #FFF
	h2
		color: rgba(255, 255, 255, 0.7)
</style>

<script type="text/javascript">
	import "vue-awesome/icons/brands/github";
	import "vue-awesome/icons/comment-alt";

	export default {
		name: "zms-small-header",

		methods: {
			go(url) {
				window.top.location.href = url;
			}
		}
	};
</script>