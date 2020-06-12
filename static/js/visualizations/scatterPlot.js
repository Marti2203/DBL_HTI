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
        <user-selector v-show="hasSelectedStimuli" ref="userSelector"
        @change-user="userChanged($event)"
        @picked-all="generatePointsForAll()"
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
    ScatterPlot = Vue.component(componentName, {
        data: function() {
            return {
                data: [],
                hasSelectedStimuli: false,
            };
        },
        mounted: function() {
            this.$root.requestSidebarComponent(StimuliSelector, "stimuliSelector", async(selector) => {
                selector.$on('change-stimulus', (event) => this.stimulusChanged(event));
                selector.$on('reset-stimuli-set', (event) => this.stimuliReset(event));
                if (selector.currentStimulus != 'none') {
                    await this.stimulusChanged(selector.currentStimulus);
                }
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
            }
        },
        methods: {
            stimulusChanged: async function(value) {
                this.picked = 'all';
                this.clearView();

                if (value === 'none') return;

                this.hasSelectedStimuli = true;
                this.changeStimuliImage(value);
                this.data = await this.$root.getDataForStimulus(value);
                this.$refs.userSelector.users = await this.$root.getUsersForStimulus(value);
                this.generatePointsForAll();
            },
            stimuliReset: function() {
                this.data = [];
                this.$refs.userSelector.users = [];
                this.hasSelectedStimuli = false;
            },
            userChanged: async function(value) {
                if (value == 'none') return;
                this.generatePointsForUser(value);
            },
            clearView: function() {
                this.svg.style('background-image', '');
                this.clearPoints();
            },
            clearPoints: function() {
                this.svg.select("g").selectAll("dot").remove();
            },
            generatePointsForAll: function() {
                this.generatePoints(this.data);
            },
            generatePointsForUser: function(user) {
                this.generatePoints(this.data.filter(d => d.user == user));
            },
            generatePoints: function(filteredData) {
                this.clearPoints();
                // Add dots
                this.svg.select('g')
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