'use strict';
//TODO: think about number of users
var GazeStripes = {};
(() => {
    const componentName = 'gaze-stripes';

    const heightFragment = 40;
    const widthFragment = 40;

    const widthSpacing = 6;
    const heightSpacing = 6;

    const widthHighlightSpacing = (widthSpacing / 2);
    const heightHighlightSpacing = (heightSpacing / 2);

    const font = 'Roboto';
    const selectedRowColor = 'rgba(0,200,0,0.5)';
    const nonSelectedRowColor = 'rgba(31,31,31,1)';
    const highlightFragmentColor = '#ffffffdd';
    let template = `
<div id="${componentName}-root">
    <div class="border border-secondary, blocktext">
        <h3> Gaze Stripes</h3>
        <p>
            In the gaze stripes, the stimulus can be chosen. All the rows represent one 
            participant where the thumbnails shows where the participant has looked. Click on 
            the participant name to highlight the entire row. Click on one thumbnail to see 
            where this point is in the stimulus above. Click away!
        </p>
    </div>
    <div v-if="hasDataset">
        <label for="stimuli-selector">Select a Stimuli:</label>
        <select name="stimuli-selector" v-model="stimulus" placeholder="Select a Stimuli">
            <option v-for="stimulus in stimuli">{{stimulus}}</option>
        </select>
        <button v-if="hasSelections()" @click="clearSelected()">Clear selections</button>

        <div id="${componentName}-image-wrapper" width='0' height='0'>
            <svg id="${componentName}-image" style='background-size:contain;'></svg>
        </div>
        <canvas id="${componentName}-canvas"></canvas>
        <div id="${componentName}-image-tooltip" class="tooltip" style="opacity:0;"></div>
        <div id="${componentName}-canvas-tooltip" class="tooltip" style="opacity:0;"></div>
    </div>
</div>
`;

    GazeStripes = Vue.component(componentName, {
        created: function() {
            this.$root.addDatasetListener(async(dataset) => this.stimuli = JSON.parse(await $.get(`/stimuliNames/${app.dataset}`)));
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
                columnCount: 0,
                rowCount: 0,
                selectionCount: 0,
            };
        },
        watch: {
            stimulus: async function(value) {
                this.clearView();
                if (value == 'none') return;
                this.changeStimuli();
                this.data = JSON.parse(await $.get(`/data/${app.dataset}/${value}`));
                this.renderFragments();
            },
            stimuli: function() {
                this.data = [];
                this.stimulus = 'none';
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
            hasDataset: function() {
                return this.$root && this.$root.dataset != null;
            },
        },
        methods: {
            hasSelections: function() {
                return this.selectionCount != 0;
            },
            getPosition: function(e) {
                const rect = e.target.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                return {
                    x,
                    y
                };
            },
            clearView: function() {
                const canvas = this.canvas.node();
                const context = canvas.getContext('2d');
                context.clearRect(0, 0, canvas.width, canvas.height);
                let graphic = d3.select(`#${this.componentName}-image`);

                graphic.style('background-image', ``);
            },
            clearSelected: function() {
                this.selectionCount = 0;
                this.renderFragments(); // currently this is a quick way
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
            renderRow: function(ctx, pair, row) {
                this.renderLabel(ctx, pair.key, widthFragment / 2, 5, row * (heightFragment + heightSpacing) + heightFragment / 2, widthFragment);
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
                    const imageCount = Math.ceil(this.columnCount * point.TimePart);
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
            renderFragments: function() {
                const size = 10;
                this.columnCount = size * Math.ceil(Math.max(...Object.keys(this.partitions).map(k => this.partitions[k].length)) / size);
                this.rowCount = Object.keys(this.partitions).length;

                const canvasHeight = this.rowCount * (heightFragment + heightSpacing);
                const canvasWidth = (1 + this.columnCount) * (widthFragment + widthSpacing);

                let ctx = this.canvas.node().getContext('2d');

                this.canvas
                    .attr('width', canvasWidth)
                    .attr('height', canvasHeight);
                ctx.clearRect(0, 0, this.canvas.attr('width'), this.canvas.attr('height'));

                this.indexHolder = [];

                this.partitionPairs.forEach((pair, row) => this.renderRow(ctx, pair, row));
                this.setupClickListener(ctx);
            },
            setupClickListener: function(ctx) {
                this.selectedRows = [];

                this.image.selectAll('circle').remove();

                this.canvas.node().removeEventListener("click", this.canvasClickListener);
                this.canvasClickListener = (e) => {
                    const coords = this.getPosition(e);
                    const row = Math.floor(coords.y / (heightFragment + heightSpacing));
                    const column = Math.floor(coords.x / (widthFragment + widthSpacing));
                    if (column == 0) {
                        this.highlightRow(ctx, row);
                    } else {
                        this.highlightFragment(ctx, row, column);
                    }
                };
                this.canvas.node().addEventListener("click", this.canvasClickListener);
            },
            highlightRow: function(ctx, row) {
                ctx.fillStyle = this.selectedRows[row] ? nonSelectedRowColor : selectedRowColor;

                let x = widthFragment;
                let y = (heightSpacing + heightFragment) * row - heightHighlightSpacing;
                let width = ctx.canvas.width - widthFragment;
                let height = heightFragment + 2 * heightHighlightSpacing;

                ctx.fillRect(x, y, width, height);
                this.renderRow(ctx, this.partitionPairs[row], row);
                this.selectedRows[row] = !this.selectedRows[row];
                this.selectionCount += this.selectedRows[row] ? 1 : -1;
            },
            highlightFragment: function(ctx, row, column) {
                const fragmentIndex = this.indexOfFragment(row, column);
                const baseOffset = 1;
                let offsetArr = this.partitionPairs[row].partition.slice(0, fragmentIndex);
                const horizontalOffset = offsetArr.reduce((c, n) => c + n.ImageCount, baseOffset);
                const fragment = this.partitionPairs[row].partition[fragmentIndex];
                const key = `${row},${fragmentIndex}`;
                let backColor = highlightFragmentColor;
                if (!this.highlightedFragments[key] || !this.highlightedFragments[key].visible) {
                    this.selectionCount++;
                    this.highlightedFragments[key] = {
                        visible: true,
                        point: this.highlightFragmentOnStimuli(row, column)
                    };
                } else {
                    this.selectionCount--;
                    this.highlightedFragments[key].visible = false;
                    this.highlightedFragments[key].point.remove();
                    backColor = this.selectedRows[row] ? selectedRowColor : nonSelectedRowColor;
                }
                this.highlightFragmentOnCanvas(ctx, row, horizontalOffset, fragment, backColor);
            },
            highlightFragmentOnCanvas: function(ctx, row, horizontalOffset, fragment, backColor) {
                //They are half of the width/height spacing so that they do not overlap
                for (let i = 0; i < fragment.ImageCount; i++) {
                    ctx.fillStyle = backColor;
                    let x = (horizontalOffset + i) * (widthFragment + widthSpacing) - widthHighlightSpacing;
                    let y = row * (heightSpacing + heightFragment) - heightHighlightSpacing;
                    let w = widthFragment + 2 * widthHighlightSpacing;
                    let h = heightFragment + 2 * heightHighlightSpacing;
                    ctx.fillRect(x, y, w, h);


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
                ctx.fillStyle = 'black';
                ctx.rect(argObject.destinationX - 1, argObject.destinationY, argObject.destinationWidth + 1, argObject.destinationHeight + 1);

                let args = Object.keys(argObject).map(key => argObject[key]);
                ctx.drawImage(...args);
            },
            renderLabel: function(ctx, text, fontSize, x, y, maxWidth) {
                ctx.font = `${fontSize}px ${font}`;
                ctx.fillStyle = 'green';
                ctx.fillText(text, x, y, maxWidth);
            },
        },
        template
    });
})();