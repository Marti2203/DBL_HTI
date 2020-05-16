'use strict';
var ScatterPlot = {};
(() => {
    const componentName = 'scatter-plot';
    let template = `
    <div id="${componentName}-root">
    
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
            
    <div id="${componentName}-body" style='background-size:contain;' width='0' height='0'>
        <svg id='${componentName}-graphic'>    
        </svg>
    </div>
    <div id="${componentName}-tooltip" class="tooltip" style="opacity:0;"></div>
    </div>
`;

    ScatterPlot = Vue.component(componentName, {
        created: async function() {
            $.get('/stimuliNames', (stimuli) => {
                this.stimuli = JSON.parse(stimuli);
            });
            this.data = await d3.tsv("/static/csv/all_fixation_data_cleaned_up.csv");
            this.svg.call(d3.zoom().on("zoom", () => this.svg.attr("transform", d3.event.transform)));
        },
        data: function() {
            return {
                data: [],
                stimuli: [],
                users: [],
                selectedStimuli: 'none',
                selectedUser: 'none',
                picked: 'all'
            };
        },
        watch: {
            selectedStimuli: function(value) {
                this.picked = 'all';
                this.changeStimuli();
                this.generatePointsForAll();
            },
            selectedUser: function() {
                this.generatePointsForUser();
            },
            picked: async function(value) {
                if (value == 'one') {
                    this.users = JSON.parse(await $.get(`/users/${this.selectedStimuli}`));
                } else {
                    this.users = [];
                }
            }
        },
        computed: {
            hasSelectedStimuli: function() {
                return this.selectedStimuli != 'none';
            },
            svg: () => d3.select(`#${componentName}-graphic`),
            tooltipDiv: () => d3.select(`#${componentName}-tooltip`),
        },
        methods: {
            generatePointsForAll: function() {
                this.generatePoints(this.data.filter(d => d.StimuliName == this.selectedStimuli));
            },
            generatePointsForUser: function() {
                this.generatePoints(this.data.filter(d => d.user == this.selectedUser && d.StimuliName == this.selectedStimuli));
            },
            generatePoints: function(filteredData) {
                this.svg.selectAll("g").remove();
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

                        //The previous code was very disgusting to look at and currently this makes it more easily tweakabe
                        const seeds = [7, 9, 11, 12, 13, 14];
                        let hexValue = seeds.reduce((previous, current, i) => previous + Math.pow(16, i + 1) * ((id * current) % 15), 0x00008a)
                            .toString(16)
                            .slice(-6);
                        hexValue = "0".repeat(6 - hexValue.length) + hexValue;
                        return '#' + hexValue;
                    });
            },
            changeStimuli: function() {
                const url = `/static/stimuli/${this.selectedStimuli}`;
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