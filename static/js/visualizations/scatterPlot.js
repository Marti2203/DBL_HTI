'use strict';
var ScatterPlot = {};
(() => {
    const componentName = 'scatter-plot';
    let template = `
<div id="${componentName}-root">
    <div class="border border-secondary block-text">
        <h3> Scatter Plot</h3>
        <p>
            In the scatter plot, the stimulus as well as the option to visualize all or one 
            participant can be chosen. The dots in the scatter plot represent one fixation of one 
            participant. When hovering over a point, it shows the time stamp, participant and 
            coordinates of that specific point. Try it!
        </p>
    </div>
    <div v-if="hasDataset">
        <stimuli-selector ref="stimuliSelector" 
        @change-stimulus="stimulusChanged($event)"
        @reset-stimuli-set="stimuliReset($event)"
        ></stimuli-selector>
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
            <svg id='${componentName}-graphic'>    
            </svg>
        </div>
        <div id="${componentName}-tooltip" class="tooltip" style="opacity:0;"></div>
    </div>
</div>
`;
    ScatterPlot = Vue.component(componentName, {
        data: function() {
            return {
                data: [],
                users: [],
                selectedUser: 'none',
                picked: 'all',
                hasSelectedStimuli: false,
            };
        },
        watch: {
            selectedUser: function(value) {
                if (value == 'none') return;
                this.generatePointsForUser();
            },
            picked: function(value) {
                if (value == 'one') return;

                this.selectedUser = 'none';
                this.generatePointsForAll();
            },
        },
        computed: {
            svg: function() { return d3.select(`#${componentName}-graphic`); },
            tooltipDiv: function() { return d3.select(`#${componentName}-tooltip`); },
            hasDataset: function() {
                return this.$root.hasDatasetSelected;
            }
        },
        methods: {
            stimulusChanged: async function(value) {
                this.picked = 'all';
                this.clearView();

                if (value == 'none') return;

                this.hasSelectedStimuli = true;
                this.changeStimuliImage(value);
                this.data = await this.$root.getDataForStimulus(value);
                this.users = await this.$root.getUsersForStimulus(value);
                this.generatePointsForAll();
            },
            stimuliReset: function() {
                this.data = [];
                this.users = [];
                this.selectedUser = 'none';
                this.hasSelectedStimuli = false;
            },
            clearView: function() {
                this.svg.style('background-image', '');
                this.clearPoints();
            },
            clearPoints: function() {
                this.svg.selectAll("g").remove();
            },
            generatePointsForAll: function() {
                this.generatePoints(this.data);
            },
            generatePointsForUser: function() {
                this.generatePoints(this.data.filter(d => d.user == this.selectedUser));
            },
            generatePoints: function(filteredData) {
                this.clearPoints();
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
                        let id = +d.user.substring(1);
                        return generateColor(id);
                    });
            },
            changeStimuliImage: function(value) {
                const url = `/uploads/stimuli/${app.datasetName}/${value}`;
                let img = new Image();
                let base = this;
                img.onload = function() {
                    base.svg.attr("width", this.width);
                    base.svg.attr("height", this.height);
                };
                img.src = url;
                this.svg.style('background-image', `url('${url}')`);
            }
        },
        template
    });
})();