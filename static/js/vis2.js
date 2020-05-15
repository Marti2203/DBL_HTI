'use strict';

//Margins are used by D3 only

const marginGazePlot = { top: 10, right: 30, bottom: 30, left: 60 }
const templateGazePlot = `
<div id="gaze-plot-root">
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

    <div id="gaze-plot-body" style='background-size:contain;' width='0' height='0'>
        <svg id='gaze-plot-graphic'>
        
        </svg>
    </div>
    <div id="gaze-plot-tooltip"></div>
</div>
`


// set the dimensions and margins of the graph
var GazePlot = Vue.component('gaze-plot', {
    created: async function () {
        $.get('/stimuliNames', (stimuli) => {
            this.stimuli = JSON.parse(stimuli)
        })
    },
    data: function () {
        return {
            data: [],
            stimuli: [],
            users: [],
            selectedStimuli: 'none',
            selectedUser: 'none',
            picked: 'one',
            marginGazePlot

        }
    },
    watch: {
        selectedStimuli: async function () {
            this.picked = 'one'
            this.users = JSON.parse(await $.get(`/users/${this.selectedStimuli}`))
            this.changeStimuli()
            this.svg.selectAll("g").remove();
            this.svg.selectAll("path").remove();
            
        },
        selectedUser: async function () {
            if (this.picked == 'one') {
                this.generateClusters(await this.getClusteredDataForUser())
            } else {
                this.generateClusters(await this.getClusteredData())
            }
        },
        picked: async function (value) {
            if (value == 'one') {
                this.users = JSON.parse(await $.get(`/users/${this.selectedStimuli}`))
                // for (let user in this.users) {
                //     this.selectedUser = user
                //     console.log(user)
                // }
            } else {
                this.users = JSON.parse(await $.get(`/users/${this.selectedStimuli}`))
                this.svg.selectAll("g").remove();
                this.svg.selectAll("path").remove();
                for (let index = 0; index < this.users.length; index++) {
                    const u = this.users[index];
                    this.selectedUser = u
                    this.generateClusters(await this.getClusteredData())
                }
                
            }
        }
    },
    computed: {
        hasSelectedStimuli: function () {
            return this.selectedStimuli != 'none'
        },
        svg: () => d3.select("#gaze-plot-graphic"),
        tooltipDiv: () => d3.select("#gaze-plot-tooltip")
            .attr("class", "tooltip")
            .style("opacity", 0),
    },
    methods: {
        getClusteredData: async function () {
            const clustersDataframe = JSON.parse(await $.get(`/clusters/${this.selectedStimuli}/${this.selectedUser}`))
            const clusters = this.convertDfToRowArray(clustersDataframe)
            return clusters
        },
        getClusteredDataForUser: async function() {
            this.svg.selectAll("g").remove();
            this.svg.selectAll("path").remove();
            const clustersDataframe = JSON.parse(await $.get(`/clusters/${this.selectedStimuli}/${this.selectedUser}`))
            const clusters = this.convertDfToRowArray(clustersDataframe)
            return clusters
        },
        convertDfToRowArray: function (dataframe) {
            const keys = Object.keys(dataframe)
            const length = Object.keys(dataframe[keys[0]]).length;
            const result = []
            for (let i = 0; i < length; i++) {
                const object = {}
                keys.forEach(key => object[key] = dataframe[key][i])
                result.push(object)
            }
            return result;
        },
        generateClusters: function (clusters) {
            // Add the line
            this.svg.append("path")
                .datum(clusters)
                .attr("fill", "none")
                .attr("stroke", (d) => {
                    let id = this.selectedUser.substring(1);
                    let color = Math.pow(16, 6) * ((id * 14) % 15) + Math.pow(16, 5) * ((id * 13) % 15) + Math.pow(16, 4) * ((id * 12) % 15) + Math.pow(16, 3) * ((id * 11) % 15) + Math.pow(16, 2) * ((id * 9) % 15) + 16 * ((id * 7) % 15)
                    let hexValue = color + 0x00008a;
                    if (hexValue <= 0xffffff) { hexValue = ("00000" + hexValue).slice(-6); }
                    hexValue = hexValue.toString(16);
                    hexValue = hexValue.slice(0, 6);
                    return '#' + hexValue + 'dd';
                })
                .attr("stroke-width", 4)
                .attr("d", d3.line()
                    .x(d => +Math.round(d.xMean))
                    .y(d => +Math.round(d.yMean))
                )
            // Add dots
            let label = 1
            let clusterGraphics = this.svg.append('g')

                .selectAll("dot")
                .data(clusters)
                .enter(); 
                clusterGraphics
                .append("circle")
                .attr("cx", d => +Math.round(d.xMean))
                .attr("cy", d => +Math.round(d.yMean))
                .attr("r", function (d) {
                    return Math.round(+d.radius / 8 + 12)
                })
            // Add text
                .on("mouseover", (d) => {
                    this.tooltipDiv.transition()
                        .duration(200)
                        .style("opacity", .9);
                    this.tooltipDiv
                        .html(`(${d.gaze})`)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                })
                .on("mouseout", (d) => {
                    this.tooltipDiv.transition()
                        .duration(400)
                        .style("opacity", 0);
                })
                .style("fill", (d) => {
                    let id = this.selectedUser.substring(1);
                    let color = Math.pow(16, 6) * ((id * 14) % 15) + Math.pow(16, 5) * ((id * 13) % 15) + Math.pow(16, 4) * ((id * 12) % 15) + Math.pow(16, 3) * ((id * 11) % 15) + Math.pow(16, 2) * ((id * 9) % 15) + 16 * ((id * 7) % 15)
                    let hexValue = color + 0x00008a;
                    if (hexValue <= 0xffffff) { hexValue = ("00000" + hexValue).slice(-6); }
                    hexValue = hexValue.toString(16);
                    hexValue = hexValue.slice(0, 6);
                    return '#' + hexValue + 'dd';
                })
                .style('stroke', 'grey')

                clusterGraphics.append('text').text(d => d.gaze)
                .attr('x', d => +Math.round(d.xMean))
                .attr('y', d => +Math.round(d.yMean))
                .attr('dominant-baseline', 'middle')
                .attr('text-anchor', 'middle')
                .attr('opacity', (d => +d.gaze/30.0 + 0.15))
                .attr('fill', 'white')
                .attr('stroke', 'black')
                .attr('font-size', 26)
                .attr('stroke-width', 2)
                .attr('font-weight', 900)
        },
        changeStimuli: function () {
            const width = 1650 - this.marginGazePlot
                .left - this.marginGazePlot
                    .right;
            const height = 1200 - this.marginGazePlot
                .top - this.marginGazePlot
                    .bottom;
            d3.select("#gaze-plot-graphic").style('background-image', `url('/static/stimuli/${this.selectedStimuli}'`)
                .attr("width", width + marginGazePlot
                    .left + marginGazePlot
                        .right)
                .attr("height", height + marginGazePlot
                    .top + marginGazePlot
                        .bottom)
        }
    },
    template: templateGazePlot
})