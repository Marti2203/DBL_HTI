'use strict';
var GazeStripes = {};
(() => {
    const componentName = 'gaze-stripes';
    let template = `
<div id="${componentName}-root">
    <label for="stimuli-selector">Select a Stimuli:</label>
    <select name="stimuli-selector" v-model="selectedStimuli" placeholder="Select a Stimuli">
    <option v-for="stimulus in stimuli">
    {{stimulus}}
    </option>
    </select>

    <div id="${componentName}-image-wrapper" width='0' height='0'>
        <svg id="${componentName}-image" style='background-size:contain;'>
        </svg>
    </div>
    <canvas id="${componentName}-canvas">
    
    </canvas>
    <div id="${componentName}-tooltip" class="tooltip" style="opacity:0;"></div>
</div>
`;

    GazeStripes = Vue.component(componentName, {
        created: async function() {
            $.get('/stimuliNames', (stimuli) => {
                this.stimuli = JSON.parse(stimuli);
            });
            this.data = await d3.tsv("/static/csv/all_fixation_data_cleaned_up.csv");
        },
        data: function() {
            return {
                data: [],
                stimuli: [],
                users: [],
                selectedStimuli: 'none',
                selectedUser: 'none',
                stimuliImage: null,
                componentName
            };
        },
        watch: {
            selectedStimuli: function(value) {
                this.changeStimuli();
                this.renderFragments();
            },
        },
        computed: {
            hasSelectedStimuli: function() {
                return this.selectedStimuli != 'none';
            },
            tooltipDiv: function() {
                return d3.select(`#${this.componentName}-tooltip`);
            },
            canvas: function() {
                return d3.select(`#${this.componentName}-canvas`);
            },
            partitions: function() {
                const points = this.data.filter(row => row.StimuliName == this.selectedStimuli);
                const partitions = {};

                points.forEach(p => {
                    if (!partitions[p.user])
                        partitions[p.user] = [];
                    partitions[p.user].push(p);
                });
                return partitions;
            }
        },
        methods: {
            changeStimuli: function() {
                const url = `/static/stimuli/${this.selectedStimuli}`;
                let graphic = d3.select(`#${this.componentName}-image`);
                let img = new Image();
                let base = this;
                img.onload = function() {
                    graphic.attr("width", this.width / 4);
                    graphic.attr("height", this.height / 4);
                    base.renderFragments();
                };
                img.src = url;
                this.stimuliImage = img;
                graphic.style('background-image', `url(${url})`);
            },
            renderFragmentsFlow: function() {
                const width = 800;
                const rows = Object.keys(this.partitions).length;
                const height = 40 * rows;
            },
            renderFragments: function() {
                this.renderFragmentsUneven();
            },
            renderFragmentsUneven: function() {
                const widthFragment = 20;
                const heightFragment = 20;
                const partitions = this.partitions;
                let maxLength = Math.max(...Object.keys(partitions).map(k => partitions[k].length));
                const canvasWidth = widthFragment * Math.max(...Object.keys(partitions).map(k => partitions[k].length));
                const canvasHeight = heightFragment * Object.keys(partitions).length;
                let ctx = this.canvas.node().getContext('2d');
                this.canvas
                    .attr('width', canvasWidth)
                    .attr('height', canvasHeight)
                    .on('mouseover', function(args) { console.log(args); });
                Object.keys(partitions).map(key => partitions[key])
                    .sort((a, b) => a.length - b.length)
                    .forEach((partition, row) => {
                        partition.forEach(x => x.Timestamp - partition[0].Timestamp);
                        partition.sort((a, b) => a.Timestamp - b.Timestamp).forEach((point, column) => {
                            ctx.drawImage(this.stimuliImage, //image
                                +point.MappedFixationPointX - widthFragment / 2, //sourceX
                                +point.MappedFixationPointY - heightFragment / 2, //sourceY
                                widthFragment, //sourceWidth
                                heightFragment, // sourceHeight
                                column * widthFragment, //destinationX
                                row * heightFragment, //destinationY
                                widthFragment, //destinationWidth
                                heightFragment //desinationHeight
                            );
                        });
                    });
            }
        },
        template
    });
})();