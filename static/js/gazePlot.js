'use strict';
var GazePlot = {};
(() => {
    const componentName = 'gaze-plot';
    let template = `
<div id="${componentName}-root">
    <label for="stimuli-selector">Select a Stimuli:</label>
    <select name="stimuli-selector" v-model="selectedStimuli" placeholder="Select a Stimuli">
    <option v-for="stimul in stimuli">
    {{stimul}}
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

    <div id="${componentName}-body" style='background-size:contain;' width='0' height='0'>
        <svg id='${componentName}-graphic'>
        
        </svg>
    </div>
    <div id="${componentName}-tooltip" class="tooltip" style="opacity:0;"></div>
</div>
`;

    GazePlot = Vue.component(componentName, {
        created: async function() {
            $.get('/stimuliNames', (stimuli) => {
                this.stimuli = JSON.parse(stimuli);
            });
        },
        data: function() {
            return {
                data: [],
                stimuli: [],
                users: [],
                selectedStimuli: 'none',
                selectedUser: 'none',
                picked: 'all',
                componentName
            };
        },
        watch: {
            selectedStimuli: async function() {
                this.picked = 'all';
                await this.getClusteredData();
                this.changeStimuli();
                this.generateClustersForAll();
            },
            selectedUser: function() {
                this.generatePointsForUser();
            },
            picked: function(value) {
                if (value == 'one') {
                    this.users = [...new Set(this.data.filter(d => d.StimuliName == this.selectedStimuli).map(d => d.user))];
                } else {
                    this.users = [];
                }
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
            }
        },
        methods: {
            print: () => console.log('hi!'),
            generateClustersForAll: function() {
                this.generateClusters(this.clusters);
            },
            generateClusterForUser: function() {
                this.generateClusters(this.data.filter(d => d.user == this.selectedUser && d.StimuliName == this.selectedStimuli));
            },
            getClusteredData: async function() {
                let data = await $.get(`/clusters/${this.selectedStimuli}`);
                const clustersDataframe = typeof data == 'string' ? JSON.parse(data) : data;
                const clusters = this.convertDfToRowArray(clustersDataframe);
                this.clusters = clusters;
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
                this.svg.selectAll("g").remove();
                // Add dots
                this.svg.append('g')
                    .selectAll("dot")
                    .data(clusters)
                    .enter()
                    .append("circle")
                    .attr("cx", d => d.MappedFixationPointX)
                    .attr("cy", d => d.MappedFixationPointY)
                    .attr("r", d => d.radius / 10)
                    .on("mouseover", (d) => {
                        this.tooltipDiv.transition()
                            .duration(200)
                            .style("opacity", .9);
                        this.tooltipDiv
                            .html(`(${d.MappedFixationPointX},${d.MappedFixationPointY})`)
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                    })
                    .on("mouseout", (d) => {
                        this.tooltipDiv.transition()
                            .duration(400)
                            .style("opacity", 0);
                    })
                    .style("fill", '#00ff00');
            },
            changeStimuli: function() {
                const url = `/static/stimuli/${this.selectedStimuli}`;
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