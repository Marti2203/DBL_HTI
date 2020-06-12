'use strict';
var StyleSelector = {};
(() => {
    const componentName = 'style-selector';
    const template = `
    <div id='${componentName}-root'>
        <div>
            <label for="style-selector">Select a style:</label>
            <br>
            <select name="style-selector" v-model="selectedStyle" placeholder="Select a Style">
                <option v-for="style in styles">
                    {{style}}
                </option>
            </select>
        </div>
   </div>`;

    StyleSelector = Vue.component(componentName, {
        created: function() {
            this.$emit('created', this);
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
        template
    });
})();
