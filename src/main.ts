import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/display.css";
import router from "./router";
import App from "./App.vue";
import "./assets/css/main.css";
import { useReviewStore } from "./stores/review";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(ElementPlus);

app.mount("#app");

// 初始化路由监听
const reviewStore = useReviewStore();
reviewStore.initRouteListener(router);
