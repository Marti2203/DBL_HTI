'use strict';
// set the dimensions and margins of the graph
var margin = { top: 10, right: 30, bottom: 30, left: 60 },
    width = 500 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#scatter-plot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scaleLinear()
    .domain([0, 2000])
    .range([0, width]);
var y = d3.scaleLinear()
    .domain([0, 2000])
    .range([height, 0]);

// Add X axis
svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));
// Add Y axis
svg.append("g")
    .call(d3.axisLeft(y));

//Read the data
d3.tsv("/static/csv/all_fixation_data_cleaned_up.csv",
    function(data) {
        if (data.user == 'p1' && data.StimuliName == "01_Antwerpen_S1.jpg")
            console.log(data)

        // Add dots
        svg.append('g')
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function(d) { return x(d.MappedFixationPointX); })
            .attr("cy", function(d) { return y(d.MappedFixationPointY); })
            .attr("r", 1.5)
            .style("fill", "#000000")

    });