function generateColor(id, opacity = 'ff') {
    const seeds = [7, 9, 11, 12, 13, 14];
    let hexValue = seeds.reduce((accumulatedValue, currentSeed, i) => accumulatedValue + Math.pow(16, i + 1) * ((id * currentSeed) % 15), 0x00008a)
        .toString(16)
        .slice(-6);
    hexValue = "0".repeat(6 - hexValue.length) + hexValue;
    return '#' + hexValue + opacity;
}

function selectSeries(user) {
    d3.selectAll('.dot').style("opacity", 0.1);
    d3.selectAll('.line').style("opacity", 0.1);
    d3.selectAll('.text').attr('opacity', (d => (+d.gaze / 30.0 + 0.15) / 50));

    d3.selectAll(`.${user}.dot`).style("opacity", 0.9);
    d3.selectAll(`.${user}.line`).style("opacity", 0.9);
    d3.selectAll(`.${user}.text`).attr('opacity', (d => (+d.gaze / 30.0 + 0.15)));
}

function deselectSeries(d) {
    d3.selectAll('.dot').style("opacity", 0.9);
    d3.selectAll('.line').style("opacity", 0.9);
    d3.selectAll('.text').attr('opacity', (+d.gaze / 30.0 + 0.15));
}

function roundTo(num, digits = 2) {
    const move = Math.pow(10, digits);
    return Math.round((num + Number.EPSILON) * move) / move;
}

function convertDataframeToRowArray(dataframe) {
    const keys = Object.keys(dataframe);
    const length = Object.keys(dataframe[keys[0]]).length;
    const result = [];
    for (let i = 0; i < length; i++) {
        const object = {};
        keys.forEach(key => object[key] = dataframe[key][i]);
        result.push(object);
    }
    return result;
}

function bind(component, event, action, storage) {
    component.$on(event, action);
    if (storage != null) {
        storage.push({ component, event, handler: action });
    }
}

function setupTooltip(tooltip, text, x, y) {
    tooltip.transition()
        .duration(200)
        .style("opacity", .9);
    tooltip
        .html(text)
        .style("left", (x) + "px")
        .style("top", (y - 28) + "px");
}

function addTooltip(node, tooltip, text, getX, getY) {
    node
        .on('mouseover', () => {
            setupTooltip(tooltip, text, getX(), getY());
        }).on("mouseout", () => {
            tooltip.transition()
                .duration(400)
                .style("opacity", 0);
        });
}