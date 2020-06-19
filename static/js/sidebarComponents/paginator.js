var Paginator = (() => {
    const componentName = 'paginator';
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