'use strict';
var Login = {};
(() => {
    const componentName = 'login';
    // This template could get improved further, it doesn't show the right blocks with the current configuration.
    const template = `
    <div id='${componentName}-root'>
    <div v-if="!(loggedIn) " class="buttons" style="display:inline">
        <!-- Button trigger modal -->
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#login-modal">
            Log in
        </button>
        <!-- Button trigger modal -->
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#signup-modal">
            Sign Up
        </button>
    </div>

    <!-- When someone is logged in show this: -->
    <template v-if="loggedIn">
        <div id="general-information">
             {{username}}
        </div>
        <div id="logout">
            Logged in <br />
            <button @click="logout()" class="btn btn-info">
                Log out
            </button>
        </div>
    </template>

    <template v-if="signedUp">
        <div id="registered">
            You are now signed in {{username}}.
        </div>
        <button @click="signout()" class="btn btn-info">
            Log out
        </button>
    </template>
    <!-- Modal Login -->
    <div class="modal fade" id="login-modal" tabindex="-1" role="dialog" aria-labelledby="Modal-login-center"
        aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="login-modal-title">Log in</h5>
                    <button type="button" id="close-login" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <template v-if="!loggedIn">
                        <div id="login-form">
                            You are not yet logged in!<br />
                            <label for="username">
                            </label>
                            <input v-model="username" placeholder="Username" type="text" id="username" />
                            <br />
                            <label for="password">
                            </label>
                            <input v-model="password" placeholder="Password" type="password" id="password" />
                            <br />
                       </div>
                    </template>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="button" @click="login()" class="btn btn-primary" :disabled="!canLogIn"
                        data-dismiss="modal">Log in</button>
                </div>
            </div>
        </div>
    </div>
    <!-- Modal Signup -->
    <div class="modal fade" id="signup-modal" tabindex="-1" role="dialog" aria-labelledby="Modal-login-center"
        aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="login-modal-title">Sign up</h5>
                    <button type="button" id="close-signup" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <template v-if="!signedUp">
                        <div id="signup">
                            <input v-model="newUsername" placeholder="Username" type="text" id="newUsername" />
                            <br />
                            <input v-model="newPassword" placeholder="Password" type="password" id="newPassword" />
                            <br />
                            <input v-model="rptPassword" placeholder="Repeat password" type="password" id="rptPassword" />
                            <br />
                        </div>
                    </template>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="button" @click="signup()" class="btn btn-primary" :disabled="!canSignUp"
                        data-dismiss="modal">Sign Up</button>
                </div>
            </div>
        </div>
    </div>
   </div>`;
    Login = Vue.component(componentName, {
        data: function() {
            return {
                loggedIn: false,
                signedUp: false,

                username: "",
                password: "",

                newUsername: "",
                newPassword: "",
                rptPassword: ""
            };
        },
        computed: {
            canLogIn: function() {
                return this.username.length >= 3 && this.password.length >= 6;
            },
            canSignUp: function() {
                return this.newUsername.length >= 3 && this.newPassword.length >= 6 && this.newPassword == this.rptPassword;
            }
        },
        watch: {
            loggedIn: function(value) {
                app.loggedIn = value;
            }
        },
        methods: { //These methods came from the main.js but are now here because we want a seperate vue component for loggin in.
            // This function just passes the information given in the dialog screens on the website to the backend route.
            // It also resets the password string at the end so nothing gets stored.
            login: function() {
                console.log('click!');
                $.post("/login", { username: this.username, password: this.password })
                    .then((response) => {
                        console.log(response);
                        this.loggedIn = true;
                        $('#close-login').click();
                    });
                this.password = "";
                this.username = "";
            },
            // This function just sends the user to the logout route, where the session cookie is destroyed
            // and the current_user is logged out.
            logout: function() {
                $.get("/logout")
                    .then((response) => {
                        this.loggedIn = false;
                    });
            },
            // This function is very similar to the login function it just sends the data to the correct route.
            signup: function() {
                let tempName = this.newUsername;
                let tempPass = this.newPassword;
                $.post('/register', { username: this.newUsername, password: this.newPassword })
                    .then((response) => {
                        this.username = this.newUsername;
                        $('#close-signup').click();
                        this.username = tempName;
                        this.password = tempPass;
                        this.login();
                    });
                this.newPassword = "";
                this.rptPassword = "";
                this.newUsername = "";
            },
        },
        template
    });


})();