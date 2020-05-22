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
                picked: 'one',
                componentName
            };
        },
        destroyed: function() {
            this.data = null;
        },
        watch: {
            selectedStimuli: async function() {
                this.picked = 'one';
                this.users = JSON.parse(await $.get(`/users/${this.selectedStimuli}`));
                this.changeStimuli();
                this.svg.selectAll("g").remove();
                this.svg.selectAll("path").remove();

            },
            selectedUser: async function() {
                if (this.picked == 'one') {
                    this.generateClusters(await this.getClusteredDataForUser());
                } else {
                    this.generateClusters(await this.getClusteredData());
                }
            },
            picked: async function(value) {
                if (value == 'one') {
                    this.users = JSON.parse(await $.get(`/users/${this.selectedStimuli}`));
                } else {
                    this.users = JSON.parse(await $.get(`/users/${this.selectedStimuli}`));
                    this.svg.selectAll("g").remove();
                    this.svg.selectAll("path").remove();
                    for (let index = 0; index < this.users.length; index++) {
                        const u = this.users[index];
                        this.selectedUser = u;
                        this.generateClusters(await this.getClusteredData());
                    }

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
            getClusteredData: async function() {
                const clustersDataframe = JSON.parse(await $.get(`/clusters/${this.selectedStimuli}/${this.selectedUser}`));
                const clusters = this.convertDfToRowArray(clustersDataframe);
                return clusters;
            },
            getClusteredDataForUser: async function() {
                this.svg.selectAll("g").remove();
                this.svg.selectAll("path").remove();
                const clustersDataframe = JSON.parse(await $.get(`/clusters/${this.selectedStimuli}/${this.selectedUser}`));
                const clusters = this.convertDfToRowArray(clustersDataframe);
                return clusters;
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
                // Add the line
                this.svg.append("path")
                    .datum(clusters)
                    .attr("fill", "none")
                    .attr("stroke", (d) => {
                        let id = this.selectedUser.substring(1);
                        let color = Math.pow(16, 6) * ((id * 14) % 15) + Math.pow(16, 5) * ((id * 13) % 15) + Math.pow(16, 4) * ((id * 12) % 15) + Math.pow(16, 3) * ((id * 11) % 15) + Math.pow(16, 2) * ((id * 9) % 15) + 16 * ((id * 7) % 15);
                        let hexValue = color + 0x00008a;
                        if (hexValue <= 0xffffff) { hexValue = ("00000" + hexValue).slice(-6); }
                        hexValue = hexValue.toString(16);
                        hexValue = hexValue.slice(0, 6);
                        return '#' + hexValue + 'dd';
                    })
                    .attr("stroke-width", 4)
                    .attr("d", d3.line()
                        .x(d => +Math.round(d.xMean))
                        .y(d => +Math.round(d.yMean))
                    );
                // Add dots
                let label = 1;
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
                    .style("fill", (d) => {
                        let id = +this.selectedUser.substring(1);
                        return generateColor(id)+'dd';
                    })
                    .style('stroke', 'grey');

                clusterGraphics.append('text').text(d => d.gaze)
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
