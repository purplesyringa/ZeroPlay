import Home from "./home/home.vue";
import Play from "./play/play.vue";
import PlayGame from "./play/play-game.vue";

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
	},
	{
		path: "play/:game",
		controller: () => {
			vue.currentView = PlayGame;
		}
	}
];