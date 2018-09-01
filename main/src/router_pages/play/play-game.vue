<template>
	<div class="root">
		<!-- Game list -->
		<div class="groups">
			<a @click="$router.navigate('play')" class="back">Choose another game</a>

			<div class="group" @click="$router.navigate(`play/${game}/with-a-friend`)">
				<img src="@/assets/with-a-friend.png" />
				<h2>Friend</h2>
			</div>

			<div class="group" @click="$router.navigate(`play/${game}/random`)">
				<img src="@/assets/random.png" />
				<h2>Random opponent</h2>
			</div>
		</div>

		<div class="credits">
			Icons by <a href="https://www.iconfinder.com/dinosoftlabs">Dinosoft Labs</a>
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
			font-size: 16px
			color: #FFF
			font-size: 20px
			text-decoration: underline
			text-align: center
			cursor: pointer

			position: absolute
			left: 0
			width: 100%
			margin-top: -32px

		.group
			display: inline-block
			width: 208px
			height: 256px
			padding: 32px 0
			margin: 16px
			border-radius: 16px
			background-color: #FFF
			box-shadow: 0 16px 16px rgba(0, 0, 0, 0.3)
			vertical-align: top

			text-align: center
			cursor: pointer

			img
				width: 128px
				height: 128px

			h2
				font-size: 32px
				line-height: 32px
				margin-top: 8px
				font-weight: normal

	.credits
		position: absolute
		left: 0
		bottom: 16px

		width: 100%
		text-align: center

		font-size: 20px
		color: #FFF

		a
			color: inherit
</style>

<script type="text/javascript">
	export default {
		name: "play-game",

		computed: {
			game() {
				return this.$router.currentParams.game;
			}
		}
	};
</script>