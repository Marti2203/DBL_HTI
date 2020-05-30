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
            loggedIn: false,
            datasets: [],
            dataset: null,
            datasetName: null
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
            if (this.loggedIn) {
                this.showDatasets();
            } else {
                if (this.$router.currentRoute.path != '/') {
                    this.$router.push('/');
                }
                this.datasets = [];
                this.dataset = null;
            }
        },
        dataset: function(value) {
            this.dataset = value;
            this.datasetName = (value == null || this.datasets == undefined || this.datasets.length == 0) ? null : this.datasets.filter(d => d.ID == value)[0].Name;
        }
    },
    methods: {
        sidebarOpen: function() {
            document.getElementById("sidebar").style.display = "block";
        },
        sidebarClose: function() {
            document.getElementById("sidebar").style.display = "none";
        },
        showDatasets: async function() {
            let data = await $.get('/datasets');
            this.datasets = typeof data == 'string' ? JSON.parse(data) : data;
            if (this.datasets.length == 1) {
                this.dataset = this.datasets[0].ID;
                this.datasetName = this.datasets[0].Name;
            }
        }
    }
}).$mount('#app');

router.beforeEach((to, from, next) => {
    if (to.path == '/' || to.path == '/home') {
        next();
    } else {
        if (app && app.loggedIn) {
            next();
        } else {
            next(false);
        }
    }
});