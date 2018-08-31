<template>
	<div class="file">
		<input type="file" @change="changed" :id="id" class="input">
		<label :for="id">
			<div class="like-input">
				<span v-if="name">{{name}}</span>
				<span v-else-if="error" class="error">{{error}}</span>
				<span v-else class="placeholder">{{placeholder}}</span>

				<icon class="icon" name="file" />
			</div>
		</label>
	</div>
</template>

<style lang="sass" scoped>
	.input
		position: absolute
		left: -10000px


	.like-input
		cursor: pointer

	.placeholder
		color: #888
	.icon
		float: right
		color: #CCC

	.error
		color: #CE3232
</style>

<script type="text/javascript">
	import "vue-awesome/icons/file";

	export default {
		name: "zms-file-input",
		props: ["placeholder", "error"],
		data() {
			return {
				placeholder: "",
				error: "",
				id: "zmsfileinput" + Math.random().toString(36).substr(2),
				value: null,
				name: ""
			};
		},

		mounted() {
			this.$on("error", this.onError);
		},
		destroyed() {
			this.$off("error", this.onError);
		},

		methods: {
			changed(e) {
				this.value = e.target.files[0];
				this.name = this.value ? this.value.name : "";
				this.error = "";
				this.$emit("input", this.value);
			},

			onError(e) {
				this.$nextTick(() => {
					this.name = "";
					this.error = e;
				});
			}
		}
	};
</script>