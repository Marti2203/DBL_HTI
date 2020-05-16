'use strict';
var Heatmap = {};
(() => {
    const componentName = 'heatmap';
    const template = `
    <div id="${componentName}-root">
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
    </div>
    </div>
    
    <div id="${componentName}-body" style='background-size:contain;' width='1650' height='1200'>
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
            this.heatmap = h337.create({
                container: document.getElementById(`${componentName}-body`),
                height: 1200,
                width: 1650
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
                componentName,
                heatmap: null
            };
        },
        watch: {
            selectedStimuli: function(value) {
                this.selectedStimuli = value;
                this.picked = 'all';
                this.changeStimuli();
                this.generateHeatmapForAll();
            },
            selectedUser: function() {
                this.generateHeatmapForUser();
            },
            picked: async function(value) {
                if (value == 'one') {
                    this.users = JSON.parse(await $.get(`/users/${this.selectedStimuli}`));
                } else {
                    this.users = [];
                }
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
            print: () => console.log('hi!'),
            generateHeatmapForAll: function() {
                console.log(this.generatePoints(this.data.filter(d => d.StimuliName == this.selectedStimuli)));
                this.generatePoints(this.data.filter(d => d.StimuliName == this.selectedStimuli));
            },
            generateHeatmapForUser: function() {
                this.generatePoints(this.data.filter(d => d.user == this.selectedUser && d.StimuliName == this.selectedStimuli));
            },
            generatePoints: function(filteredData) {
                const dataPoints = filteredData.map(d => { return { x: d.MappedFixationPointX, y: d.MappedFixationPointY, value: 2000 }; });

                this.heatmap.setData({
                    max: 1650,
                    min: 0,
                    data: dataPoints,
                });
            },
            changeStimuli: function() {
                const width = 1650;
                const height = 1200;
                d3.select(`#${componentName}-graphic`).style('background-image', `url('/static/stimuli/${this.selectedStimuli}'`)
                    .attr("width", width)
                    .attr("height", height);
            }
        },
        template
    });
})();