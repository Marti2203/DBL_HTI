'use strict';
var GazePlot = {};
(() => {
    const componentName = 'gaze-plot';
    let template = `
<div id="${componentName}-root">
    <div class="border border-secondary, blocktext">
        <h3> Gaze Plot</h3>
        <p>
        In the gaze plot, the stimulus as well as the option to visualize all or one 
        participant can be chosen. The circles in the gaze plot represent a gaze of one
        participant which is connected to the next and previous gaze. Visualizing all 
        participants at once might get cluttered, so beware!
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
            <div v-if="!renderingAll">
                <input type="radio" id="one" value="one" v-model="picked">
                <label for="one">One user</label>
            </div>
            
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
        data: function() {
            return {
                data: [],
                users: [],
                selectedUser: 'none',
                picked: 'one',
                renderingAll: false,
                hasSelectedStimuli: false,
            };
        },
        watch: {
            selectedUser: async function(value) {
                if (value == 'none') return;
                this.clearClusters();
                this.renderClusters(await this.getClusteredDataForUser(value), value);
            },
            picked: async function(value) {
                if (value == 'one') return;

                this.clearClusters();
                this.selectedUser = 'none';
                this.renderingAll = true;
                this.users.forEach(async(user, i) => {
                    this.renderClusters(await this.getClusteredDataForUser(user), user);
                    if (i == this.users.length - 1) {
                        this.renderingAll = false;
                    }
                });
            },
        },
        computed: {
            svg: function() {
                return d3.select(`#${componentName}-graphic`);
            },
            tooltipDiv: function() {
                return d3.select(`#${componentName}-tooltip`);
            },
            hasDataset: function() {
                return this.$root.hasDatasetSelected;
            },
        },
        methods: {
            stimuliReset: function() {
                this.data = [];
                this.users = [];
                this.selectedUser = 'none';
                this.hasSelectedStimuli = false;
            },
            stimulusChanged: async function(value) {
                this.picked = 'one';
                this.selectedUser = 'none';
                this.clearView();

                if (value == 'none') return;

                this.hasSelectedStimuli = true;
                this.users = await this.$root.getUsersForStimulus(value);
                this.changeStimuliImage(value);
            },
            clearView: function() {
                this.clearClusters();
                this.svg.style('background-image', ``);
            },
            clearClusters: function() {
                this.svg.selectAll("g").remove();
                this.svg.selectAll("path").remove();
            },
            getClusteredDataForUser: async function(user) {
                const clustersDataframe = await this.$root.getClustersForStimulus(this.$refs.stimuliSelector.currentStimulus, user);
                const clusters = convertDataframeToRowArray(clustersDataframe);
                return clusters;
            },

            renderClusters: function(clusters, user) {
                // Add the line
                this.svg.append("path")
                    .datum(clusters)
                    .attr("fill", "none")
                    .attr("stroke", generateColor(+user.substring(1), 'dd'))
                    .attr("stroke-width", 4)
                    .attr("d", d3.line()
                        .x(d => +Math.round(d.xMean))
                        .y(d => +Math.round(d.yMean))
                    );
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
                    .style("fill", generateColor(+user.substring(1), 'dd'))
                    .style('stroke', 'grey');

                clusterGraphics
                    .append('text')
                    .text(d => d.gaze)
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
            changeStimuliImage: function(value) {
                const url = `/uploads/stimuli/${app.datasetName}/${value}`;
                const base = this;
                let img = new Image();
                img.onload = function() {
                    base.svg.attr("width", this.width);
                    base.svg.attr("height", this.height);
                };
                img.src = url;
                this.svg.style('background-image', `url('${url}')`);

            },
        },
        template
    });
})();