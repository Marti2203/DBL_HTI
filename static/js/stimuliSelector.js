'use strict';
var StimuliSelector = {};
(() => {
    const componentName = 'stimuli-selector';
    const template = `
    <div id='${componentName}-root'>
        <label for="stimuli-selector">Select a Stimuli:</label>
        <select name="stimuli-selector" v-model="currentStimulus" placeholder="Select a Stimuli">
            <option v-for="stimulus in stimuli">
                {{stimulus}}
            </option>
        </select>
   </div>`;

    StimuliSelector = Vue.component(componentName, {
        created: function() {
            this.$root.addDatasetListener(async(dataset) => this.stimuli = JSON.parse(await $.get(`/stimuliNames/${dataset}`)));
            this.$emit('created', this);
        },
        data: function() {
            return {
                stimuli: [],
                currentStimulus: 'none',
            };
        },
        computed: {
            hasSelectedStimulus: function() {
                return this.currentStimulus != 'none';
            }
        },
        watch: {
            stimuli: function(value) {
                this.currentStimulus = 'none';
                this.$emit('reset-stimuli-set', value);
            },
            currentStimulus: function(value) {
                this.$emit('change-stimulus', value);
            }
        },
        template
    });
})();