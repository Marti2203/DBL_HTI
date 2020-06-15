'use strict';
var StyleSelector = (() => {
    const componentName = 'style-selector';
    const styles = {
        Standard: {
            gradient: {
                0.25: "rgb(0,0,255)",
                0.55: "rgb(0,255,0)",
                0.85: "yellow",
                1.0: "rgb(255,0,0)"
            }
        },
        'Style 1': {
            gradient: {
                '.5': '#FFD700',
                '.8': 'yellow',
                '.95': 'white'
            }
        },
        'Style 2': {
            gradient: {
                '.5': 'blue',
                '.8': 'purple',
                '.95': 'black'
            }
        },
        'Style 3': {
            gradient: {
                '.5': 'purple',
                '.8': 'pink',
                '.95': 'orange'
            }
        }
    };
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

    return Vue.component(componentName, {
        created: function() {
            this.$emit('created', this);
        },
        data: function() {
            return {
                styles: Object.keys(styles),
                selectedStyle: Object.keys(styles)[0],
            };
        },
        watch: {
            selectedStyle: function(value) {
                this.$emit('style-selected', { key: value, value: styles[value] });
            },

        },
        template
    });
})();