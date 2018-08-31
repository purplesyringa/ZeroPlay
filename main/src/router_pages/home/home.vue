<template>
	<div class="root">
		<h1>
			<span class="zero">Zer0</span>
			<span class="p">P</span>
			<span class="l">l</span>
			<span class="a">a</span>
			<span class="y">y</span>
		</h1>
		<h2>
			Game Center
		</h2>
	</div>
</template>

<style lang="sass" scoped>
	.root
		width: 100%

		position: absolute
		top: 50%
		transform: translateY(-50%)

	h1
		font-weight: bold
		text-align: center
		font-size: 0

		span
			font-size: 64px
			line-height: 48px

		.zero
			color: #BBB
		.p
			color: #68F
		.l
			color: #F66
		.a
			color: #DB6
		.y
			color: #6B6

	h2
		font-weight: normal
		text-align: center
		font-size: 32px
		line-height: 0
		color: #B6B
</style>

<script type="text/javascript">
	export default {
		name: "home"
	};
</script>