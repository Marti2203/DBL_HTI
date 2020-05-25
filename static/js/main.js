"use strict";
// 2. Define some routes
// Each route should map to a component. The "component" can
// either be an actual component constructor created via
// `Vue.extend()`, or just a component options object.
// We'll talk about nested routes later.
const routes = [
    { path: '/upload', component: Uploader },
    { path: '/scatterPlot', component: ScatterPlot },
    { path: '/gazePlot', component: GazePlot },
    { path: '/heatmap', component: Heatmap },
    { path: '/gazeStripes', component: GazeStripes },
];

const router = new VueRouter({
    routes // short for `routes: routes`
});
const app = new Vue({
    router
}).$mount('#app');
