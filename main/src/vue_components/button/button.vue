<template>
	<button :class="{btn: true, light}" @click="$emit('click')">
		<icon :name="icon" class="icon" />
		{{text}}
	</button>
</template>

<style lang="sass" scoped>
	@import "../../sass/media.sass"

	$color: darken(#327ACE, 5%)
	$light-color: lighten(#327ACE, 10%)

	.btn
		display: block
		width: 420px
		max-width: calc(100% - 60px)
		margin: 0 30px
		margin-top: 32px
		padding: 25px 50px 25px 110px

		position: relative

		font-family: Verdana, Arial, sans-serif
		font-size: 20px
		letter-spacing: 1px
		font-weight: 700
		color: rgba(255, 255, 255, 0.8)

		vertical-align: top
		border: none
		outline: none
		cursor: pointer
		transition: all 0.3s

		background: $color
		border-radius: 7px
		box-shadow: 0 5px darken($color, 5%)

		@include apply-to(less-than, $phone)
			font-size: 16px
			padding: 25px 50px 25px 100px

	.btn:hover
		box-shadow: 0 2px darken($color, 5%)
		margin-top: 35px
		margin-bottom: -3px

	.btn:active
		background: lighten($color, 2%)

	.icon
		position: absolute
		left: 5%
		top: 25%
		width: 20%
		height: 50%
		color: rgba(0, 0, 0, 0.2)

		@include apply-to(less-than, $phone)
			width: 15%
			height: 40%
			left: 7.5%
			top: 30%


	.light
		background: $light-color
		box-shadow: 0 5px darken($light-color, 5%)
	.light:hover
		box-shadow: 0 2px darken($light-color, 5%)
		margin-top: 35px
		margin-bottom: -3px
	.light:active
		background: darken($light-color, 5%)
	.light .icon
		color: rgba(255, 255, 255, 0.8)
</style>

<script type="text/javascript">
	export default {
		name: "zms-button",
		props: ["text", "icon", "light"]
	};
</script>