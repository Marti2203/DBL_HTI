'use strict';
var Heatmap = {};
(() => {
        const componentName = 'heatmap';
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
    <div v-if="hasDataset">
        <div v-if="hasSelectedStimuli">
            <input type="radio" id="all" value="all" v-model="picked">
            <label for="all">All users</label>
            
            <input type="radio" id="one" value="one" v-model="picked">
            <label for="one">One user</label>
            <div v-if="picked == 'one'">
                <select v-model="selectedUser" placeholder="Select a user">
                    <option v-for="user in users">{{user}}</option>
                </select>
                <span>Selected user: {{selectedUser}}</span>
            </div>
            <br />
            <select v-model="style" placeholder="Select a style">
            ${
                Object.keys(styles).map(s => `<option>${s}</option>` ).join('\n')
            }
            </select>
            <br />
        </div>
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
            $(window).resize(() => {
                this.positionHeatmap();
            });
            this.$root.requestSidebarComponent(StimuliSelector, "stimuliSelector", async (selector)=>
            {
                selector.$on('change-stimulus',(event)=> this.stimulusChanged(event));
                selector.$on('reset-stimuli-set', (event) => this.stimuliReset(event));
                if (selector.currentStimulus != 'none') {
                    await this.stimulusChanged(selector.currentStimulus);
                }
            },() => this.$root.hasDatasetSelected);
            this.$root.requestSidebarComponent(OpacitySlider, "opacitySlider", async (slider) =>
            {
                //Do this when the opacity slider is moved
                slider.$on('value-changed',(value) => this.changeOpacity(value));
            },() => this.$root.$route.name == "Heatmap" && this.$root.hasDatasetSelected);
            
        },
        data: function() {
            return {
                data: [],
                users: [],
                selectedUser: 'none',
                picked: 'all',
                style: 'Standard',
                hasSelectedStimuli: false,
                heatmap: null
            };
        },
        watch: {
            selectedUser: function(value) { // Do this when a single user is selected
                if(value == 'none') return;

                this.generateHeatmapForUser();
            },
            picked: function(value){
                if(value == 'one') return;
                
                this.selectedUser ='none';
                this.generateHeatmapForAll();
            },
            style: function() { //Do this when a style is selected
                this.changeStyle();
            },
        },
        computed: {
            hasDataset: function(){
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

                if(value == 'none') return;
                this.hasSelectedStimuli = true;
                
                this.data = await this.$root.getDataForStimulus(value);
                this.users = await this.$root.getUsersForStimulus(value);
                this.changeStimuliImage(value);
                this.generateHeatmapForAll();
                
            },
            stimuliReset: function() {
                this.data = [];
                this.users = [];
                this.selectedUser = 'none';
                this.selectedStimuli = 'none';
                this.hasSelectedStimuli = false;
            },
            generateHeatmapForAll: function() {
                this.generateHeatmap(this.data);
            },
            generateHeatmapForUser: function() {
                this.generateHeatmap(this.data.filter(d => d.user == this.selectedUser));
            },
            clearView: function(){
                this.svg.style('background-image', ``);
                this.heatmap.setData({max :0, min:0, data:[]});
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
            changeStyle: function() { //Change the style of the heatmap to different colors
                this.heatmap.configure(styles[this.style]);
            },
            changeOpacity: function(value) { //Change the opacity of the heatmap
                this.heatmap.configure({opacity: value/10});
            }
        },
        template
    });
})();