'use strict';
var OpacitySlider = Vue.component('opacity-slider', {
    created: function() {
        this.$emit('created', this);
    },
    data: function() {
        return {
            opacity: 0,
        };
    },
    watch: {
        opacity: function(value) {
            this.$emit('value-changed', value);
        }
    },
    template: `
        <div id='opacity-slider-root'>
            <label for="opacity">Opacity : {{opacity / 10.0}}</label>
            <input name="opacity" v-model="opacity" type="range" min="0" max="10" value="0">
        </div>`
});