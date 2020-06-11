"use strict";
// 2. Define some routes
// Each route should map to a component. The "component" can
// either be an actual component constructor created via
// `Vue.extend()`, or just a component options object.
// We'll talk about nested routes later.
const routes = [
    { name: 'Heatmap', path: '/heatmap', component: Heatmap },
    { name: 'ScatterPlot', path: '/scatterPlot', component: ScatterPlot },
    { name: 'GazePlot', path: '/gazePlot', component: GazePlot },
    { name: 'GazeStripes', path: '/gazeStripes', component: GazeStripes },
    { name: 'Upload', path: '/upload', component: Uploader },
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
            fired: {},
            datasetsHidden: false,
            datasetsLayout: 'list',
            sidebarComponents: new Map(),
            isHome: false,
        };
    },
    computed: {
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
                this.loadDatasets();
            } else {
                if (this.$router.currentRoute.path != '/') {
                    this.$router.push('/');
                }
                this.datasets = [];
                this.dataset = null;
            }
        },
        dataset: function(value) {
            this.datasetName = (value == null || this.datasets == undefined || this.datasets.length == 0) ? null : this.datasets.filter(d => d.ID == value)[0].Name;

            if (value !== null && value !== undefined) {
                this.invoke('dataset', value);
            }
        },

        datasetsLayout: function(value) {
            if (value == "block") {
                if (Array.from(document.getElementsByClassName("single-dataset")) != null) {
                    Array.from(document.getElementsByClassName("single-dataset")).forEach(element => {
                        element.style.height = "60px";
                        element.style.width = "80%";
                    });
                }
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
        loadDatasets: async function() {
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
        invoke: async function(event, data) {
            this.fired[event] = { value: data };
            if (this.listeners[event])
                for (let listener of this.listeners[event]) {
                    await listener(data);
                }
        },
        showGrid: function() {
            this.datasetsLayout = "grid";
            Array.from(document.getElementsByClassName("single-dataset")).forEach(element => {
                element.style.height = "100px";
                element.style.width = "auto";
            });
        },
        download: function(name) {
            let path = `download/${name}`;
            window.location.href = path;
        },
        requestSidebarComponent: function(componentType, identifier, onCreated, predicate = () => true) {
            if (!this.sidebarComponents.has(identifier)) {
                this.sidebarComponents.set(identifier, { type: componentType, predicate });
            }
            this.addListener(`created-${identifier}`, onCreated);
        },
        createdComponent: function(identifier, instance) {
            this.invoke(`created-${identifier}`, instance);
        }
    }
}).$mount('#app');

router.beforeEach((to, from, next) => {
    if (to.path == '/' || to.path == '/home') {
        app.isHome = true;
        next();
    } else {
        app.isHome = false;
        if (app && app.loggedIn) {
            next();
        } else {
            next(false);
        }
    }
});