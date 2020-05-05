"use strict";
const Vis2 = { template: '<div>vis 2</div>' }
const UploadDemo = Vue.component('upload-demo', {
    data: function () {
        return {
            stimuli: '',
            form: null
        }
    },
    methods: {
        addStimuli: function () {
            console.log('File uploading');
            $.ajax({ type: "POST", url: '/uploadzip', data: this.form, processData: false, contentType: false, }).then(response => {
                console.log(`Zip uploaded successfully!`)
            })
        },
        previewFiles(event) {
            let file = (event.target.files[0])
            let data = new FormData();
            data.append('uploaded_zip', file)
            this.form = data
        }
    },
    template: `
    <div id='upload-demo'>
        Upload csv with your data and all stimuli-images in one zipped file (no folders within zip). <br>
        <input type='file' accept=".zip" @change="previewFiles">
        <button @click='addStimuli()' class='btn btn-info'>Add to database</button>
   </div>`

})
// 2. Define some routes
// Each route should map to a component. The "component" can
// either be an actual component constructor created via
// `Vue.extend()`, or just a component options object.
// We'll talk about nested routes later.
const routes = [
    { path: '/upload', component: UploadDemo }, { path: '/vis1', component: ScatterPlot },
    { path: '/vis2', component: GazePlot }
]

const router = new VueRouter({
    routes // short for `routes: routes`
})
const app = new Vue({
    router,
    data: { loggedIn: false, username: "", password: "", signedUp: false, newUsername: "", newPassword: "", rptPassword: "" },
    computed: {
        canLogIn: function () {
            return this.username.length >= 3 && this.password.length >= 6
        },
        canSignUp: function () {
            return this.newUsername.length >= 3 && this.newPassword.length >= 6 && this.newPassword == this.rptPassword
        }
    },
    methods: {
        login: function () {
            console.log('click!')
            $.post("/login", { username: app.username, password: app.password })
                .then((response) => {
                    console.log("sent")
                    console.log(response)
                })
            this.loggedIn = true
        },
        logout: function () {
            this.loggedIn = false
        },
        signup: function () {
            app.signedUp = true
            this.username = this.newUsername
        },
        signout: function () {
            app.signedUp = false
        }
    }
}).$mount('#app')