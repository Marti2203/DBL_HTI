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
            datasetName: null,
            listeners: {},
            fired: {}
        };
    },
    computed: {
        isHome: function() {
            return this.$router.currentRoute.path == "/" || this.$router.currentRoute.path == "/home";
        },
        login: function() {
            return this.$refs.login;
        },
        hasDatasetSelected: function() {
            return this.dataset != null;
        }
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

            if (this.dataset != null) {
                this.invoke('dataset', value);
            }
        }
    },
    methods: {
        sidebarOpen: function(pos) {
            document.getElementById(`sidebar-${pos}`).style.display = "block";
        },
        sidebarClose: function(pos) {
            document.getElementById(`sidebar-${pos}`).style.display = "none";
        },
        showDatasets: async function() {
            let data = await $.get('/datasets');
            this.datasets = typeof data == 'string' ? JSON.parse(data) : data;
            if (this.datasets.length == 1) {
                this.dataset = this.datasets[0].ID;
                this.datasetName = this.datasets[0].Name;
            }
        },
        getDataForStimulus: async function(stimulus) {
            return JSON.parse(await $.get(`/data/${this.dataset}/${stimulus}`));
        },
        getUsersForStimulus: async function(stimulus) {
            return JSON.parse(await $.get(`/participants/${this.dataset}/${stimulus}`));
        },
        getClustersForStimulus: async function(stimulus, user = null) {
            return JSON.parse(await $.get(`/clusters/${this.dataset}/${stimulus}${user ? '/'+ user : '' }`));
        },
        addListener: function(event, listener) {
            if (this.listeners[event] == null) {
                this.listeners[event] = [];
            }
            if (this.fired[event])
                listener(this.fired[event].value);
            return this.listeners[event].push(listener) - 1;
        },
        removeListener: function(event, id) {
            if (this.listeners[event] == null || this.listeners[event] == [])
                return;
            this.listeners[event].splice(id, 1);
        },
        addDatasetListener: function(listener) {
            this.addListener('dataset', listener);
        },
        invoke: function(event, data) {
            this.fired[event] = { value: data };
            if (this.listeners[event])
                this.listeners[event].forEach(listener => listener(data));
        },
        showList: function() {
            document.getElementsByClassName("dataset-list")[0].style.display = "block";
            document.getElementsByClassName("dataset-grid")[0].style.display = "none";
            document.getElementById("hide").style.display = "block";
            document.getElementById("unhide").style.display = "none";
        },

        showGrid: function() {
            document.getElementsByClassName("dataset-list")[0].style.display = "none";
            document.getElementsByClassName("dataset-grid")[0].style.display = "grid";
            document.getElementById("hide").style.display = "block";
            document.getElementById("unhide").style.display = "none";
        },

        hide: function() {
            document.getElementsByClassName("dataset-list")[0].style.display = "none";
            document.getElementsByClassName("dataset-grid")[0].style.display = "none";
            document.getElementById("hide").style.display = "none";
            document.getElementById("unhide").style.display = "block";
        },

        unhide: function(){
          document.getElementsByClassName("dataset-list")[0].style.display = "block";
          document.getElementsByClassName("dataset-grid")[0].style.display = "none";
          document.getElementById("hide").style.display = "block";
          document.getElementById("unhide").style.display = "none";
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
