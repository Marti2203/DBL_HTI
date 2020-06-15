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
                renderingAll: false,
                hasSelectedStimuli: false,
                stimulusSelector: null,
                customComponentListeners: [],
                backgroundImageURL: ''
            };
        },
        mounted: function() {
            this.$root.requestSidebarComponent(StimuliSelector, "stimuliSelector", async(selector) => {
                this.stimulusSelector = selector;
                bind(selector, 'change-stimulus', (event) => this.stimulusChanged(event), this.customComponentListeners);
                bind(selector, 'reset-stimuli-set', (event) => this.stimuliReset(event), this.customComponentListeners);

                if (selector.currentStimulus != 'none') {
                    await this.stimulusChanged(selector.currentStimulus);
                }

            }, () => this.$root.hasDatasetSelected);

            this.$root.requestSidebarComponent(UserSelector, "userSelector", async(selector) => {
                bind(selector, 'change-user', (event) => this.userChanged(event), this.customComponentListeners);
                bind(selector, 'picked-all', () => this.generateClustersForAll(selector.users), this.customComponentListeners);

                if (selector.selectedUser != 'none') {
                    this.userChanged(selector.selectedUser);
                }
                selector.picked = 'one';
            }, () => this.$root.hasDatasetSelected && this.hasSelectedStimuli && !this.renderingAll);

            this.$root.requestSidebarComponent(BackgroundToggler, "backgroundToggler", async(toggler) => {
                bind(toggler, 'hide-background', (event) => this.hideBackground(), this.customComponentListeners);
                bind(toggler, 'show-background', (event) => this.showBackground(), this.customComponentListeners);
                toggler.isBackgroundVisible=true;
            }, () => this.$root.hasDatasetSelected);
        },
        destroyed: function() {
            this.customComponentListeners.forEach(obj => obj.component.$off(obj.event, obj.handler));
            this.customComponentListeners = [];
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
                this.hasSelectedStimuli = false;
            },
            stimulusChanged: async function(value) {
                this.picked = 'one';
                this.selectedUser = 'none';
                this.clearView();

                if (value === 'none') return;

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
                if (!this.stimulusSelector.currentStimulus)
                    return;

                const clustersDataframe = await this.$root.getClustersForStimulus(this.stimulusSelector.currentStimulus, user);
                return convertDataframeToRowArray(clustersDataframe);
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
                this.clearClusters();
                this.renderClusters(await this.getClusteredDataForUser(value), value);
            },
            generateClustersForAll: async function(users) {
                this.clearClusters();
                this.renderingAll = true;
                for (let user of users) {
                    this.renderClusters(await this.getClusteredDataForUser(user), user);
                }
                this.renderingAll = false;
            },
            changeStimuliImage: function(value) {
                const url = `/uploads/stimuli/${app.datasetName}/${value}`;
                this.backgroundImageURL = url;
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
            },

            showBackground: function(){
                this.image.attr('href', this.backgroundImageURL);
            },

            hideBackground: function(){
                this.image.attr('href', '');
            }
        },
        template
    });
})();