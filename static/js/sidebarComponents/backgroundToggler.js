'use strict';
var BackgroundToggler = (() => {
    const componentName = 'background-toggler';
    const template = `
    <div id='${componentName}-root'>
        <input type="checkbox" id="addbg" v-model="isBackgroundVisible"/>
        <label for="addbg"> Add stimulus as background</label>
    </div>`;

    return Vue.component(componentName, {
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
                    this.$emit('hide-background');
                } else {
                    this.$emit('show-background');
                }
            }
        },
        template
    });
})();