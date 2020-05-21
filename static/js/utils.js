function generateColor(id) {
    const seeds = [7, 9, 11, 12, 13, 14];
    let hexValue = seeds.reduce((previous, current, i) => previous + Math.pow(16, i + 1) * ((id * current) % 15), 0x00008a)
        .toString(16)
        .slice(-6);
    hexValue = "0".repeat(6 - hexValue.length) + hexValue;
    return '#' + hexValue;
}