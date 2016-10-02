import _ from 'lodash';
import numeric from 'numeric';

export const trimGeocoderAddress = function (raw) {
  return raw.replace(/^[^〒]*〒[\d\-\s]+/, '');
};

export const spline = function (path) {
  let coords = _.map(path.concat(path[0]), function (s) {
      return [s.lat, s.lng];
    }),
    points = _.range(0, path.length),
    samples = _.range(0, path.length, 0.1);

  return _.map(numeric.spline(points, coords).at(samples), function (s) {
    return {lat: s[0], lng: s[1]};
  });
};

export const lngToMeter = function (lng, lat) {
  const R = 40000; // 赤道での地球の周囲
  return R * 1000 * Math.cos(2 * Math.PI * lat / 360) * lng / 360;
};

export const meterToLng = function (meter, lat) {
  const R = 40000; // 赤道での地球の周囲
  return meter * 360 / (R * 1000 * Math.cos(2 * Math.PI * lat / 360));
};

export const distance = function (p1, p2) {
  const modLng = Math.cos(2 * Math.PI * p1.lat / 360);

  return Math.sqrt(Math.pow(p1.lat - p2.lat, 2) + Math.pow((p1.lng - p2.lng) * modLng, 2));
};

export const divide = function (p1, p2, r) {
  return {
    lat: p1.lat + (p2.lat - p1.lat) * r,
    lng: p1.lng + (p2.lng - p1.lng) * r
  };
};

export const getGravityCenter = function (path) {
  const len = path.length;

  return {
    lat: _.reduce(path, function (passed, val) { return passed + val.lat; }, 0) / len,
    lng: _.reduce(path, function (passed, val) { return passed + val.lng; }, 0) / len
  };
};

export const isContained = function (point, path) {
  let vertices = _.map(path, function (pos, idx) {
      return [pos, path[(idx + 1) % path.length]];
    }),
    crossingVertices = _.filter(vertices, function (vertex) {
      let r = (vertex[0].lng - point.lng) / (vertex[0].lng - vertex[1].lng),
        crossPtLat = r * vertex[1].lat + (1 - r) * vertex[0].lat;

      return crossPtLat >= point.lat
        && (vertex[0].lng - point.lng) * (vertex[1].lng - point.lng) <= 0;
    });

  return crossingVertices.length % 2 === 1;
};

export const calcAngle = function (origin, p) {
  let modLng = Math.cos(2 * Math.PI * origin.lat / 360),
    theta = Math.atan((p.lat - origin.lat) / ((p.lng - origin.lng) * modLng));

  if (p.lat - origin.lat > 0 && theta < 0) { theta += Math.PI; }
  if (p.lat - origin.lat < 0 && p.lng - origin.lng < 0) { theta += Math.PI; }
  if (p.lat - origin.lat < 0 && p.lng - origin.lng >= 0) { theta += 2 * Math.PI; }

  return theta;
};

export const latLngToLiteral = function (latLng) {
  return { lat: latLng.lat, lng: latLng.lng };
};

export const rotate = function (center, prevPoint, degree) {
  let radius = distance(center, prevPoint),
    modLng = Math.cos(2 * Math.PI * center.lat / 360),
    phi = calcAngle(center, prevPoint) + degree * 2 * Math.PI / 360;

  return {
    lat: center.lat + radius * Math.sin(phi),
    lng: center.lng + radius * Math.cos(phi) / modLng
  };
};
