'use strict';
var Heatmap = {};
(() => {
    const componentName = 'heatmap';
    const template = `
    <div id="${componentName}-root">
    <link rel="stylesheet" type="text/css" href="static/css/heatmap.css">
    <h3>Heatmap</h3>
    
    <label for="stimuli-selector">Select a Stimuli:</label>
    <select name="stimuli-selector" v-model="selectedStimuli" placeholder="Select a Stimuli">
    <option v-for="stimul in stimuli">
    {{stimul}}
    </option>
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
    </div><br />
    <select v-model="styles" placeholder="Select a style">
    <option>Standard</option>
    <option>Style 1</option>
    <option>Style 2</option>
    <option>Style 3</option>
    </select>
    </div>
    
    
    <div id="${componentName}-body" style='background-size:contain;'>
        <div id="${componentName}-place"></div> 
        <svg id='${componentName}-graphic'>
        
        </svg>
            
    </div>
    
    </div>`;

    Heatmap = Vue.component(componentName, {
        created: async function() {
            $.get('/stimuliNames', (stimuli) => {
                this.stimuli = JSON.parse(stimuli);
            });
            this.data = await d3.tsv("/static/csv/all_fixation_data_cleaned_up.csv");
            this.heatmap = h337.create({ //create heatmap instance
                container: document.getElementById(`${componentName}-place`),
                height: 1200,
                width: 850
            }); 
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
                styles: 'standard',
                componentName,
                heatmap: null
            };
        },
        watch: {
            selectedStimuli: function(value) { // Do this when a stimuli is selected
                this.selectedStimuli = value;
                this.picked = 'all';
                this.changeStimuli();
                this.generateHeatmapForAll();
            },
            selectedUser: function() { // Do this when a single user is selected
                this.generateHeatmapForUser();
            },
            picked: async function(value) { //Decide whehter we have 1 or more users
                if (value == 'one') {
                    this.users = JSON.parse(await $.get(`/users/${this.selectedStimuli}`));
                } else {
                    this.users = [];
                }
            },
            styles: function(value){ //Do this when a style is selected
                this.styles = value;
                this.changeStyle(); 
            }
        },
        computed: {
            hasSelectedStimuli: function() {
                return this.selectedStimuli != 'none';
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
                console.log(margin);
                if (margin > 0) {
                    canvas.css('margin-left', margin / 2);
                } else {
                    canvas.css('margin-left', 0);
                }
            },
            changeStimuli: function() { //Change the background image of the stimuli and configure the height and width of the heatmap
                const url = `static/stimuli/${this.selectedStimuli}`;
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
                if (this.styles == 'Standard'){
                    this.heatmap.configure({gradient: {
                        0.25: "rgb(0,0,255)", 0.55: "rgb(0,255,0)", 0.85: "yellow", 1.0: "rgb(255,0,0)"
                    }})
                } else if (this.styles == 'Style 1'){
                    this.heatmap.configure({gradient: {
                        '.5': '#FFD700',
                        '.8': 'yellow',
                        '.95': 'white'
                    }})
                } else if (this.styles == 'Style 2'){
                    this.heatmap.configure({gradient: {
                        '.5': 'blue',
                        '.8': 'purple',
                        '.95': 'black'
                    }})
                } else if(this.styles == 'Style 3'){
                    this.heatmap.configure({gradient: {
                        '.5': 'purple',
                        '.8': 'pink',
                        '.95': 'orange'
                    }})
                }
            }
        },
        template
    });
})();