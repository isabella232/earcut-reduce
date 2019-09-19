'use strict';

const earcut = require('earcut');

module.exports = function (data, tile, writeData, done) {
    let numFeatures = 0;
    let numBad = 0;

    for (const layerId in data.source) {
        if (global.mapOptions.layerId && layerId !== global.mapOptions.layerId) continue;

        const layer = data.source[layerId];

        for (let i = 0; i < layer.length; i++) {
            const feature = layer.feature(i);
            if (feature.type !== 3) continue;

            const polygons = classifyRings(feature.loadGeometry());

            for (let j = 0; j < polygons.length; j++) {
                const polygon = flatten(polygons[j]);

                numFeatures++;
                const triangles = earcut(polygon.vertices, polygon.holes);
                const deviation = earcut.deviation(polygon.vertices, polygon.holes, 2, triangles);
                if (deviation !== 0) {
                    numBad++;
                    writeData(`${JSON.stringify(toJSON(polygons[j]))  }\n`);
                }
            }
        }
    }

    done(null, {
        numFeatures,
        numBad
    });
};

function toJSON(polygon) {
    const result = [];
    for (let i = 0; i < polygon.length; i++) {
        const ring = [];
        for (let j = 0; j < polygon[i].length; j++) {
            const p = polygon[i][j];
            ring.push([p.x, p.y]);
        }
        result.push(ring);
    }
    return result;
}

function flatten(data) {
    const result = {vertices: [], holes: []};
    let holeIndex = 0;

    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
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

function classifyRings(rings) {
    const len = rings.length;

    if (len <= 1) return [rings];

    const polygons = [];
    let polygon, ccw;

    for (let i = 0; i < len; i++) {
        const area = signedArea(rings[i]);
        if (area === 0) continue;

        if (ccw === undefined) ccw = area < 0;

        if (ccw === area < 0) {
            if (polygon) polygons.push(polygon);
            polygon = [rings[i]];

        } else {
            polygon.push(rings[i]);
        }
    }
    if (polygon) polygons.push(polygon);

    return polygons;
}

function signedArea(ring) {
    let sum = 0;
    for (let i = 0, len = ring.length, j = len - 1, p1, p2; i < len; j = i++) {
        p1 = ring[i];
        p2 = ring[j];
        sum += (p2.x - p1.x) * (p1.y + p2.y);
    }
    return sum;
}
