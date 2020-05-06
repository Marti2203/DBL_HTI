"use strict";
const Vis2 = { template: '<div>vis 2</div>' }
const UploadDemo = Vue.component('upload-demo', {

        data: function() {
            return {
                stimuli: '',

            }
        },
        methods: {
            addStimuli: function() {
                console.log(`adding stimuli ${this.stimuli}`)

                $.post(`/insertStimulus/${this.stimuli}`).then(response => {
                    console.log(`I got the response '${this.stimuli}'`)
                })
            }
        },
        template: `
    <div id='upload-demo'>
        <input v-model='stimuli' type='text' placeholder='Stimuli name'>
        <button @click='addStimuli()' class='btn btn-info'>Add stimuli to database</button>
   </div>`

    })
    // 2. Define some routes
    // Each route should map to a component. The "component" can
    // either be an actual component constructor created via
    // `Vue.extend()`, or just a component options object.
    // We'll talk about nested routes later.
const routes = [
    { path: '/upload', component: UploadDemo }, { path: '/vis1', component: ScatterPlot },
    { path: '/vis4', component: GazeStripes }
    //{ path: '/vis2', component: Vis2 }
]

const router = new VueRouter({
    routes // short for `routes: routes`
})
const app = new Vue({
    router,
    data: { loggedIn: false, username: "", password: "", signedUp: false, newUsername: "", newPassword: "", rptPassword: "" },
    computed: {
        canLogIn: function() {
            return this.username.length >= 3 && this.password.length >= 6
        },
        canSignUp: function() {
            return this.newUsername.length >= 3 && this.newPassword.length >= 6 && this.newPassword == this.rptPassword
        }
    },
    methods: {
        login: function() {
            console.log('click!')
            $.post("/login", { username: app.username, password: app.password })
                .then((response) => {
                    console.log("sent")
                    console.log(response)
                })
            this.loggedIn = true
        },
        logout: function() {
            this.loggedIn = false
        },
        signup: function() {
            app.signedUp = true
            this.username = this.newUsername
        },
        signout: function() {
            app.signedUp = false
        }
    }
}).$mount('#app')