'use strict';
var Login = {};
(() => {
    const componentName = 'login';
    // This template could get improved further, it doesn't show the right blocks with the current configuration.
    const template = `
    <div id='${componentName}-root'>
    <link rel="stylesheet" href="/static/css/login.css">

    <div v-if="!(loggedIn) " class="buttons" style="display:inline">
        <!-- Button trigger modal -->
        <button type="button" class="btn btn-secondary" @click="loginModalVisible = true">
            Log in
        </button>
        <!-- Button trigger modal -->
        <button type="button" class="btn btn-secondary" @click="signupModalVisible = true">
            Sign Up
        </button>
    </div>
    <!-- When someone is logged in show this: -->
    <template v-else>
        <!-- Not used for now 
        <div id="general-information">
        {{username}}
        </div>
        -->
        <div id="logout">
            Logged in as {{username}} <br>
            <button @click="logout()" class="btn btn-secondary">
                Log out
            </button>
        </div>
    </template>

    <!-- Modal Login -->
    <modal v-if="loginModalVisible">
        <div slot="header">
            <h5 class="modal-title" id="login-modal-title">Log in</h5>
            <button type="button" class="close" @click="closeLoginModal()">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div slot="body">
            <div id="login-form">
                You are not yet logged in!<br />
                <label for="username">
                </label>
                <input v-model="username" placeholder="Username" type="text" id="username" />
                <br />
                <label for="password">
                </label>
                <input v-model="password" placeholder="Password" type="password" id="password" />
                <div v-if="loginError" style="color: red"> Failed to log in. </div>
                <br />
            </div>
        </div>
        <div slot="footer">
            <button type="button" class="btn btn-secondary" @click="closeLoginModal()">Close</button>
            <button type="button" @click="login()" class="btn btn-secondary" :disabled="!canLogIn"
                data-dismiss="modal">Log in</button>
        </div>
    </modal>
    <!-- Modal Signup -->
    <modal v-if="signupModalVisible">
        <div slot="header">
            <h5 class="modal-title" id="login-modal-title">Sign up</h5>
            <button type="button" class="close" @click="closeSignupModal()">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div slot="body" id="signup">
                <input v-model="newUsername" placeholder="Username" type="text" id="newUsername" />
                <br />
                <input v-model="newPassword" placeholder="Password" type="password" id="newPassword" />
                <br />
                <input v-model="repeatPassword" placeholder="Repeat password" type="password" id="repeatPassword" />
                <div v-if="!validUserName" style="color: red"> Username must be longer than 3 characters. </div>
                <div v-if="!validPassword" style="color: red"> Password must be longer than 6 characters. </div>
                <div v-if="!samePasswords" style="color: red"> The passwords don't match. </div>
                <br />
        </div>
        <div slot="footer">
            <button type="button" class="btn btn-secondary" @click="closeSignupModal()">Close</button>
            <button type="button" @click="signup()" class="btn btn-secondary" :disabled="!canSignUp"
                data-dismiss="modal">Sign Up</button>
        </div>
    </modal>
   </div>`;
    Login = Vue.component(componentName, {
        data: function() {
            return {
                loggedIn: false,
                loginError: false,

                username: "",
                password: "",

                newUsername: "",
                newPassword: "",
                repeatPassword: "",


                signupModalVisible: false,
                loginModalVisible: false,
            };
        },
        computed: {
            canLogIn: function() {
                return this.username.length >= 3 && this.password.length >= 6;
            },
            canSignUp: function() {
                return this.newUsername.length >= 3 && this.newPassword.length >= 6 && this.newPassword == this.repeatPassword;
            },

            validPassword: function() {
                return this.newPassword.length >= 6;
            },

            // Here we check whether the passwords are the same, but only if they already meet the requirements of the above functions.
            samePasswords: function() {
                return this.newPassword === this.repeatPassword;
            },

            validUserName: function() {
                return this.newUsername.length >= 3;
            },
            hasInputName: function() {
                return this.username !== '';
            },
            hasInputPassword: function() {
                return this.password !== '';
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
                $.post("/login", { username: this.username, password: this.password })
                    .then((response) => {
                        this.loggedIn = true;
                        app.loadDatasets();
                    }).catch((response) => {
                        this.loginError = true;
                        alert('Could not login');
                    });
                this.password = "";
            },
            // This function just sends the user to the logout route, where the session cookie is destroyed
            // and the current_user is logged out.
            logout: function() {
                $.get("/logout")
                    .then((response) => {
                        this.loggedIn = false;
                    });
                this.username = '';
            },
            // This function is very similar to the login function it just sends the data to the correct route.
            signup: function() {
                let tempName = this.newUsername;
                let tempPass = this.newPassword;
                $.post('/register', { username: this.newUsername, password: this.newPassword })
                    .then((response) => {

                        this.username = tempName;
                        this.password = tempPass;

                        this.login();
                    });

                this.newPassword = "";
                this.repeatPassword = "";
                this.newUsername = "";
            },

            closeLoginModal: function() {
                this.loginModalVisible = false;
                if (!this.loggedIn) {
                    this.username = "";
                    this.password = "";
                }
            },

            closeSignupModal: function() {
                this.signupModalVisible = false;
                this.newPassword = "";
                this.newUsername = "";
                this.repeatPassword = "";
            }
        },
        template
    });


})();