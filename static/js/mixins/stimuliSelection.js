var StimuliSelectionMixin = {
    data: function() {
        return {
            hasSelectedStimuli: false,
        };
    },
    mounted: function() {
        this.$root.requestSidebarComponent(StimuliSelector, "stimuliSelector", async(selector) => {
            bind(selector, 'change-stimulus', (event) => this.stimulusChanged(event), this.customComponentListeners);
            bind(selector, 'reset-stimuli-set', (event) => this.stimuliReset(event), this.customComponentListeners);
            if (selector.currentStimulus != 'none') {
                this.hasSelectedStimuli = true;
                await this.stimulusChanged(selector.currentStimulus);
            }
        }, () => this.$root.isInVisualization && this.$root.hasDatasetSelected);
    },
    methods: {
        stimuliReset: function() {
            this.data = [];
            this.hasSelectedStimuli = false;
        },
        stimuliChanged: function(value) {

        }
    }
};