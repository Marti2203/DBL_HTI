'use strict';

function toHex(n) {
    let hex = Number(n).toString(16);
    if (hex.length < 2) {
        hex = "0" + hex;
    }
    return hex;
};
// set the dimensions and margins of the graph
const margin = { top: 10, right: 30, bottom: 30, left: 60 },
    width = 1650 - margin.left - margin.right,
    height = 1200 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#scatter-plot")
    .append("svg")
    .style("background-image", "url('/static/stimuli/01_Antwerpen_S1.jpg')")
    .style("background-size", "contain")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");
const tooltipDiv = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

//Read the data
d3.tsv("/static/csv/all_fixation_data_cleaned_up.csv")
    .then(data => {
        const filteredData = data.filter(d => d.StimuliName == "01_Antwerpen_S1.jpg");
        const timestamps = filteredData.map(d => d.Timestamp)
        const users = filteredData.map(d => d.user)
        app.users = [... new Set(users)]
        // Add dots
        svg.append('g')
            .selectAll("dot")
            .data(filteredData)
            .enter()
            .append("circle")
            .attr("cx", d => d.MappedFixationPointX)
            .attr("cy", d => d.MappedFixationPointY)
            .attr("r", 5)
            .on("mouseover", function(d) {
                tooltipDiv.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltipDiv.html(`Timestamp: ${d.Timestamp} </br> (${d.MappedFixationPointX},${d.MappedFixationPointY}) </br> User: ${d.user}`)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltipDiv.transition()
                    .duration(400)
                    .style("opacity", 0);
            })
            
            .style("fill", function (d) {
                let id = d.user.substring(1);
                let color = Math.pow(16, 6)*((id*14)%15) + Math.pow(16, 5)*((id*13)%15) + Math.pow(16, 4)*((id*12)%15) + Math.pow(16, 3)*((id*11)%15) + Math.pow(16, 2)*((id*9)%15) + 16*((id*7)%15)
                let hexValue = color + 0x00008a;
                if (hexValue<=0xffffff) { hexValue = ("00000"+hexValue).slice(-6); }
                hexValue = hexValue.toString(16);
                hexValue = hexValue.slice(0,6);
                return hexValue;
            })


    });