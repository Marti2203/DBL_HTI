'use strict';
var ScatterPlot = {};
(() => {
    const componentName = 'scatter-plot';
    let template = `
<div id="${componentName}-root">
    <div class="border border-secondary, blocktext">
        <h3> Scatter Plot</h3>
        <p>
            In the scatter plot, the stimulus as well as the option to visualize all or one 
            participant can be chosen. The dots in the scatter plot represent one fixation of one 
            participant. When hovering over a point, it shows the time stamp, participant and 
            coordinates of that specific point. Try it!
        </p>
    </div>
    <div v-if="hasDataset">
        <label for="stimuli-selector">Select a Stimuli:</label>
        <select name="stimuli-selector" v-model="selectedStimuli" placeholder="Select a Stimuli">
            <option v-for="stimulus in stimuli">
                {{stimulus}}
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
        <button @click="resetCanvas()" v-if="scaledCanvas">Reset scale</button>  
        <div id="${componentName}-body" style='background-size:contain;' width='0' height='0'>
            <svg id='${componentName}-graphic'>    
            </svg>
        </div>
        <div id="${componentName}-tooltip" class="tooltip" style="opacity:0;"></div>
    </div>
</div>
`;

    ScatterPlot = Vue.component(componentName, {
        created: function() {
            this.$root.addDatasetListener(async(dataset) => this.stimuli = JSON.parse(await $.get(`/stimuliNames/${app.dataset}`)));

            this.zoom = d3.zoom();
            //this.svg.call(this.zoom.on("zoom", () => this.scaleCanvas(d3.event.transform)));
        },
        data: function() {
            return {
                data: [],
                stimuli: [],
                users: [],
                selectedStimuli: 'none',
                selectedUser: 'none',
                picked: 'all',
                scaledCanvas: false,
                zoom: null,
            };
        },
        watch: {
            selectedStimuli: async function(value) {
                this.picked = 'all';
                this.clearView();

                if (value == 'none') return;

                this.changeStimuli();
                this.data = JSON.parse(await $.get(`/data/${app.dataset}/${value}`));
                this.users = JSON.parse(await $.get(`/participants/${app.dataset}/${value}`));
                this.generatePointsForAll();
            },
            selectedUser: function(value) {
                if (value == 'none') return;

                this.generatePointsForUser();
            },
            picked: function(value) {
                if (value == 'one') return;

                this.selectedUser = 'none';
                this.generatePointsForAll();
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
            svg: () => d3.select(`#${componentName}-graphic`),
            tooltipDiv: () => d3.select(`#${componentName}-tooltip`),
            hasDataset: function() {
                return this.$root && this.$root.dataset != null;
            }
        },
        methods: {
            resetCanvas: function() {
                this.svg.call(this.zoom.transform, d3.zoomIdentity);
                this.scaledCanvas = false;
            },
            scaleCanvas: function(scale) {
                this.svg.attr("transform", scale);
                this.scaledCanvas = true;
            },
            clearView: function() {
                const graphic = d3.select(`#${componentName}-graphic`);
                graphic.style('background-image', '');
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
            changeStimuli: function() {
                const url = `/uploads/stimuli/${app.datasetName}/${this.selectedStimuli}`;
                const graphic = d3.select(`#${componentName}-graphic`);
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