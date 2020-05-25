"use strict";
// 2. Define some routes
// Each route should map to a component. The "component" can
// either be an actual component constructor created via
// `Vue.extend()`, or just a component options object.
// We'll talk about nested routes later.
const routes = [
    { name: 'Upload', path: '/upload', component: Uploader },
    { name: 'ScatterPlot', path: '/scatterPlot', component: ScatterPlot },
    { name: 'GazePlot', path: '/gazePlot', component: GazePlot },
    { name: 'Heatmap', path: '/heatmap', component: Heatmap },
    { name: 'GazeStripes', path: '/gazeStripes', component: GazeStripes },
];

const router = new VueRouter({
    routes // short for `routes: routes`
});

const app = new Vue({
    router,
    data: function() {
        return {
            loggedIn: false
        };
    },
    computed: {
        login: function() {
            return this.$refs.login;
        },
    },
    watch: {
        loggedIn: function(value) {
            this.loggedIn = value;
            this.$router.push('/');
        }
    },
    methods: {
        sidebarOpen: function() {
            document.getElementById("sidebar").style.display = "block";
        },
        sidebarClose: function() {
            document.getElementById("sidebar").style.display = "none";
        }
    }
}).$mount('#app');

router.beforeEach((to, from, next) => {
    if (to.path == '/' || to.path == '/home') {
        next();
    } else {
        if (app.loggedIn) {
            next();
        } else {
            next(false);
        }
    }
});