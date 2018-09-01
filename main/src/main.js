import "./sass/main.sass";

import Vue from "vue/dist/vue.min.js";

import AsyncComputed from "vue-async-computed";
Vue.use(AsyncComputed);

import Icon from "vue-awesome/components/Icon.vue";
Vue.component("icon", Icon);

Vue.prototype.$eventBus = new Vue();

import Vuex, {mapState} from "vuex";
Vue.use(Vuex);
const store = new Vuex.Store({
	state: {
		siteInfo: {
			settings: {
				own: false
			}
		}
	},
	mutations: {
		setSiteInfo(state, siteInfo) {
			state.siteInfo = siteInfo;
		}
	},
	computed: mapState([
		"siteInfo"
	])
});

import root from "./vue_components/root.vue";
var app = new Vue({
	el: "#app",
	render: h => h(root),
	data: {
		currentView: null
	},
	store
});

import {route} from "./route.js";
import {zeroPage} from "./zero";
route(app);

Vue.prototype.$zeroPage = zeroPage;

(async function() {
	const siteInfo = await zeroPage.getSiteInfo();
	app.$eventBus.$emit("setSiteInfo", siteInfo);
	store.commit("setSiteInfo", siteInfo);
})();
zeroPage.on("setSiteInfo", msg => {
	app.$eventBus.$emit("setSiteInfo", msg.params);
	store.commit("setSiteInfo", msg.params);
});