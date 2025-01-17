'use strict';
var ScatterPlot = (() => {
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
    return Vue.component(componentName, {
        mixins: [SidebarComponentHandlerMixin, StimuliSelectionMixin, BackgroundTogglerMixin],
        data: function() {
            return {
                data: [],
                componentName
            };
        },
        mounted: function() {
            this.$root.requestSidebarComponent(UserSelector, "userSelector", async(selector) => {
                bind(selector, 'change-user', (event) => this.userChanged(event), this.customComponentListeners);
                bind(selector, 'picked-all', () => this.generatePointsForAll(), this.customComponentListeners);
                if (selector.selectedUser != 'none') {
                    this.userChanged(selector.selectedUser);
                }

                selector.picked = 'all';
            }, () => this.$root.$route.name == "ScatterPlot" && this.$root.hasDatasetSelected && this.hasSelectedStimuli);
        },
        computed: {
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
                this.generatePointsForAll();
            },
            userChanged: function(value) {
                if (value == 'none') return;
                this.generatePointsForUser(value);
            },
            clearView: function() {
                this.svg.style('background-image', '');
                this.clearPoints();
            },
            clearPoints: function() {
                this.g.selectAll("circle").remove();
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
                this.g
                    .selectAll("dot")
                    .data(filteredData)
                    .enter()
                    .append("circle")
                    .attr("cx", d => d.MappedFixationPointX)
                    .attr("cy", d => d.MappedFixationPointY)
                    .attr("r", 5)
                    .on("mouseover", (d) => {
                        setupTooltip(this.tooltipDiv, `Timestamp: ${d.Timestamp} </br> (${d.MappedFixationPointX},${d.MappedFixationPointY}) </br> User: ${d.user}`, d3.event.pageX, d3.event.pageY);
                    })
                    .on("mouseout", () => {
                        this.tooltipDiv.transition()
                            .duration(400)
                            .style("opacity", 0);
                    })
                    .style("fill", (d) => {
                        let id = +d.user.substring(1);
                        return generateColor(id);
                    });
            }
        },
        template
    });
})();