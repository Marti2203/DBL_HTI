function generateColor(id, opacity = 'ff') {
    const seeds = [7, 9, 11, 12, 13, 14];
    let hexValue = seeds.reduce((accumulatedValue, currentSeed, i) => accumulatedValue + Math.pow(16, i + 1) * ((id * currentSeed) % 15), 0x00008a)
        .toString(16)
        .slice(-6);
    hexValue = "0".repeat(6 - hexValue.length) + hexValue;
    return '#' + hexValue + opacity;
}

function getPositionOfPointInComponent(event) {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return {
        x,
        y
    };
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