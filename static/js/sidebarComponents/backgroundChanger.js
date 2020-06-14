'use strict';
var BackgroundChanger = {};
(() => {
    const componentName = 'background-changer';
    const template = `
    <div id='${componentName}-root'>
        <input type="checkbox" id="addbg" v-model="isBackgroundVisible"/>
        <label for="addbg"> Add stimulus as background</label>
    </div>`;

    BackgroundChanger = Vue.component(componentName, {
        created: function() {
            this.$emit('created', this);
        },

        data: function() {
            return {
                isBackgroundVisible: true,
            };
        },

        watch: {
            isBackgroundVisible: function(value) {
                if (!value) {
                    const graphic = d3.select(`#${componentName}-graphic`);
                    graphic.style('background-image', ``);
                } else {
                    const url = `/uploads/stimuli/${app.datasetName}/${this.selectedStimuli}`;
                    const graphic = d3.select(`#${componentName}-graphic`);
                    graphic.style('background-image', `url('${url}')`);
                }
            }
        },

    });
})();