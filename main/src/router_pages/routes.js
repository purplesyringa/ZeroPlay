import Home from "./home/home.vue";
import Play from "./play/play.vue";
import PlayGame from "./play/play-game.vue";
import PlayWithAFriend from "./play/play-with-a-friend.vue";
import PlayWithRandom from "./play/play-with-random.vue";
import TicTacToe from "./games/tic-tac-toe/tic-tac-toe.vue";
import Chess from "./games/chess/chess.vue";

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
			vue.currentView = PlayWithRandom;
		}
	},

	{
		path: "play/tic-tac-toe/:mode/:opponentAddress/:gameId/first",
		controller: () => {
			vue.$router.currentParams.first = true;
			vue.$router.currentParams.second = false;
			vue.currentView = TicTacToe;
		}
	},
	{
		path: "play/tic-tac-toe/:mode/:opponentAddress/:gameId/second",
		controller: () => {
			vue.$router.currentParams.first = false;
			vue.$router.currentParams.second = true;
			vue.currentView = TicTacToe;
		}
	},

	{
		path: "play/chess/:mode/:opponentAddress/:gameId/first",
		controller: () => {
			vue.$router.currentParams.first = true;
			vue.$router.currentParams.second = false;
			vue.currentView = Chess;
		}
	},
	{
		path: "play/chess/:mode/:opponentAddress/:gameId/second",
		controller: () => {
			vue.$router.currentParams.first = false;
			vue.$router.currentParams.second = true;
			vue.currentView = Chess;
		}
	}
];