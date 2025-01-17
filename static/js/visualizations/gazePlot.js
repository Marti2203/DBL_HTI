'use strict';
var GazePlot = (() => {
    const componentName = 'gaze-plot';
    let template = `
<div id="${componentName}-root">
    <div class="border border-secondary, block-text">
        <h3> Gaze Plot</h3>
        <p>
        In the gaze plot, the stimulus as well as the option to visualize all or one 
        participant can be chosen. The circles in the gaze plot represent a gaze of one
        participant which is connected to the next and previous gaze. Visualizing all 
        participants at once might get cluttered, click one gaze to highlight and inspect it!
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
                renderingAll: false,
                stimulusSelector: null,
                currentStimulus: null,
                componentName
            };
        },
        mounted: function() {
            this.$root.requestSidebarComponent(UserSelector, "userSelector", async(selector) => {
                bind(selector, 'change-user', (event) => this.userChanged(event), this.customComponentListeners);
                bind(selector, 'picked-all', () => this.generateClustersForAll(selector.users), this.customComponentListeners);

                if (selector.selectedUser != 'none') {
                    this.userChanged(selector.selectedUser);
                }
                selector.picked = 'one';
            }, () => this.$root.$route.name == "GazePlot" && this.$root.hasDatasetSelected && this.hasSelectedStimuli && !this.renderingAll);

        },
        computed: {
            tooltipDiv: () => d3.select(`#${componentName}-tooltip`),
            hasDataset: function() {
                return this.$root.hasDatasetSelected;
            },
        },
        methods: {
            stimulusChanged: async function(value) {
                this.clearView();

                if (value === 'none') return;
                this.currentStimulus = value;
                this.hasSelectedStimuli = true;
                this.changeStimuliImage(value);
            },
            clearView: function() {
                this.clearClusters();
                this.svg.style('background-image', ``);
            },
            clearClusters: function() {
                this.g.selectAll("circle").remove();
                this.g.selectAll("path").remove();
                this.g.selectAll("text").remove();
            },
            getClusteredDataForUser: async function(user) {
                if (!this.currentStimulus)
                    return;

                const clustersDataframe = await this.$root.getClustersForStimulus(this.currentStimulus, user);
                return convertDataframeToRowArray(clustersDataframe);
            },

            generateClusters: function(clusters, user) {
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
                        setupTooltip(this.tooltipDiv, `Gaze: ${d.gaze} </br> Fixations: ${d.count} </br>(${roundTo(d.xMean)},${roundTo(d.yMean)}) </br> User: ${d.user}`, d3.event.pageX, d3.event.pageY);
                    })
                    .on("mouseout", () => {
                        this.tooltipDiv.transition()
                            .duration(400)
                            .style("opacity", 0);
                    })
                    .on("click", (d) => {
                        if (selectedUser != d.user) {
                            selectSeries(d.user);
                            selectedUser = d.user;
                        } else {
                            deselectSeries(d);
                            selectedUser = "none";
                        }
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
                            selectSeries(d.user);
                            selectedUser = d.user;
                        } else {
                            deselectSeries(d);
                            selectedUser = 'none';
                        }
                    });
            },
            userChanged: async function(value) {
                if (value == 'none') return;
                this.clearClusters();
                this.generateClusters(await this.getClusteredDataForUser(value), value);
            },
            generateClustersForAll: async function(users) {
                this.clearClusters();
                this.renderingAll = true;
                for (let user of users) {
                    this.generateClusters(await this.getClusteredDataForUser(user), user);
                }
                this.renderingAll = false;
            },
        },
        template
    });
})();