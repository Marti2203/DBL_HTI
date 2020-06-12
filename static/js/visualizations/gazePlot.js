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
            <svg id='${componentName}-svg'>
                <g id='${componentName}-graphics'>
                    <image id='${componentName}-image'></image>
                </g>    
            </svg>
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
            }, () => this.$root.hasDatasetSelected);
        },
        computed: {
            svg: function() {
                let res = d3.select(`#${componentName}-svg`);
                let zoom = d3.zoom().scaleExtent([1, 50]).on('zoom', () => {
                    const width = res.attr('width');
                    const height = res.attr('height');
                    let transform = d3.event.transform;
                    transform.x = Math.min(0, Math.max(transform.x, width - width * transform.k));
                    transform.y = Math.min(0, Math.max(transform.y, height - height * transform.k));
                    this.g.attr('transform', transform.toString());
                });
                this.g.call(zoom);
                return res;
            },
            g: () => d3.select(`#${componentName}-graphics`),
            image: () => d3.select(`#${componentName}-image`),
            tooltipDiv: () => d3.select(`#${componentName}-tooltip`),
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

                if (value === 'none') return;

                this.hasSelectedStimuli = true;
                this.$refs.userSelector.users = await this.$root.getUsersForStimulus(value);
                this.changeStimuliImage(value);
            },
            clearView: function() {
                this.clearClusters();
                this.svg.style('background-image', ``);
            },
            clearClusters: function() {
                this.g.selectAll("dot").remove();
                this.g.selectAll("path").remove();
            },
            getClusteredDataForUser: async function(user) {
                const clustersDataframe = await this.$root.getClustersForStimulus(this.stimulusSelector.currentStimulus, user);
                const clusters = convertDataframeToRowArray(clustersDataframe);
                return clusters;
            },

            renderClusters: function(clusters, user) {
                // Add the line
                let id = user.substring(1);
                let color = generateColor(id, 'dd');
                this.g.append("path")
                    .datum(clusters)
                    .attr("fill", "none")
                    .attr("stroke", color)
                    .attr("class", `${user} line`)
                    .attr("stroke-width", 5)
                    .attr("d", d3.line()
                        .x(d => +Math.round(d.xMean))
                        .y(d => +Math.round(d.yMean))
                    );
                let selectedUser = 'none';

                let clusterGraphics = this.g
                    .selectAll("dot")
                    .data(clusters)
                    .enter();

                clusterGraphics
                    .append("circle")
                    .attr("class", d => `${d.user} dot`)
                    .attr("cx", d => +Math.round(d.xMean))
                    .attr("cy", d => +Math.round(d.yMean))
                    .attr("r", d => Math.round(+d.radius / 8 + 12))
                    // Add text
                    .on("mouseover", (d) => {
                        if (selectedUser !== 'none' && selectedUser !== d.user)
                            return;
                        this.tooltipDiv.transition()
                            .duration(200)
                            .style("opacity", .9);
                        this.tooltipDiv
                            .html(`Gaze: ${d.gaze} </br> (${d.xMean},${d.yMean}) </br> User: ${d.user}`)
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                    })
                    .on("click", (d) => {
                        if (selectedUser != d.user) {
                            selectedUser = selectSeries(selectedUser, d);
                        } else {
                            deselectSeries(d);
                            selectedUser = "none";
                        }
                    })
                    .on("mouseout", (d) => {
                        this.tooltipDiv.transition()
                            .duration(400)
                            .style("opacity", 0);
                    })
                    .style("fill", color)
                    .style('stroke', '#808080dd');

                clusterGraphics
                    .append('text')
                    .text(d => d.gaze)
                    .attr('x', d => +Math.round(d.xMean))
                    .attr('y', d => +Math.round(d.yMean))
                    .attr("class", (d) => `${d.user} text`)
                    .attr('dominant-baseline', 'middle')
                    .attr('text-anchor', 'middle')
                    .attr('opacity', (d => +d.gaze / 30.0 + 0.15))
                    .attr('fill', 'white')
                    .attr('stroke', 'black')
                    .attr('font-size', 26)
                    .attr('stroke-width', 2)
                    .attr('font-weight', 900)
                    .on("click", (d) => {
                        if (selectedUser != d.user) {
                            selectedUser = selectSeries(selectedUser, d);
                        } else {
                            deselectSeries(d);
                            selectedUser = 'none';
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
                let img = new Image();
                let base = this;
                img.onload = function() {
                    base.svg.attr("width", this.width);
                    base.svg.attr("height", this.height);

                    base.image.attr("width", this.width);
                    base.image.attr("height", this.height);
                };
                img.src = url;
                this.image.attr('href', url);
            }
        },
        template
    });
})();