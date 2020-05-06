'use strict';
var GazeStripes = {};
(() => {
    const componentName = 'gaze-stripes'
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
`

    GazeStripes = Vue.component(componentName, {
        created: async function() {
            $.get('/stimuliNames', (stimuli) => {
                this.stimuli = JSON.parse(stimuli)
            })
            this.data = await d3.tsv("/static/csv/all_fixation_data_cleaned_up.csv")
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
            }
        },
        watch: {
            selectedStimuli: function(value) {
                this.changeStimuli()
                this.renderFragments()
            },
        },
        computed: {
            hasSelectedStimuli: function() {
                return this.selectedStimuli != 'none'
            },
            tooltipDiv: function() {
                return d3.select(`#${this.componentName}-tooltip`)
            },
            canvas: function() {
                return document.getElementById(`${this.componentName}-canvas`)
            }
        },
        methods: {
            changeStimuli: function() {
                const url = `/static/stimuli/${this.selectedStimuli}`;
                let graphic = d3.select(`#${this.componentName}-image`)
                let img = new Image()
                let base = this
                img.onload = function() {
                    console.log('hi!')
                    graphic.attr("width", this.width / 4)
                    graphic.attr("height", this.height / 4)
                    base.renderFragments()
                }
                img.src = url
                this.stimuliImage = img
                graphic.style('background-image', `url(${url})`)
            },
            renderFragments: function() {
                console.log('enter')
                const points = this.data.filter(row => row.StimuliName == this.selectedStimuli)
                const width = 40
                const height = 40
                const partitions = {}

                points.forEach(p => {
                    if (!partitions[p.user])
                        partitions[p.user] = []
                    partitions[p.user].push(p)
                })
                const canvasWidth = width * Math.max(...Object.keys(partitions).map(k => partitions[k].length))
                const canvasHeight = height * Object.keys(partitions).length
                let ctx = this.canvas.getContext('2d')
                d3.select(`#${this.componentName}-canvas`).attr('width', canvasWidth).attr('height', canvasHeight)
                Object.keys(partitions).map(key => partitions[key]).forEach((partition, row) => {
                    partition = partition.map(x => x - partition[0])
                    partition.sort((a, b) => a.Timestamp - b.Timestamp).forEach((point, column) => {
                        if (row == 0 && column == 0) {
                            console.log(ctx)
                        }
                        ctx.drawImage(this.stimuliImage, //image
                            +point.MappedFixationPointX - width / 2, //sourceX
                            +point.MappedFixationPointY - height / 2, //sourceY
                            width, //sourceWidth
                            height, // sourceHeight
                            column * width, //destinationX
                            row * height, //destinationY
                            width, //destinationWidth
                            height //desinationHeight
                        )
                    })
                })
            }
        },
        template
    })
})()