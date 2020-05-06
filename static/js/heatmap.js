'use strict';

const marginHeatmap = { top: 10, right: 30, bottom: 30, left: 60 }
const templateHeatmap = `
<div id="heatmap-root">
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
    
    <div id="heatmap-body" style='background-size:contain;' width='0' height='0'>
    <svg id='heatmap-graphic'>
    <div id="heatmap-container"></div>
    </svg>
    </div>
    
</div>`

var Heatmap = Vue.component('heatmap', {
    created: async function () {
        $.get('/stimuliNames', (stimuli) => {
            this.stimuli = JSON.parse(stimuli)
        })
        this.data = await d3.tsv("/static/csv/all_fixation_data_cleaned_up.csv")
    },
    data: function () {
        return {
            data: [],
            stimuli: [],
            users: [],
            selectedStimuli: 'none',
            selectedUser: 'none',
            picked: 'all',
            marginHeatmap
        }
    },
    watch: {
        selectedStimuli: function (value) {
            this.selectedStimuli = value
            this.picked = 'all'
            this.changeStimuli()
            this.generateHeatmapForAll()
        },
        selectedUser: function () {
            this.generateHeatmapForUser()
        },
        picked: async function (value) {
            if (value == 'one') {
                this.users = JSON.parse(await $.get(`/users/${this.selectedStimuli}`))
            } else {
                this.users = []
            }
        }
    },
    computed: {
        hasSelectedStimuli: function () {
            return this.selectedStimuli != 'none'
        },
        svg: () => d3.select("#heatmap-graphic"),
        Div: () => d3.select("#heatmap-container")
            .attr("class", "container")
            .style("opacity", 0),
    },
    methods: {
        print: () => console.log('hi!'),
        generateHeatmapForAll: function () {
            this.generatePoints(this.data.filter(d => d.StimuliName == this.selectedStimuli))
        },
        generateHeatmapForUser: function () {
            this.generatePoints(this.data.filter(d => d.user == this.selectedUser && d.StimuliName == this.selectedStimuli))
        },
        generatePoints: function (filteredData) {
            
            var heatmap = h337.create({
                container: document.getElementById('heatmap-graphic'),
                svgUrl: "static/stimuli/" +  this.selectedStimuli,
                plugin: 'SvgAreaHeatmap'
            });
            
            window.heatmap = heatmap;

            window.randomize = function(){
                const max = 1650 - this.marginHeatmap.left - this.marginHeatmap.right;

                var dataPoints = [];
                for (var i = 0; i < d.length; i++) {
                    dataPoints.push({ id: d => d.Timestamp, value: d => {d.MappedFixationPointX, d.MappedFixationPointY}});
                }

                heatmap.setData({
                    max: max,
                    min: 0,
                    data: dataPoints
            });
            }
        },
        changeStimuli: function () {
            const width = 1650 - this.marginHeatmap.left - this.marginHeatmap.right;
            const height = 1200 - this.marginHeatmap.top - this.marginHeatmap.bottom;
            d3.select("#heatmap-graphic").style('background-image', `url('/static/stimuli/${this.selectedStimuli}'`)
                .attr("width", width + marginHeatmap.left + marginHeatmap.right)
                .attr("height", height + marginHeatmap.top + marginHeatmap.bottom)
        }
    },
    template: templateHeatmap
})