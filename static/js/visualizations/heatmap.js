'use strict';
var Heatmap = {};
(() => {
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
            style. Check it out!
        </p>
    </div>
    <div id="${componentName}-body" style='background-size:contain;'>
        <div id="${componentName}-place"></div>
        <svg id='${componentName}-graphic'></svg>
    </div>
</div>`;

    Heatmap = Vue.component(componentName, {
        mounted: async function() {
            this.heatmap = h337.create({ //create heatmap instance when the DOM Tree has loaded fully
                container: document.getElementById(`${componentName}-place`),
                height: 1200,
                width: 850,
                opacity: 0
            });
            //RESIZE WORKS ONLY ON WINDOW
            $(window).resize(() => this.positionHeatmap());
            this.$root.requestSidebarComponent(StimuliSelector, "stimuliSelector", async(selector) => {
                bind(selector, 'change-stimulus', (event) => this.stimulusChanged(event), this.customComponentListeners);
                bind(selector, 'reset-stimuli-set', (event) => this.stimuliReset(event), this.customComponentListeners);

                if (selector.currentStimulus != 'none') {
                    await this.stimulusChanged(selector.currentStimulus);
                }
            }, () => this.$root.hasDatasetSelected);


            this.$root.requestSidebarComponent(Slider('opacity-slider', 0, 10, 0, 'Opacity : {{data / 10.0}}'), "opacitySlider", async(slider) => {
                //Do this when the opacity slider is moved
                bind(slider, 'value-changed', (event) => this.changeOpacity(event), this.customComponentListeners);
            }, () => this.$root.$route.name == "Heatmap" && this.$root.hasDatasetSelected);


            this.$root.requestSidebarComponent(UserSelector, "userSelector", async(selector) => {
                bind(selector, 'change-user', (event) => this.userChanged(event), this.customComponentListeners);
                bind(selector, 'picked-all', () => this.generateHeatmapForAll(selector.users), this.customComponentListeners);
                if (selector.selectedUser != 'none') {
                    this.userChanged(selector.selectedUser);
                }
            }, () => this.$root.hasDatasetSelected && this.hasSelectedStimuli);

            this.$root.requestSidebarComponent(StyleSelector, "styleSelector", async(selector) => {
                // Do this when the style is selected
                selector.$on('style-selected', (kv) => this.changeStyle(kv.value));
            }, () => this.$root.$route.name == "Heatmap" && this.$root.hasDatasetSelected);

            this.$root.requestSidebarComponent(BackgroundToggler, "backgroundToggler", async(toggler) => {
                bind(toggler, 'hide-background', () => this.hideBackground(), this.customComponentListeners);
                bind(toggler, 'show-background', () => this.showBackground(), this.customComponentListeners);
                toggler.isBackgroundVisible = true;
            }, () => this.$root.hasDatasetSelected);
        },
        data: function() {
            return {
                data: [],
                style: 'Standard',
                hasSelectedStimuli: false,
                customComponentListeners: [],
                heatmap: null,
                backgroundImageURL: ''
            };
        },
        destroyed: function() {
            this.customComponentListeners.forEach(obj => obj.component.$off(obj.event, obj.handler));
            this.customComponentListeners = [];
        },
        watch: {
            selectedUser: function(value) { // Do this when a single user is selected
                if (value == 'none') return;

                this.generateHeatmapForUser();
            },
            picked: function(value) {
                if (value == 'one') return;

                this.selectedUser = 'none';
                this.generateHeatmapForAll();
            },
        },
        computed: {
            hasDataset: function() {
                return this.$root.hasDatasetSelected;
            },
            svg: () => d3.select(`#${componentName}-graphic`),
            div: () => d3.select(`#${componentName}-container`)
                .attr("class", "container")
                .style("opacity", 0),
        },
        methods: {
            stimulusChanged: async function(value) { // Do this when a stimuli is selected
                this.picked = 'all';
                this.clearView();

                if (value === 'none') return;
                this.hasSelectedStimuli = true;

                this.data = await this.$root.getDataForStimulus(value);
                this.changeStimuliImage(value);
                this.generateHeatmapForAll();

            },
            stimuliReset: function() {
                this.data = [];
                this.hasSelectedStimuli = false;
            },
            generateHeatmapForAll: function() {
                this.generateHeatmap(this.data);
            },
            generateHeatmapForUser: function(user) {
                this.generateHeatmap(this.data.filter(d => d.user == user));
            },
            userChanged: async function(value) {
                if (value == 'none') return;
                this.generateHeatmapForUser(value);
            },
            clearView: function() {
                this.svg.style('background-image', ``);
                this.heatmap.setData({ max: 0, min: 0, data: [] });
            },
            generateHeatmap: function(filteredData) { //Put the data into the heatmap
                const dataPoints = filteredData.map(d => { return { x: d.MappedFixationPointX, y: d.MappedFixationPointY, value: 700 }; });

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
            changeStimuliImage: function(value) { //Change the background image of the stimuli and configure the height and width of the heatmap
                const url = `/uploads/stimuli/${app.datasetName}/${value}`;
                this.backgroundImageURL = url;
                let img = new Image();
                let base = this;
                img.onload = function() {
                    base.svg.attr("width", this.width);
                    base.svg.attr("height", this.height);

                    base.heatmap.configure({ width: this.width, height: this.height });
                    base.positionHeatmap();
                };
                img.src = url;
                base.svg.style('background-image', `url('${url}')`);
            },
            changeStyle: function(style) { //Change the style of the heatmap to different colors
                this.heatmap.configure(style);
            },
            changeOpacity: function(value) { //Change the opacity of the heatmap
                this.heatmap.configure({ opacity: value / 10 });
            },

            showBackground: function() {
                this.svg.style('background-image', `url('${this.backgroundImageURL}')`);
            },

            hideBackground: function() {
                this.svg.style('background-image', '');
            }
        },
        template
    });
})();