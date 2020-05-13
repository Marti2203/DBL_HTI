'use strict';
//TODO: think about number of users
var GazeStripes = {};
(() => {
    const componentName = 'gaze-stripes';
    const heightFragment = 40;
    const widthFragment = 40;
    const widthSpacing = 5;
    const heightSpacing = 5;
    let template = `
<div id="${componentName}-root">
    <label for="stimuli-selector">Select a Stimuli:</label>
    <select name="stimuli-selector" v-model="stimulus" placeholder="Select a Stimuli">
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
                stimulus: 'none',
                stimuliImage: null,
                currentListener: null,
                componentName,
            };
        },
        watch: {
            stimulus: function(value) {
                this.changeStimuli();
                this.renderFragments();
            },
        },
        computed: {
            hasStimulus: function() {
                return this.stimulus != 'none';
            },
            tooltipDiv: function() {
                return d3.select(`#${this.componentName}-tooltip`);
            },
            canvas: function() {
                return d3.select(`#${this.componentName}-canvas`);
            },
            partitions: function() {
                const points = this.data.filter(row => row.StimuliName == this.stimulus);
                const partitions = {};

                points.forEach(p => {
                    if (!partitions[p.user])
                        partitions[p.user] = [];
                    partitions[p.user].push(p);
                });
                return partitions;
            },
            partitionPairs: function() {
                return Object.keys(this.partitions).map(key => {
                    return {
                        key: key,
                        partition: this.partitions[key]
                            .sort((a, b) => a.Timestamp - b.Timestamp)
                    };
                });
            },
        },
        methods: {
            getPosition: function(e) {
                const rect = e.target.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                return {
                    x,
                    y
                };
            },
            changeStimuli: function() {
                const url = `/static/stimuli/${this.stimulus}`;
                let graphic = d3.select(`#${this.componentName}-image`);
                let img = new Image();
                const base = this;
                img.onload = function() {
                    graphic.attr("width", this.width / 4);
                    graphic.attr("height", this.height / 4);
                    base.renderFragments();
                };
                img.src = url;
                this.stimuliImage = img;
                graphic.style('background-image', `url(${url})`);
            },
            renderRow: function(ctx, pair, row, columnCount) {
                this.renderLabel(ctx, pair.key, Math.floor(widthFragment / 2), 5, row * (heightFragment + heightSpacing) + heightFragment / 2, widthFragment);
                if (pair.partition[0].Timestamp != 0) {
                    //Normalise time
                    const base = pair.partition[0].Timestamp;
                    pair.partition.forEach(x => x.Timestamp = x.Timestamp - base);
                }

                if (pair.partition[0].TimePart == undefined) {
                    //Generate time parts
                    const experimentLength = pair.partition[pair.partition.length - 1].Timestamp + (+pair.partition[pair.partition.length - 1].FixationDuration);
                    pair.partition.forEach(x => x.TimePart = (+x.FixationDuration) / experimentLength);
                }
                let offset = widthFragment + widthSpacing;
                pair.partition.forEach((point, column) => {
                    const imageCount = Math.ceil(columnCount * point.TimePart);
                    for (let i = 0; i < imageCount; i++) {
                        const args = {
                            image: this.stimuliImage,
                            sourceX: +point.MappedFixationPointX - widthFragment / 2,
                            sourceY: +point.MappedFixationPointY - heightFragment / 2,
                            sourceWidth: widthFragment,
                            sourceHeight: heightFragment,
                            destinationX: offset + i * (widthFragment + widthSpacing),
                            destinationY: row * (heightFragment + heightSpacing),
                            destinationWidth: widthFragment,
                            destinationHeight: heightFragment
                        };
                        this.renderFragment(ctx, args);
                    }
                    offset += imageCount * (widthFragment + widthSpacing);
                });
            },
            renderFragmentsFlow: function() {
                const rows = Object.keys(this.partitions).length;
                const size = 10;
                const columnCount = size * Math.ceil(Math.max(...Object.keys(this.partitions).map(k => this.partitions[k].length)) / size);

                const canvasHeight = rows * heightFragment;
                const canvasWidth = (1 + columnCount) * (widthFragment + widthSpacing);

                let ctx = this.canvas.node().getContext('2d');
                ctx.clearRect(0, 0, this.canvas.attr('width'), this.canvas.attr('height'));

                this.canvas
                    .attr('width', canvasWidth)
                    .attr('height', canvasHeight);

                this.partitionPairs.forEach((pair, row) => {
                    this.renderRow(ctx, pair, row, columnCount);
                });

                let selectedRow = [];
                this.canvas.node().removeEventListener("click", this.currentListener);
                this.currentListener = (e) => {
                    console.log(e);
                    const coords = this.getPosition(e);
                    const row = Math.floor(coords.y / (heightFragment + heightSpacing));
                    if (e.ctrlKey) {
                        this.highlightFragment(coords, row, column);
                    }
                    //const column = Math.floor(coords.x / (widthFragment + widthSpacing) - 1);
                    ctx.fillStyle = selectedRow[row] ? 'rgba(31,31,31,1)' : 'rgba(0,200,0,0.5)';
                    ctx.fillRect(0, (heightSpacing + heightFragment) * row - heightSpacing, canvasWidth, heightFragment + 2 * heightSpacing);
                    this.renderRow(ctx, this.partitionPairs[row], row, columnCount);
                    selectedRow[row] = !selectedRow[row];
                };
                this.canvas.node().addEventListener("click", this.currentListener);

            },
            renderFragments: function() {
                this.renderFragmentsFlow();
            },
            renderFragment: function(ctx, argObject) {
                let args = Object.keys(argObject).map(key => argObject[key]);
                ctx.drawImage(...args);
            },
            renderLabel: function(ctx, text, fontSize, x, y, maxWidth) {
                ctx.font = `${fontSize}px Roboto`;
                ctx.fillStyle = 'green';
                ctx.fillText(text, x, y, maxWidth);
            },
            renderFragmentsUneven: function() {
                const maxColumnCount = Math.max(...Object.keys(this.partitions).map(k => this.partitions[k].length));
                const rows = Object.keys(this.partitions).length;

                const canvasWidth = maxColumnCount * (widthFragment + widthSpacing) - widthSpacing;
                const canvasHeight = (heightFragment + heightSpacing) * rows - heightSpacing;

                let ctx = this.canvas.node().getContext('2d');
                ctx.clearRect(0, 0, this.canvas.attr('width'), this.canvas.attr('height'));
                this.canvas
                    .attr('width', canvasWidth)
                    .attr('height', canvasHeight);

                Object.keys(this.partitions).map(key => {
                        return {
                            key: key,
                            partition: this.partitions[key]
                                .sort((a, b) => a.Timestamp - b.Timestamp)
                        };
                    })
                    .sort((a, b) => a.partition.length - b.partition.length)
                    .forEach((pair, row) => {
                        this.renderLabel(ctx, pair.key, Math.floor(widthFragment / 2), 5, row * (heightFragment + heightSpacing) + heightFragment / 2, widthFragment);
                        pair.partition.forEach(x => x.Timestamp -= pair.partition[0].Timestamp);
                        pair.partition.forEach((point, column) => {
                            const timeDelta = 20;
                            const imageCount = Math.floor(point.FixationDuration / timeDelta);
                            const args = {
                                image: this.stimuliImage,
                                sourceX: +point.MappedFixationPointX - widthFragment / 2,
                                sourceY: +point.MappedFixationPointY - heightFragment / 2,
                                sourceWidth: widthFragment,
                                sourceHeight: heightFragment,
                                destinationX: (column + 1) * (widthFragment + widthSpacing),
                                destinationY: row * (heightFragment + heightSpacing),
                                destinationWidth: widthFragment,
                                destinationHeight: heightFragment
                            };
                            this.renderFragment(ctx, args);
                        });
                    });
            }
        },
        template
    });
})();