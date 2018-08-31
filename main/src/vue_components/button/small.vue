<template>
	<button class="btn" @click="$emit('click')">
		<icon :name="icon" class="icon" />
		{{text}}
	</button>
</template>

<style lang="sass" scoped>
	$color: darken(#327ACE, 5%)

	.btn
		display: inline-block
		float: right
		padding: 12px 16px

		font-family: Verdana, Arial, sans-serif
		font-size: 16px
		color: #FFF

		border: none
		outline: none
		cursor: pointer
		transition: all 0.3s

		background: $color
		border-radius: 7px
		box-shadow: 0 5px darken($color, 5%)

	.btn:hover
		box-shadow: 0 2px darken($color, 5%)
		margin-top: 3px
		margin-bottom: -3px

	.btn:active
		background: lighten($color, 5%)
</style>

<script type="text/javascript">
	export default {
		name: "zms-button",
		props: ["text", "icon"]
	};
</script>