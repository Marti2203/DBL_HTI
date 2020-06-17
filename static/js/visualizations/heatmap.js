'use strict';
var Heatmap = (() => {
    const componentName = 'heatmap';

    const template = `
<div id="${componentName}-root">
    <link rel="stylesheet" type="text/css" href="static/css/heatmap.css">
    <div class="border border-secondary block-text">
        <h3>Heatmap</h3>
        <p>
            In the heatmap, the stimulus as well as the option to visualize all or one
            participant can be chosen. The brighter the color in the heatmap, the more fixations
            have been done in that particular area. If you want, you can try a different color
            style and opacity. Check it out!
        </p>
    </div>
    <div id="${componentName}-body" style='background-size:contain;'>
        <div id="${componentName}-place"></div>
        <svg id='${componentName}-svg'>
            <g id='${componentName}-graphics'>
                <image id='${componentName}-image'></image>
            </g>    
        </svg>
    </div>
</div>`;

    return Vue.component(componentName, {
        mixins: [SidebarComponentHandlerMixin, StimuliSelectionMixin, BackgroundTogglerMixin],
        mounted: async function() {
            this.heatmap = h337.create({ //create heatmap instance when the DOM Tree has loaded fully
                container: document.getElementById(`${componentName}-place`),
                height: 1200,
                width: 850,
                opacity: 0
            });
            //RESIZE WORKS ONLY ON WINDOW
            $(window).resize(() => this.positionHeatmap());

            this.$root.requestSidebarComponent(UserSelector, "userSelector", async(selector) => {
                bind(selector, 'change-user', (event) => this.userChanged(event), this.customComponentListeners);
                bind(selector, 'picked-all', () => this.generateHeatmapForAll(), this.customComponentListeners);

                if (selector.selectedUser != 'none') {
                    this.userChanged(selector.selectedUser);
                }
                selector.picked = 'one';
            }, () => this.$root.$route.name == "Heatmap" && this.$root.hasDatasetSelected && this.hasSelectedStimuli && !this.renderingAll);


            this.$root.requestSidebarComponent(Slider('opacity-slider', 0, 10, 0, 'Opacity : {{data / 10.0}}'), "opacitySlider", async(slider) => {
                //Do this when the opacity slider is moved
                bind(slider, 'value-changed', (value) => this.heatmap.configure({ opacity: value / 10 }), this.customComponentListeners);
            }, () => this.$root.$route.name == "Heatmap" && this.$root.hasDatasetSelected);


            this.$root.requestSidebarComponent(StyleSelector, "styleSelector", async(selector) => {
                // Do this when the style is selected
                selector.$on('style-selected', (kv) => this.heatmap.configure(kv.value));
            }, () => this.$root.$route.name == "Heatmap" && this.$root.hasDatasetSelected);

        },
        data: function() {
            return {
                data: [],
                heatmap: null,
                componentName
            };
        },
        computed: {
            hasDataset: function() {
                return this.$root.hasDatasetSelected;
            },
        },
        methods: {
            stimulusChanged: async function(value) { // Do this when a stimuli is selected
                this.clearView();

                if (value === 'none') return;
                this.hasSelectedStimuli = true;

                this.data = await this.$root.getDataForStimulus(value);
                this.changeStimuliImage(value);
                this.generateHeatmapForAll();

            },
            generateHeatmapForAll: function() {
                this.generateHeatmap(this.data);
            },
            generateHeatmapForUser: function(user) {
                this.generateHeatmap(this.data.filter(d => d.user == user));
            },
            userChanged: function(value) {
                if (value == 'none') return;
                this.generateHeatmapForUser(value);
            },
            clearView: function() {
                this.image.style('background-image', ``);
                this.heatmap.setData({ max: 0, min: 0, data: [] });
            },
            generateHeatmap: function(filteredData) { //Put the data into the heatmap
                const dataPoints = filteredData.map(d => ({ x: d.MappedFixationPointX, y: d.MappedFixationPointY, value: 700 }));

                this.heatmap.setData({
                    max: 1650,
                    min: 0,
                    data: dataPoints,
                });
            },
            positionHeatmap: function() { //Position the heatmap in the center of the stimuli
                let canvas = $(this.heatmap._renderer.canvas);
                let margin = ($(`#${componentName}-body`).width() - canvas.width());
                if (margin > 0) {
                    canvas.css('margin-left', margin / 2);
                } else {
                    canvas.css('margin-left', 0);
                }
            },
            imageLoaded: function(img) {
                this.heatmap.configure({ width: img.width, height: img.height });
                this.positionHeatmap();
            },
        },
        template
    });
})();