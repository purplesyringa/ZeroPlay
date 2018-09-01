<template>
	<div class="root">
		<!-- Game list -->
		<div class="groups">
			<a @click="$router.navigate('play')" class="back">Choose another game</a>

			<span>With whom are you going to play?</span>
			<input v-model="username" placeholder="Choose username" />
			<button>Play</button>
		</div>
	</div>
</template>

<style lang="sass" scoped>
	.root
		width: 100%
		height: 100%
		font-size: 0

		background-color: #B12

	.groups
		width: 100%
		position: absolute
		top: 50%
		transform: translateY(-50%)
		text-align: center

		.back
			color: #FFF
			font-size: 20px
			text-decoration: underline
			text-align: center
			cursor: pointer

			position: absolute
			left: 0
			width: 100%
			margin-top: -64px

		span
			color: #FFF
			font-size: 20px
			text-align: center
			cursor: pointer

		input, button
			display: block
			margin: 16px auto 0
			font-size: 16px
</style>

<script type="text/javascript">
	export default {
		name: "play",

		computed: {
			game() {
				return this.$router.currentParams.game;
			}
		}
	};
</script>