import Home from "./home/home.vue";
import Play from "./play/play.vue";
import PlayGame from "./play/play-game.vue";
import PlayWithAFriend from "./play/play-with-a-friend.vue";
import GoPlay from "./play/go-play.vue";

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
	},
	{
		path: "play/:game/with-a-friend",
		controller: () => {
			vue.currentView = PlayWithAFriend;
		}
	},
	{
		path: "play/:game/random",
		controller: () => {
			vue.currentView = GoPlay;
		}
	}
];