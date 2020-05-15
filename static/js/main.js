"use strict";
// 2. Define some routes
// Each route should map to a component. The "component" can
// either be an actual component constructor created via
// `Vue.extend()`, or just a component options object.
// We'll talk about nested routes later.
const routes = [
    { path: '/upload', component: UploadDemo },
    { path: '/scatterPlot', component: ScatterPlot },
    { path: '/gazePlot', component: GazePlot },
    { path: '/heatmap', component: Heatmap },
    { path: '/gazeStripes', component: GazeStripes },
];

const router = new VueRouter({
    routes // short for `routes: routes`
});
const app = new Vue({
    router,
    data: { loggedIn: false, username: "", password: "", signedUp: false, newUsername: "", newPassword: "", rptPassword: "" },
    computed: {
        canLogIn: function() {
            return this.username.length >= 3 && this.password.length >= 6;
        },
        canSignUp: function() {
            return this.newUsername.length >= 3 && this.newPassword.length >= 6 && this.newPassword == this.rptPassword;
        }
    },
    methods: {
        login: function() {
            console.log('click!');
            $.post("/login", { username: app.username, password: app.password })
                .then((response) => {
                    console.log("sent");
                    console.log(response);
                });
            this.loggedIn = true;
        },
        logout: function() {
            this.loggedIn = false;
        },
        signup: function() {
            app.signedUp = true;
            this.username = this.newUsername;
        },
        signout: function() {
            app.signedUp = false;
        }
    }
}).$mount('#app');