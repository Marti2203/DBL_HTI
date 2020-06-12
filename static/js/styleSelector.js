'use strict';
var StyleSelector = {};
(() => {
    const componentName = 'style-selector';
    const template = `
    <div id='${componentName}-root'>
        <div>
            <label for="style-selector">Select a style:</label>
            <br>
            <select name="style-selector" placeholder="Select a Style">
                <option v-for="style in styles">
                    {{style}}
                </option>
            </select>
        </div>
   </div>`;

    UserSelector = Vue.component(componentName, {
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
                styles: ['Standard', 'Style 1', 'Style 2', 'Style 3'],
                selectedStyle: 'Standard',
            };
        },
        watch: {
            selectedStyle: function(value) {
                this.$emit('style-selected', value);
            },

        },
        methods: {
            stimulusChanged: async function(stimulus) {
                this.users = await this.$root.getUsersForStimulus(stimulus);
            },
            stimuliReset: async function() {
                this.styles = ['Standard', 'Style 1', 'Style 2', 'Style 3'];
                this.selectedStyle = 'Standard';
            },
        },
        template
    });
})();
