'use strict';

const margin = { top: 10, right: 30, bottom: 30, left: 60 }
const template = `
<div id="scatter-plot-root">
    <link rel="stylesheet" type="text/css" href="static/css/vis1.css">

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

    <div id="scatter-plot-body" style='background-size:contain;' width='0' height='0'>
        <svg id='scatter-plot-graphic'>
        
        </svg>
    </div>
    <div id="scatter-plot-tooltip"></div>
</div>
`


// set the dimensions and margins of the graph
var ScatterPlot = Vue.component('scatter-plot', {
    created: async function() {
        $.get('/stimuliNames', (stimuli) => {
            this.stimuli = JSON.parse(stimuli)
        })
        this.data = await d3.tsv("/static/csv/all_fixation_data_cleaned_up.csv")
    },
    data: function() {
        return {
            data: [],
            stimuli: [],
            users: [],
            selectedStimuli: 'none',
            selectedUser: 'none',
            picked: 'all',
            margin
        }
    },
    watch: {
        selectedStimuli: function(value) {
            this.selectedStimuli = value
            this.picked = 'all'
            this.changeStimuli()
            this.generatePointsForAll()
        },
        selectedUser: function() {
            this.generatePointsForUser()
        },
        picked: function(value) {
            if (value == 'one') {
                this.users = [...new Set(this.data.filter(d => d.StimuliName == this.selectedStimuli).map(d => d.user))]
            } else {
                this.users = []
            }
        }
    },
    computed: {
        hasSelectedStimuli: function() {
            return this.selectedStimuli != 'none'
        },
        svg: () => d3.select("#scatter-plot-graphic"),
        tooltipDiv: () => d3.select("#scatter-plot-tooltip")
            .attr("class", "tooltip")
            .style("opacity", 0),
    },
    methods: {
        print: () => console.log('hi!'),
        generatePointsForAll: function() {
            this.generatePoints(this.data.filter(d => d.StimuliName == this.selectedStimuli))
        },
        generatePointsForUser: function() {
            this.generatePoints(this.data.filter(d => d.user == this.selectedUser && d.StimuliName == this.selectedStimuli))
        },
        generatePoints: function(filteredData) {
            this.svg.selectAll("g").remove();
            // Add dots
            this.svg.append('g')
                .selectAll("dot")
                .data(filteredData)
                .enter()
                .append("circle")
                .attr("cx", d => d.MappedFixationPointX)
                .attr("cy", d => d.MappedFixationPointY)
                .attr("r", 5)
                .on("mouseover", (d) => {
                    this.tooltipDiv.transition()
                        .duration(200)
                        .style("opacity", .9);
                    this.tooltipDiv
                        .html(`Timestamp: ${d.Timestamp} </br> (${d.MappedFixationPointX},${d.MappedFixationPointY}) </br> User: ${d.user}`)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                })
                .on("mouseout", (d) => {
                    this.tooltipDiv.transition()
                        .duration(400)
                        .style("opacity", 0);
                })
                .style("fill", (d) => {
                    let id = d.user.substring(1);
                    let color = Math.pow(16, 6) * ((id * 14) % 15) + Math.pow(16, 5) * ((id * 13) % 15) + Math.pow(16, 4) * ((id * 12) % 15) + Math.pow(16, 3) * ((id * 11) % 15) + Math.pow(16, 2) * ((id * 9) % 15) + 16 * ((id * 7) % 15)
                    let hexValue = color + 0x00008a;
                    if (hexValue <= 0xffffff) { hexValue = ("00000" + hexValue).slice(-6); }
                    hexValue = hexValue.toString(16);
                    hexValue = hexValue.slice(0, 6);
                    console.log(hexValue)
                    return '#' + hexValue;
                })
        },
        changeStimuli: function() {
            const width = 1650 - this.margin.left - this.margin.right;
            const height = 1200 - this.margin.top - this.margin.bottom;
            d3.select("#scatter-plot-graphic").style('background-image', `url('/static/stimuli/${this.selectedStimuli}'`)
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
        }
    },
    template
})