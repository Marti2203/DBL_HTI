'use strict';
var GazePlot = {};
(() => {
    const componentName = 'gaze-plot';
    let template = `
<div id="${componentName}-root">
    <h3> Gaze Plot</h3>
    <p>
    In the gaze plot, the stimulus as well as the option to visualize all or one 
    participant can be chosen. The circles in the gaze plot represent a gaze of one
    participant which is connected to the next and previous gaze. Visualizing all 
    participants at once might get cluttered, so beware!
    </p>
    <div v-if="hasDataset">
        <label for="stimuli-selector">Select a Stimuli:</label>
        <select name="stimuli-selector" v-model="selectedStimuli" placeholder="Select a Stimuli">
            <option v-for="stimul in stimuli">{{stimul}}</option>
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
        
        <div id="${componentName}-body" style='background-size:contain;' width='0' height='0'>
            <svg id='${componentName}-graphic'></svg>
        </div>
        <div id="${componentName}-tooltip" class="tooltip" style="opacity:0;"></div>
    </div>
</div>
`;

    GazePlot = Vue.component(componentName, {
        created: function() {
            this.$root.addDatasetListener(async(dataset) => this.stimuli = JSON.parse(await $.get(`/stimuliNames/${dataset}`)));
        },
        data: function() {
            return {
                data: [],
                stimuli: [],
                users: [],
                selectedStimuli: 'none',
                selectedUser: 'none',
                picked: 'one',
                componentName
            };
        },
        watch: {
            selectedStimuli: async function(value) {
                this.picked = 'one';
                this.clearView();
                if (value == 'none') return;
                this.users = JSON.parse(await $.get(`/participants/${app.dataset}/${value}`));
                this.changeStimuli();
            },
            selectedUser: async function(value) {
                if (value == 'none')
                    return;
                if (this.picked == 'one') {
                    this.generateClusters(await this.getClusteredDataForUser());
                } else {
                    this.generateClusters(await this.getClusteredData());
                }
            },
            picked: async function(value) {
                if (value == 'one') return;
                for (let index = 0; index < this.users.length; index++) {
                    const u = this.users[index];
                    this.selectedUser = u;
                    this.generateClusters(await this.getClusteredData());
                }
                this.selectedUser = 'none';
            },
            stimuli: function() {
                this.data = [];
                this.selectedUser = 'none';
                this.selectedStimuli = 'none';
            }
        },
        computed: {
            hasSelectedStimuli: function() {
                return this.selectedStimuli != 'none';
            },
            svg: function() {
                return d3.select(`#${this.componentName}-graphic`);
            },
            tooltipDiv: function() {
                return d3.select(`#${this.componentName}-tooltip`);
            },
            hasDataset: function() {
                return this.$root && this.$root.dataset != null;
            },
        },
        methods: {
            getClusteredData: async function() {
                const clustersDataframe = JSON.parse(await $.get(`/clusters/${app.dataset}/${this.selectedStimuli}/${this.selectedUser}`));
                const clusters = this.convertDfToRowArray(clustersDataframe);
                return clusters;
            },
            clearView: function() {
                this.clearClusters();
                const graphic = d3.select(`#${this.componentName}-graphic`);
                graphic.style('background-image', ``);
            },
            clearClusters: function() {
                this.svg.selectAll("g").remove();
                this.svg.selectAll("path").remove();
            },
            getClusteredDataForUser: async function() {
                const clustersDataframe = JSON.parse(await $.get(`/clusters/${app.dataset}/${this.selectedStimuli}/${this.selectedUser}`));
                const clusters = this.convertDfToRowArray(clustersDataframe);
                return clusters;
            },
            convertDfToRowArray: function(dataframe) {
                const keys = Object.keys(dataframe);
                const length = Object.keys(dataframe[keys[0]]).length;
                const result = [];
                for (let i = 0; i < length; i++) {
                    const object = {};
                    keys.forEach(key => object[key] = dataframe[key][i]);
                    result.push(object);
                }
                return result;
            },
            generateClusters: function(clusters) {
                // Add the line
                this.svg.append("path")
                    .datum(clusters)
                    .attr("fill", "none")
                    .attr("stroke", (d) => {
                        let id = this.selectedUser.substring(1);
                        return generateColor(id) + 'dd';
                    })
                    .attr("stroke-width", 4)
                    .attr("d", d3.line()
                        .x(d => +Math.round(d.xMean))
                        .y(d => +Math.round(d.yMean))
                    );
                // Add dots
                let label = 1;
                let clusterGraphics = this.svg.append('g')

                .selectAll("dot")
                    .data(clusters)
                    .enter();
                clusterGraphics
                    .append("circle")
                    .attr("cx", d => +Math.round(d.xMean))
                    .attr("cy", d => +Math.round(d.yMean))
                    .attr("r", function(d) {
                        return Math.round(+d.radius / 8 + 12);
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
                        let id = +this.selectedUser.substring(1);
                        return generateColor(id) + 'dd';
                    })
                    .style('stroke', 'grey');

                clusterGraphics.append('text').text(d => d.gaze)
                    .attr('x', d => +Math.round(d.xMean))
                    .attr('y', d => +Math.round(d.yMean))
                    .attr('dominant-baseline', 'middle')
                    .attr('text-anchor', 'middle')
                    .attr('opacity', (d => +d.gaze / 30.0 + 0.15))
                    .attr('fill', 'white')
                    .attr('stroke', 'black')
                    .attr('font-size', 26)
                    .attr('stroke-width', 2)
                    .attr('font-weight', 900);
            },
            changeStimuli: function() {
                const url = `/uploads/stimuli/${app.datasetName}/${this.selectedStimuli}`;
                const graphic = d3.select(`#${this.componentName}-graphic`);
                let img = new Image();
                img.onload = function() {
                    graphic.attr("width", this.width);
                    graphic.attr("height", this.height);
                };
                img.src = url;
                graphic.style('background-image', `url('${url}')`);

            }
        },
        template
    });
})();