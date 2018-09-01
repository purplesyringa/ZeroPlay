import Home from "./home/home.vue";
import Play from "./play/play.vue";

export default vue => [
	{
		path: "",
		controller: () => {
			vue.currentView = Home;
		}
	},

	{
		path: "play",
		controller: () => {
			vue.currentView = Play;
		}
	}
];