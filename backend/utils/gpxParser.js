const fs = require("fs");
const { XMLParser } = require("fast-xml-parser");

const toRadians = (degrees) => {
  return (degrees * Math.PI) / 180;
};

const calculateDistanceKm = (pointA, pointB) => {
  const earthRadiusKm = 6371;

  const dLat = toRadians(pointB.lat - pointA.lat);
  const dLon = toRadians(pointB.lon - pointA.lon);

  const lat1 = toRadians(pointA.lat);
  const lat2 = toRadians(pointB.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
};

const parseGpxFile = (filePath) => {
  const xmlData = fs.readFileSync(filePath, "utf8");

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: ""
  });

  const result = parser.parse(xmlData);

  const track = Array.isArray(result.gpx.trk)
    ? result.gpx.trk[0]
    : result.gpx.trk;

  const segments = Array.isArray(track.trkseg) ? track.trkseg : [track.trkseg];

  let trackPoints = [];

  segments.forEach((segment) => {
    const points = Array.isArray(segment.trkpt)
      ? segment.trkpt
      : [segment.trkpt];

    trackPoints = trackPoints.concat(points);
  });

  const points = trackPoints.map((point) => ({
    lat: Number(point.lat),
    lon: Number(point.lon),
    ele: Number(point.ele || 0),
    time: point.time ? new Date(point.time) : null
  }));

  let distanceKm = 0;
  let elevationGainM = 0;

  for (let i = 1; i < points.length; i++) {
    distanceKm += calculateDistanceKm(points[i - 1], points[i]);

    const elevationDifference = points[i].ele - points[i - 1].ele;

    if (elevationDifference > 0) {
      elevationGainM += elevationDifference;
    }
  }

  const startTime = points[0]?.time;
  const endTime = points[points.length - 1]?.time;

  let durationSeconds = 0;

  if (startTime && endTime) {
    durationSeconds = Math.round((endTime - startTime) / 1000);
  }

  return {
    date: startTime,
    distanceKm: Number(distanceKm.toFixed(2)),
    elevationGainM: Math.round(elevationGainM),
    durationSeconds
  };
};

module.exports = { parseGpxFile };
