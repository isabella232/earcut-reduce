
const tilereduce = require('@mapbox/tile-reduce');
const path = require('path');

if (process.argv.length < 3) {
    console.error('Usage: node index.js file.mbtiles [layer_id] > output.json');
    process.exit(); // eslint-disable-line
}

const tilePath = process.argv[2];
const layerId = process.argv[3];

const stats = {
    numFeatures: 0,
    numBad: 0
};

tilereduce({
    map: path.join(__dirname, 'check.js'),
    sources: [{name: 'source', mbtiles: path.join(__dirname, tilePath), raw: true}],
    mapOptions: {layerId}
}).on('reduce', (result) => {
    stats.numFeatures += result.numFeatures;
    stats.numBad += result.numBad;
}).on('end', () => {
    console.error(JSON.stringify(stats, null, 2));
});
