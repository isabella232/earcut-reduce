'use strict';

var tilereduce = require('@mapbox/tile-reduce');
var path = require('path');

if (process.argv.length < 3) {
    console.error('Usage: node index.js file.mbtiles [layer_id] > output.json');
    return;
}

var tilePath = process.argv[2];
var layerId = process.argv[3];

var stats = {
    numFeatures: 0,
    numBad: 0
};

tilereduce({
    map: path.join(__dirname, 'check.js'),
    sources: [{name: 'source', mbtiles: path.join(__dirname, tilePath), raw: true}],
    mapOptions: {layerId: layerId}
})
.on('reduce', function (result) {
    stats.numFeatures += result.numFeatures;
    stats.numBad += result.numBad;
})
.on('end', function () {
    console.error(JSON.stringify(stats, null, 2));
});
