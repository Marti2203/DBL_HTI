'use strict';

const marginHeatmap = { top: 10, right: 30, bottom: 30, left: 60 }
const templateHeatmap = `
<div id="heatmap-root">
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
    </div>
    </div>

    <div id="heatmap-body" style='background-size:contain;' width='0' height='0'>
    <svg id='heatmap-graphic'>
    
    </svg>
    </div>
    <div id="heatmap-tooltip"></div>
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
        tooltipDiv: () => d3.select("#heatmap-tooltip")
            .attr("class", "tooltip")
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
            this.svg.selectAll("g").remove();
            // Add dots
            this.svg.append('g')
                .selectAll("dot")
                .data(filteredData)
                .enter()
                .append("circle")
                .attr("cx", d => d.MappedFixationPointX)
                .attr("cy", d => d.MappedFixationPointY)
                .attr("r", 15)
                .style("fill", (d) => {
                    let id = d.user.substring(1);
                    // if(neighbours <= 5){
                    // let color = 0x90EE90;
                    // } else if(neighbours > 5 && neighbours <= 10){
                    //     let color = 0xFFFF00
                    // } else{
                    //     let color = 0xFF0000
                    // }
                    let color = 0xFF0000
                    return '#' + color;
                }, "opacity", 0.5)
        },
        changeStimuli: function () {
            const width = 1650 - this.marginHeatmap.left - this.marginHeatmap.right;
            const height = 1200 - this.marginHeatmap.top - this.marginHeatmap.bottom;
            d3.select("heatmap-graphic").style('background-image', `url('/static/stimuli/${this.selectedStimuli}'`)
                .attr("width", width + marginHeatmap.left + marginHeatmap.right)
                .attr("height", height + marginHeatmap.top + marginHeatmap.bottom)
        }
    },
    template: templateHeatmap
})