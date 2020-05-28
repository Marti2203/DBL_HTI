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
                    '.5': 'blue',
                    '.8': 'red',
                    '.95': 'yellow'
                }
            },
            'Style 2': {
                gradient: {
                    '.5': 'green',
                    '.8': 'orange',
                    '.95': 'yellow'
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
    <h3>Heatmap</h3>
    <p>
        In the heatmap, the stimulus as well as the option to visualize all or one 
        participant can be chosen. The brighter the color in the heatmap, the more fixations 
        have been done in that particular area. If you want, you can try a different color 
        style. Check it out!
    </p>
    <div v-if="hasDataset">
        <label for="stimuli-selector">Select a Stimuli:</label>
        <select name="stimuli-selector" v-model="selectedStimuli" placeholder="Select a Stimuli">
            <option v-for="stimulus in stimuli">{{stimulus}}</option>
        </select>
        
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
        </div>
        
    </div> 
    <div id="${componentName}-body" style='background-size:contain;'>
        <div id="${componentName}-place"></div> 
        <svg id='${componentName}-graphic'><svg>
    </div>
</div>`;
    
    Heatmap = Vue.component(componentName, {
        created: function() {
            this.$root.addDatasetListener(async(dataset) => this.stimuli = JSON.parse(await $.get(`/stimuliNames/${dataset}`)));

            $(() => 
            this.heatmap = h337.create({ //create heatmap instance
                container: document.getElementById(`${componentName}-place`),
                height: 1200,
                width: 850
            }));
            //RESIZE WORKS ONLY ON WINDOW
            $(window).resize((e) => {
                this.positionHeatmap();
            });

        },
        data: function() {
            return {
                data: [],
                stimuli: [],
                users: [],
                selectedStimuli: 'none',
                selectedUser: 'none',
                picked: 'all',
                style: 'Standard',
                componentName,
                heatmap: null
            };
        },
        watch: {
            selectedStimuli: async function(value) { // Do this when a stimuli is selected
                this.picked = 'all';
                this.clearView();

                if(value == 'none') return;

                this.data = JSON.parse(await $.get(`/data/${app.dataset}/${value}`));
                this.users = JSON.parse(await $.get(`/participants/${app.dataset}/${value}`));
                this.changeStimuli();
                this.generateHeatmapForAll();
                
            },
            selectedUser: function(value) { // Do this when a single user is selected
                if(value == 'none') return;

                this.generateHeatmapForUser();
            },
            picked: function(value){
                if(value == 'one') return;
                
                this.selectedUser ='none';
                this.generateHeatmapForAll();
            },
            style: function(value) { //Do this when a style is selected
                this.changeStyle();
            },stimuli: function() {
                this.data = [];
                this.selectedUser = 'none';
                this.selectedStimuli = 'none';
            }
        },
        computed: {
            hasSelectedStimuli: function() {
                return this.selectedStimuli != 'none';
            },
            hasDataset: function(){
                return this.$root && this.$root.dataset != null;
            },
            svg: () => d3.select(`#${componentName}-graphic`),
            Div: () => d3.select(`#${componentName}-container`)
                .attr("class", "container")
                .style("opacity", 0),
        },
        methods: {
            generateHeatmapForAll: function() {
                this.generatePoints(this.data.filter(d => d.StimuliName == this.selectedStimuli));
            },
            generateHeatmapForUser: function() {
                this.generatePoints(this.data.filter(d => d.user == this.selectedUser && d.StimuliName == this.selectedStimuli));
            },
            clearView: function(){
                const graphic = d3.select(`#${componentName}-graphic`);
                graphic.style('background-image', ``);
                this.heatmap.setData({max :0, min:0, data:[]});
            },
            generatePoints: function(filteredData) { //Put the data into the heatmap
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
            changeStimuli: function() { //Change the background image of the stimuli and configure the height and width of the heatmap
                const url = `/uploads/stimuli/${app.datasetName}/${this.selectedStimuli}`;
                const graphic = d3.select(`#${componentName}-graphic`);
                let img = new Image();
                let base = this;
                img.onload = function() {
                    graphic.attr("width", this.width);
                    graphic.attr("height", this.height);

                    base.heatmap.configure({ width: this.width, height: this.height });
                    base.positionHeatmap();
                };
                img.src = url;
                graphic.style('background-image', `url('${url}')`);
            },
            changeStyle: function() { //Change the style of the heatmap to different colors
                this.heatmap.configure(styles[this.style]);
            }
        },
        template
    });
})();