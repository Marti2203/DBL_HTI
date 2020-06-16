'use strict';
var UserSelector = (() => {
    const componentName = 'user-selector';
    const template = `
    <div id='${componentName}-root'>
        <div>
            <label for="user-selector">Select all users or one user:</label>
            <br>
            <input type="radio" id="all" value="all" v-model="picked" name="user-selector">
            <label for="user-selector">All users</label>
            <br>
            <input type="radio" id="one" value="one" v-model="picked" name="user-selector">
            <label for="user-selector">One user</label>
            <br>
            <div v-if="picked == 'one'">
                <select v-model="selectedUser" placeholder="Select a user">
                    <option v-for="user in users">{{user}}</option>
                </select>
                <span>Selected user: {{selectedUser}}</span>
            </div>
        </div>
   </div>`;

    return Vue.component(componentName, {
        created: function() {
            this.$emit('created', this);
        },
        mounted: function() {
            this.$root.requestSidebarComponent(StimuliSelector, "stimuliSelector", async(selector) => {
                selector.$on('change-stimulus', (event) => this.stimulusChanged(event));
                selector.$on('reset-stimuli-set', (event) => this.stimuliReset(event));
                if (selector.currentStimulus != 'none') {
                    await this.stimulusChanged(selector.currentStimulus);
                }
            }, () => this.$root.hasDatasetSelected);
        },
        data: function() {
            return {
                users: [],
                selectedUser: 'none',
                picked: 'all',
            };
        },
        computed: {
            hasSelectedUser: function() {
                return this.selectedUser != 'none';
            }
        },
        watch: {
            users: function(value) {
                this.selectedUser = 'none';
            },
            selectedUser: function(value) {
                this.$emit('change-user', value);
            },
            picked: function(value) {
                if (value == 'one') return;

                this.selectedUser = 'none';
                this.$emit('picked-all');
            },
        },
        methods: {
            stimulusChanged: async function(stimulus) {
                if (stimulus == 'none')
                    return;
                this.users = await this.$root.getUsersForStimulus(stimulus);
            },
            stimuliReset: async function() {
                this.users = [];
                this.picked = 'all';
                this.selectedUser = 'none';
            },
        },
        template
    });
})();