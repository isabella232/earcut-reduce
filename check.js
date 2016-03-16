'use strict';

var earcut = require('earcut');

module.exports = function (data, tile, writeData, done) {
    var layer = data.source[global.mapOptions.layerName];

    var numFeatures = 0;
    var numBad = 0;
    var numErrors = 0;

    for (var i = 0; i < layer.length; i++) {
        var feature = layer.feature(i);
        if (feature.type !== 3) continue;

        var polygons = feature.loadGeometry();

        for (var j = 0; j < polygons.length; j++) {
            var data = flatten(polygons[j]);

            numFeatures++;
            var triangles = earcut(data.vertices, data.holes);
            var deviation = earcut.deviation(data.vertices, data.holes, 2, triangles);
            if (deviation !== 0) {
                numBad++;
                writeData(JSON.stringify({
                    deviation: deviation,
                    coords: toJSON(polygons[j])
                }) + '\n');
            }
        }
    }

    done(null, {
        numFeatures: numFeatures,
        numBad: numBad
    });
};

function toJSON(polygon) {
    var result = [];
    for (var i = 0; i < polygon.length; i++) {
        var ring = [];
        for (var j = 0; j < polygon[i].length; j++) {
            var p = polygon[i][j];
            ring.push([p.x, p.y]);
        }
        result.push(ring);
    }
    return result;
}

function flatten(data) {
    var result = {vertices: [], holes: []},
        holeIndex = 0;

    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].length; j++) {
            result.vertices.push(data[i][j].x);
            result.vertices.push(data[i][j].y);
        }
        if (i > 0) {
            holeIndex += data[i - 1].length;
            result.holes.push(holeIndex);
        }
    }
    return result;
}
