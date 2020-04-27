'use strict';

function toHex(n) {
    var hex = Number(n).toString(16);
    if (hex.length < 2) {
        hex = "0" + hex;
    }
    console.log(hex);
    return hex;
};
// set the dimensions and margins of the graph
const margin = { top: 10, right: 30, bottom: 30, left: 60 },
    width = 1650 - margin.left - margin.right,
    height = 1200 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#scatter-plot")
    .append("svg")
    .style("background-image", "url('/static/stimuli/01_Antwerpen_S1.jpg')")
    .style("background-size", "contain")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scaleLinear()
    .domain([-100, 2400])
    .range([0, width]);
var y = d3.scaleLinear()
    .domain([-100, 1800])
    .range([height, 0]);

// Add X axis
svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));
// Add Y axis
svg.append("g")
    .call(d3.axisLeft(y));

var globalData = []

var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

//Read the data
d3.tsv("/static/csv/all_fixation_data_cleaned_up.csv")
    .then(data => {
        globalData = data;
        const filteredData = data.filter(d => d.user == "p1" && d.StimuliName == "01_Antwerpen_S1.jpg");
        const timestamps = filteredData.map(d => d.Timestamp)
            // Add dots
        svg.append('g')
            .selectAll("dot")
            .data(filteredData)
            .enter()
            .append("circle")
            .attr("cx", d => x(d.MappedFixationPointX))
            .attr("cy", d => y(d.MappedFixationPointY))
            .attr("r", 4)
            .on("mouseover", function(d) {
                div.transition()
                    .duration(100)
                    .style("opacity", .9);
                div.html(`${d.Timestamp} \n (${d.MappedFixationPointX},${d.MappedFixationPointY})`)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                div.transition()
                    .duration(100)
                    .style("opacity", 0);
            })
            .style("fill", d => {
                //const delta = Math.floor(255 / timestamps.length);
                //let modifier = toHex(delta * timestamps.indexOf(d.Timestamp));
                //return `#${modifier}${modifier}${modifier}`
                return "#000000"
            })

    });