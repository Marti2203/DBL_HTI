'use strict';
var UserSelector = {};
(() => {
    const componentName = 'user-selector';
    const template = `
    <div id='${componentName}-root'>
        <div>
            <label for="user-selector">Select all users or one user:</label>
            <input type="radio" id="all" value="all" v-model="picked" name="user-selector">
            <label for="user-selector">All users</label>
            
            <input type="radio" id="one" value="one" v-model="picked" name="user-selector">
            <label for="user-selector">One user</label>
            <div v-if="picked == 'one'">
                <select v-model="selectedUser" placeholder="Select a user">
                    <option v-for="user in users">{{user}}</option>
                </select>
                <span>Selected user: {{selectedUser}}</span>
            </div>
        </div>
   </div>`;

    UserSelector = Vue.component(componentName, {
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
        template
    });
})();