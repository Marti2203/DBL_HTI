'use strict';
//TODO: think about number of users
var GazeStripes = {};
(() => {
    const componentName = 'gaze-stripes';
    const heightFragment = 40;
    const widthFragment = 40;
    const widthSpacing = 5;
    const heightSpacing = 5;
    const font = 'Roboto';
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
    <div id="${componentName}-image-tooltip" class="tooltip" style="opacity:0;"></div>
    <div id="${componentName}-canvas-tooltip" class="tooltip" style="opacity:0;"></div>
</div>
`;

    GazeStripes = Vue.component(componentName, {
        created: async function() {
            this.stimuli = JSON.parse(await $.get(`/stimuliNames/${app.dataset}`));
        },
        data: function() {
            return {
                data: [],
                stimuli: [],
                stimulus: 'none',
                stimuliImage: null,
                canvasClickListener: null,
                componentName,
                indexHolder: [],
                imageScale: 2,
                highlightedFragments: {},
                selectedRows: [],
            };
        },
        watch: {
            stimulus: async function(value) {
                this.changeStimuli();
                this.data = JSON.parse(await $.get(`/data/${app.dataset}/${value}`));
                this.renderFragments();
            },
        },
        computed: {
            hasStimulus: function() {
                return this.stimulus != 'none';
            },
            imageTooltipDiv: function() {
                return d3.select(`#${this.componentName}-image-tooltip`);
            },
            canvasTooltipDiv: function() {
                return d3.select(`#${this.componentName}-canvas-tooltip`);
            },
            canvas: function() {
                return d3.select(`#${this.componentName}-canvas`);
            },
            image: function() {
                return d3.select(`#${this.componentName}-image`);
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
            changeStimuli: async function() {
                const url = `/uploads/stimuli/${app.datasetName}/${this.stimulus}`;
                let graphic = d3.select(`#${this.componentName}-image`);
                let img = new Image();
                const base = this;
                img.onload = function() {
                    graphic.attr("width", this.width / base.imageScale);
                    graphic.attr("height", this.height / base.imageScale);
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
                if (!this.indexHolder[row]) {
                    this.indexHolder[row] = [];
                }
                let horizontalOffset = 1;
                pair.partition.forEach((point) => {
                    const imageCount = Math.ceil(columnCount * point.TimePart);
                    point.ImageCount = imageCount;
                    this.indexHolder[row].push(horizontalOffset + imageCount - 1);
                    for (let i = 0; i < imageCount; i++) {
                        const args = {
                            image: this.stimuliImage,
                            sourceX: +point.MappedFixationPointX - widthFragment / 2,
                            sourceY: +point.MappedFixationPointY - heightFragment / 2,
                            sourceWidth: widthFragment * 2,
                            sourceHeight: heightFragment * 2,
                            destinationX: (horizontalOffset + i) * (widthFragment + widthSpacing),
                            destinationY: row * (heightFragment + heightSpacing),
                            destinationWidth: widthFragment,
                            destinationHeight: heightFragment
                        };
                        this.renderFragment(ctx, args);
                    }
                    horizontalOffset += imageCount;
                });
            },
            renderFragmentsFlow: function() {
                const size = 10;
                const columnCount = size * Math.ceil(Math.max(...Object.keys(this.partitions).map(k => this.partitions[k].length)) / size);
                const rowCount = Object.keys(this.partitions).length;

                const canvasHeight = rowCount * (heightFragment + heightSpacing);
                const canvasWidth = (1 + columnCount) * (widthFragment + widthSpacing);

                let ctx = this.canvas.node().getContext('2d');

                this.canvas
                    .attr('width', canvasWidth)
                    .attr('height', canvasHeight);
                ctx.clearRect(0, 0, this.canvas.attr('width'), this.canvas.attr('height'));

                this.indexHolder = [];
                this.partitionPairs.forEach((pair, row) => this.renderRow(ctx, pair, row, columnCount));
                this.setupClickListener(ctx, canvasWidth, columnCount, rowCount);
                this.setupHoverListener(ctx, canvasWidth, columnCount, rowCount);
            },
            setupHoverListener: function(ctx, canvasWidth, columnCount, rowCount) {},
            setupClickListener: function(ctx, canvasWidth, columnCount, rowCount) {
                this.selectedRows = [];

                this.image.selectAll('circle').remove();

                this.canvas.node().removeEventListener("click", this.canvasClickListener);
                this.canvasClickListener = (e) => {
                    const coords = this.getPosition(e);
                    const row = Math.floor(coords.y / (heightFragment + heightSpacing));
                    const column = Math.floor(coords.x / (widthFragment + widthSpacing));
                    if (column == 0) {
                        this.highlightRow(ctx, row, columnCount, canvasWidth);
                    } else {
                        this.highlightFragment(ctx, row, column);
                    }
                };
                this.canvas.node().addEventListener("click", this.canvasClickListener);
            },
            //TODO FIX COLORING
            highlightRow: function(ctx, row, columnCount, canvasWidth) {
                ctx.fillStyle = this.selectedRows[row] ? 'rgba(31,31,31,1)' : 'rgba(0,200,0,0.5)';
                let x = widthFragment;
                let y = (heightSpacing + heightFragment) * row - heightSpacing;
                let width = canvasWidth - widthFragment;
                let height = heightFragment + 2 * heightSpacing;
                ctx.fillRect(x, y, width, height);
                this.renderRow(ctx, this.partitionPairs[row], row, columnCount);
                this.selectedRows[row] = !this.selectedRows[row];
            },
            highlightFragment: function(ctx, row, column) {
                const fragmentIndex = this.indexOfFragment(row, column);
                const baseOffset = 1;
                let offsetArr = this.partitionPairs[row].partition.slice(0, fragmentIndex);
                const horizontalOffset = offsetArr.reduce((c, n) => c + n.ImageCount, baseOffset);
                const fragment = this.partitionPairs[row].partition[fragmentIndex];
                const key = `${row},${fragmentIndex}`;
                let backColor = '#ffffffdd';
                if (!this.highlightedFragments[key] || !this.highlightedFragments[key].visible) {
                    this.highlightedFragments[key] = { visible: true, point: this.highlightFragmentOnStimuli(row, column) };
                } else {
                    this.highlightedFragments[key].visible = false;
                    this.highlightedFragments[key].point.remove();
                    backColor = this.selectedRows[row] ? 'rgba(0,200,0,0.5)' : 'rgba(31,31,31,1)';
                }
                this.highlightFragmentOnCanvas(ctx, row, horizontalOffset, fragment, backColor);
            },
            highlightFragmentOnCanvas: function(ctx, row, horizontalOffset, fragment, backColor) {
                for (let i = 0; i < fragment.ImageCount; i++) {
                    ctx.fillStyle = backColor;
                    ctx.fillRect((horizontalOffset + i) * (widthFragment + widthSpacing) - widthSpacing,
                        row * (heightSpacing + heightFragment) - heightSpacing,
                        widthFragment + 2 * widthSpacing,
                        heightFragment + 2 * heightSpacing);


                    const args = {
                        image: this.stimuliImage,
                        sourceX: +fragment.MappedFixationPointX - widthFragment / 2,
                        sourceY: +fragment.MappedFixationPointY - heightFragment / 2,
                        sourceWidth: widthFragment * 2,
                        sourceHeight: heightFragment * 2,
                        destinationX: (horizontalOffset + i) * (widthFragment + widthSpacing),
                        destinationY: row * (heightFragment + heightSpacing),
                        destinationWidth: widthFragment,
                        destinationHeight: heightFragment
                    };
                    this.renderFragment(ctx, args);
                }
            },
            highlightFragmentOnStimuli: function(row, column) {
                const element = this.fragmentFor(row, column);
                return this.image.append('circle')
                    .attr('cx', element.MappedFixationPointX / this.imageScale)
                    .attr('cy', element.MappedFixationPointY / this.imageScale)
                    .attr('r', widthFragment / 10)
                    .style('fill', generateColor(+element.user.substring(1)))
                    .on('mouseover', () => {
                        this.imageTooltipDiv.transition()
                            .duration(200)
                            .style("opacity", .9);
                        this.imageTooltipDiv
                            .html(`Timestamp: ${element.Timestamp} </br> (${element.MappedFixationPointX},${element.MappedFixationPointY}) </br> User: ${element.user}`)
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                    }).on("mouseout", () => {
                        this.imageTooltipDiv.transition()
                            .duration(400)
                            .style("opacity", 0);
                    });
            },
            fragmentFor: function(row, column) {
                return this.partitionPairs[row].partition[this.indexOfFragment(row, column)];
            },
            indexOfFragment: function(row, column) {
                return this.indexHolder[row].findIndex((v) => v >= column);
            },
            renderFragment: function(ctx, argObject) {
                let args = Object.keys(argObject).map(key => argObject[key]);
                ctx.drawImage(...args);
            },
            renderLabel: function(ctx, text, fontSize, x, y, maxWidth) {
                ctx.font = `${fontSize}px ${font}`;
                ctx.fillStyle = 'green';
                ctx.fillText(text, x, y, maxWidth);
            },
            renderFragments: function() {
                this.renderFragmentsFlow();
            },
        },
        template
    });
})();