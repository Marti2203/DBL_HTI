'use strict';
var GazePlot = {};
(() => {
    const componentName = 'gaze-plot';
    let template = `
<div id="${componentName}-root">
    <div class="border border-secondary, block-text">
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

        <user-selector v-show="hasSelectedStimuli" ref="userSelector"
        @change-user="userChanged($event)"
        @picked-all="generateClustersForAll()"
        ></user-selector>
        
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
                stimulusSelector: null
            };
        },
        mounted: function() {
            this.$root.requestSidebarComponent(StimuliSelector, "stimuliSelector", async(selector) => {
                selector.$on('change-stimulus', (event) => this.stimulusChanged(event));
                selector.$on('reset-stimuli-set', (event) => this.stimuliReset(event));
                if (selector.currentStimulus != 'none') {
                    await this.stimulusChanged(selector.currentStimulus);
                }
                this.stimulusSelector = selector;
            }, () => this.hasDataset);
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
                this.$refs.userSelector.users = await this.$root.getUsersForStimulus(value);
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
                const clustersDataframe = await this.$root.getClustersForStimulus(this.stimulusSelector.currentStimulus, user);
                const clusters = convertDataframeToRowArray(clustersDataframe);
                return clusters;
            },

            renderClusters: function(clusters, user) {
                // Add the line
                this.svg.append("path")
                    .datum(clusters)
                    .attr("fill", "none")
                    .attr("stroke", (d) => {
                        let id = user.substring(1);
                        return generateColor(id, 'dd');
                    })
                    .attr("class", (d) => {
                        return user + ' line';
                    })
                    .attr("stroke-width", 5)
                    .attr("d", d3.line()
                        .x(d => +Math.round(d.xMean))
                        .y(d => +Math.round(d.yMean))
                    );
                let selected = 'none';
                let clusterGraphics = this.svg.append('g')


                .selectAll("dot")
                    .data(clusters)
                    .enter();
                clusterGraphics
                    .append("circle")
                    .attr("class", function(d) { return d.user + " dot"; })
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
                            .html(`Gaze: ${d.gaze} </br> (${d.xMean},${d.yMean}) </br> User: ${d.user}`)
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                    })
                    .on("click", (d) => {
                        if (selected != d.user) {
                            selected = selectSeries(selected, d);
                        } else {
                            deselectSeries(d);
                            selected = "none";
                        }
                    })
                    .on("mouseout", (d) => {
                        this.tooltipDiv.transition()
                            .duration(400)
                            .style("opacity", 0);
                    })
                    .style("fill", generateColor(+user.substring(1), 'dd'))
                    .style('stroke', '#808080dd');

                clusterGraphics
                    .append('text')
                    .text(d => d.gaze)
                    .attr('x', d => +Math.round(d.xMean))
                    .attr('y', d => +Math.round(d.yMean))
                    .attr("class", function(d) { return d.user + " text"; })
                    .attr('dominant-baseline', 'middle')
                    .attr('text-anchor', 'middle')
                    .attr('opacity', (d => +d.gaze / 30.0 + 0.15))
                    .attr('fill', 'white')
                    .attr('stroke', 'black')
                    .attr('font-size', 26)
                    .attr('stroke-width', 2)
                    .attr('font-weight', 900)
                    .on("click", (d) => {
                        if (selected != d.user) {
                            selected = selectSeries(selected, d);
                        } else {
                            deselectSeries(d);
                            selected = 'none';
                        }
                    });
            },
            userChanged: async function(value) {
                if (value == 'none') return;
                console.log(value);
                this.clearClusters();
                this.renderClusters(await this.getClusteredDataForUser(value), value);
            },
            generateClustersForAll: function() {
                this.clearClusters();
                this.renderingAll = true;
                this.$refs.userSelector.users.forEach(async(value, i) => {
                    this.renderClusters(await this.getClusteredDataForUser(value), value);
                    if (i == this.users.length - 1) {
                        this.renderingAll = false;
                    }
                });
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