'use strict';
//TODO: think about number of users
var GazeStripes = (() => {
    const componentName = 'gaze-stripes';
    const heightFragment = 40;
    const widthFragment = 40;
    const chunkSize = 35;
    const widthSpacing = 6;
    const heightSpacing = 6;

    const widthHighlightSpacing = (widthSpacing / 2);
    const heightHighlightSpacing = (heightSpacing / 2);

    const ThumbnailZoomSlider = Slider('thumbnail-zoom-slider', 1, 10, 2, 'Thumbnail zoom level : {{data}}');
    const Thumbnail = Vue.component(`${componentName}-thumbnail`, {
        props: ['data', 'element', 'zoomLevel'],
        data: function() {
            return {
                highlighted: false,
            };
        },
        mounted: function() {
            this.draw();
        },
        watch: {
            highlighted: function() {
                this.draw();
            },
            zoomLevel: function() {
                this.draw();
            },
            data: function() {
                this.draw();
            }
        },
        computed: {

        },
        methods: {
            draw: function() {
                const argObject = this.data;
                let ctx = this.$el.getContext("2d");
                ctx.fillStyle = this.highlighted ? "green" : "#1f1f1f";
                ctx.fillRect(0, 0, 2 * widthHighlightSpacing + widthFragment, 2 * heightHighlightSpacing + heightFragment);


                argObject.sourceHeight *= this.zoomLevel;
                argObject.sourceWidth *= this.zoomLevel;

                argObject.destinationX += widthHighlightSpacing;
                argObject.destinationY += heightHighlightSpacing;

                let args = Object.keys(argObject).map(key => argObject[key]);
                ctx.drawImage(...args);

                argObject.sourceHeight /= this.zoomLevel;
                argObject.sourceWidth /= this.zoomLevel;

                argObject.destinationX -= widthHighlightSpacing;
                argObject.destinationY -= heightHighlightSpacing;

            },
            enterHover: function(event) {
                const element = this.element;
                const tooltipDiv = d3.select(`#${componentName}-thumbnail-tooltip`);
                setupTooltip(tooltipDiv, `Timestamp: ${element.Timestamp} (${element.TimePart}) </br> (${element.MappedFixationPointX},${element.MappedFixationPointY}) </br> User: ${element.user}`, event.clientX, event.clientY);
            },
            exitHover: function() {
                const tooltipDiv = d3.select(`#${componentName}-thumbnail-tooltip`);

                tooltipDiv.transition()
                    .duration(400)
                    .style("opacity", 0);
            }
        },
        template: `<canvas 
        @mouseover="enterHover($event)" 
        @mouseleave="exitHover()" 
        width=${widthFragment+2*widthHighlightSpacing} 
        height=${heightFragment+2*heightHighlightSpacing}>
        </canvas>`
    });

    //constants defininig values which the user should not play around with

    const imageScale = 2;

    let template = `
<div id="${componentName}-root">
    <link rel="stylesheet" type="text/css" href="static/css/${componentName}.css">
    <div class="border border-secondary, block-text" v-if="showTextP">
        <h3> Gaze Stripes</h3>
        <p>
            In the gaze stripes, the stimulus can be chosen. All the rows represent one 
            participant where the thumbnails shows where the participant has looked. Click on 
            the participant name to highlight the entire row. Click on one thumbnail to see 
            where this point is in the stimulus above. Click away!
        </p>
    </div>
    <div v-if="hasDataset">
        <button v-if="hasSelections" @click="clearSelected()" class="btn btn-info">Clear selections</button>

        <div id="${componentName}-image-wrapper" v-show="showHighlightImage" width='0' height='0'>
            <svg id="${componentName}-image" style='background-size:contain;'></svg>
        </div>
        <div id="${componentName}-grid">
            <div :class="'${componentName}-row row-'+rowIndex" v-for="(row,rowIndex) in data">
                <p class="textual" :style="textPadding(row)" @click="clickedOnText(rowIndex)">{{row.key}}</p>
                <div class="${componentName}-col-point" v-for="(point,columnIndex) in row.points">
                    <div :class="'${componentName}-column point row-'+rowIndex+' column-'+columnIndex" 
                    @click="clickedOnThumbnail(rowIndex,columnIndex,point.point)"
                    v-if="inPage(rowIndex,columnIndex)"
                    v-for="count in point.point.ImageCount">
                        <${componentName}-thumbnail
                        :class="rowIndex + ' ' + columnIndex + ' ' + count "
                        v-if="inPage(rowIndex,columnIndex,count)" 
                        :ref="'element'+rowIndex+'and'+columnIndex" 
                        :element=point.point 
                        :data=point.drawingArgs 
                        :zoom-level=thumbnailZoomLevel>
                        </${componentName}-thumbnail>    
                    </div>
                </div>
            </div>
        </div>
        <div id="${componentName}-image-tooltip" class="tooltip" style="opacity:0;"></div>
        <div id="${componentName}-thumbnail-tooltip" class="tooltip" style="opacity:0; position: fixed"></div>
    </div>
</div>
`;
    return Vue.component(componentName, {
        props: ['showText', 'showImage'],
        mixins: [SidebarComponentHandlerMixin, StimuliSelectionMixin],
        data: () => ({
            data: [],
            stimuliImage: null,
            highlighted: [],
            hasStimulus: false,
            columnCount: 0,
            thumbnailZoomLevel: 2,
            page: 0,
            partitions: {},
            componentName
        }),
        mounted: function() {
            this.$root.requestSidebarComponent(ThumbnailZoomSlider, "thumbnailZoomSlider", async(slider) => {
                //Do this when the thumbnail zoom slider is moved
                bind(slider, 'value-changed', (value) => this.thumbnailZoomLevel = value, this.customComponentListeners);
            }, () => this.$root.$route.name == "GazeStripes" && this.$root.hasDatasetSelected);


            this.$root.requestSidebarComponent(Paginator, "gazeStripesPaginator", async(paginator) => {
                //Do this when the thumbnail zoom slider is moved
                paginator.currentPageGetter = () => this.page;
                paginator.lastPageGetter = () => console.log(Math.floor(this.columnCount / chunkSize)) || Math.floor(this.columnCount / chunkSize);

                bind(paginator, 'next-page', () => this.page++, this.customComponentListeners);
                bind(paginator, 'previous-page', () => this.page--, this.customComponentListeners);
            }, () => this.$root.$route.name == "GazeStripes" && this.$root.hasDatasetSelected);
        },
        computed: {
            imageTooltipDiv: function() {
                return d3.select(`#${componentName}-image-tooltip`);
            },
            image: function() {
                return d3.select(`#${componentName}-image`);
            },
            hasDataset: function() {
                return this.$root.hasDatasetSelected;
            },
            hasSelections: function() {
                return this.highlighted.reduce((current, row) => current + row.length, 0) != 0;
            },
            showTextP: function() {
                return this.showText !== undefined ? this.showText : true;
            },
            showHighlightImage: function() {
                return this.showImage !== undefined ? this.showImage : true;
            },
            maxUserLength: function() {
                return Math.max(...this.data.map(p => p.key.length));
            },
        },
        methods: {
            clickedOnThumbnail: function(row, column, element) {
                const selectedPoints = this.$refs[`element${row}and${column}`];
                if (selectedPoints == undefined)
                    return;
                selectedPoints.forEach(x => x.highlighted = !x.highlighted);
                if (!this.highlighted[row]) {
                    this.highlighted[row] = [];
                }
                if (!this.highlighted[row][column] || !this.highlighted[row][column].visible) {
                    this.highlighted[row][column] = { visible: true, point: this.highlightFragmentOnStimuli(element) };
                } else {
                    this.highlighted[row][column].point.remove();
                    this.highlighted[row][column] = undefined;
                }
            },
            textPadding: function(row) {
                return 'padding-right:' + ((this.maxUserLength - row.key.length) / 2) + 'em;';
            },
            inPage: function(row, column, index = -1) {
                const beforeGroup = this.data[row].partition.slice(0, column).reduce((currentLength, point) => currentLength + point.ImageCount, 0);

                if (index == -1) { // whether to show a group of thumbnails or not
                    for (let i = 0; i < this.data[row].partition[column].ImageCount; i++) {
                        if (beforeGroup + i >= this.page * chunkSize &&
                            beforeGroup + i < (this.page + 1) * chunkSize) {
                            return true;
                        }
                    }
                    return false;
                } else { //whether to show a thumbnail or not
                    index--;
                    return beforeGroup + index >= this.page * chunkSize &&
                        beforeGroup + index < (this.page + 1) * chunkSize;
                }

            },
            stimuliReset: function() {
                this.stimuliImage = null;
                this.highlighted.forEach(row => row.forEach(column => {
                    if (column.visible) {
                        column.point.remove();
                    }
                    column.visible = [];
                }));
                this.highlighted = [];
                this.hasStimulus = false;
                this.data = [];
                this.partitions = {};
                this.page = 0;
            },
            clickedOnText: function(row) {
                let predicate = (column) => true;
                if (!this.highlighted[row] || this.highlighted[row].length != this.data[row].partition.length ||
                    this.highlighted[row].some(x => !x)) {
                    if (!this.highlighted[row]) {
                        this.highlighted[row] = [];
                    }
                    predicate = (column) => !this.highlighted[row][column] || !this.highlighted[row][column].visible;
                } else {
                    predicate = (column) => this.highlighted[row][column] && this.highlighted[row][column].visible;
                }
                for (let i = 0; i < this.data[row].partition.length; i++) {
                    if (predicate(i)) {
                        this.clickedOnThumbnail(row, i, this.data[row].partition[i]);
                    }
                }
            },
            transformPartition: function(row, columnCount) {
                if (row[0].Timestamp != 0) {
                    this.normaliseTime(row);
                }

                if (!row[0].TimePart) {
                    //Generate time parts
                    const experimentLength = (+row[row.length - 1].Timestamp) + (+row[row.length - 1].FixationDuration);
                    //Rounding is added as floating point math is not fun
                    row.forEach(x => x.TimePart = roundTo(+x.FixationDuration / experimentLength, 3));
                }

                return row.map((point) => {
                    let imageCount = 0;
                    for (let multiplier = 1; multiplier < columnCount; multiplier++) {
                        if (multiplier / columnCount >= point.TimePart) {
                            imageCount = multiplier;
                            break;
                        }
                    }
                    //const imageCountRaw = columnCount * point.TimePart;
                    //const imageCount = roundTo(imageCountRaw, 0);
                    point.ImageCount = imageCount;

                    const args = {
                        image: this.stimuliImage,
                        sourceX: +point.MappedFixationPointX - widthFragment / 2,
                        sourceY: +point.MappedFixationPointY - heightFragment / 2,
                        sourceWidth: widthFragment,
                        sourceHeight: heightFragment,
                        destinationX: 0,
                        destinationY: 0,
                        destinationWidth: widthFragment,
                        destinationHeight: heightFragment
                    };
                    return { drawingArgs: args, point };
                });
            },
            normaliseTime: function(row) {
                const base = row[0].Timestamp;
                row.forEach(x => x.Timestamp = x.Timestamp - base);
            },
            stimulusChanged: async function(value) {
                this.image.style('background-image', ``);
                this.image.selectAll('circle').remove();

                if (value == 'none') return;

                this.page = 0;
                const partitions = {};
                (await this.$root.getDataForStimulus(value)).forEach(p => {
                    if (!partitions[p.user])
                        partitions[p.user] = [];
                    partitions[p.user].push(p);
                });
                this.partitions = partitions;
                this.changeStimuliImage(value);
            },
            generateData: function() {
                const size = 10;
                const columnCount = size * Math.ceil(Math.max(...Object.values(this.partitions).map(list => list.length)) / size);
                this.columnCount = columnCount;
                this.data = Object.keys(this.partitions)
                    .sort((uL, uR) => +(uL.substring(1)) - +(uR.substring(1)))
                    .map((key, i) => ({
                        key: key,
                        partition: this.partitions[key]
                            .sort((a, b) => a.Timestamp - b.Timestamp), //just the data from the dataset
                        points: this.transformPartition(this.partitions[key].sort((a, b) => a.Timestamp - b.Timestamp), columnCount, i == 0) // the transformed values 
                    }));
            },
            changeStimuliImage: function(value) {
                const url = `/uploads/stimuli/${app.datasetName}/${value}`;
                let img = new Image();
                const base = this;
                img.onload = function() {
                    base.image.attr("width", this.width / imageScale);
                    base.image.attr("height", this.height / imageScale);
                    base.generateData();
                };
                this.stimuliImage = img;
                img.src = url;
                this.image.style('background-image', `url(${url})`);
            },
            highlightFragmentOnStimuli: function(element) {
                let dot = this.image.append('circle')
                    .attr('cx', element.MappedFixationPointX / imageScale)
                    .attr('cy', element.MappedFixationPointY / imageScale)
                    .attr('r', widthFragment / 4)
                    .style('fill', generateColor(+element.user.substring(1), 'cc'));
                const text = `Timestamp: ${element.Timestamp} (${element.TimePart}) </br> (${element.MappedFixationPointX},${element.MappedFixationPointY}) </br> User: ${element.user}`;
                addTooltip(dot, this.imageTooltipDiv, text, () => d3.event.pageX, () => d3.event.pageY);
                return dot;
            },
        },
        template
    });
})();