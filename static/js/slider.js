'use strict';
var Slider = function(name, min = 0, max = 10, startingValue = min, display = '{{value}}') {
    return Vue.component('name', {
        created: function() {
            this.$emit('created', this);
        },
        data: function() {
            return {
                data: startingValue,
            };
        },
        watch: {
            data: function(value) {
                this.$emit('value-changed', value);
            }
        },
        template: `
        <div id='${name}-root'>
            <label for="${name}">${display}</label>
            <input name="${name}" v-model="data" type="range" min="${min}" max="${max}" value="${startingValue}">
        </div>`
    });
};