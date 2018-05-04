import _ from "lodash";
import numeric from "numeric";

const GeoUtil = {};

GeoUtil.trimGeocoderAddress = function(raw) {
  return raw.replace(/^[^〒]*〒[\d\-\s]+/, "");
};

GeoUtil.spline = function(path) {
  let coords = _.map(path.concat(path[0]), s => [s.lat(), s.lng()]),
    points = _.range(0, path.length),
    samples = _.range(0, path.length, 0.1);

  return _.map(
    numeric.spline(points, coords).at(samples),
    s => new google.maps.LatLng(s[0], s[1])
  );
};

GeoUtil.lngToMeter = function(lng, lat) {
  const R = 40000; // 赤道での地球の周囲
  return R * 1000 * Math.cos(2 * Math.PI * lat / 360) * lng / 360;
};

GeoUtil.meterToLng = function(meter, lat) {
  const R = 40000; // 赤道での地球の周囲
  return meter * 360 / (R * 1000 * Math.cos(2 * Math.PI * lat / 360));
};

GeoUtil.distance = function(p1, p2) {
  const modLng = Math.cos(2 * Math.PI * p1.lat() / 360);

  return Math.sqrt(
    Math.pow(p1.lat() - p2.lat(), 2) +
      Math.pow((p1.lng() - p2.lng()) * modLng, 2)
  );
};

GeoUtil.divide = function(p1, p2, r) {
  return new google.maps.LatLng(
    p1.lat() + (p2.lat() - p1.lat()) * r,
    p1.lng() + (p2.lng() - p1.lng()) * r
  );
};

GeoUtil.getInclusionBounds = function(path) {
  const delta = 0.00001;

  return _.reduce(
    path,
    (passed, pos) => {
      if (passed === null) {
        return new google.maps.LatLngBounds(
          pos,
          new google.maps.LatLng(pos.lat() + delta, pos.lng() + delta)
        );
      }
      return passed.extend(pos);
    },
    null
  );
};

GeoUtil.getGravityCenter = function(path) {
  const len = path.length;

  return new google.maps.LatLng(
    _.reduce(path, (passed, val) => passed + val.lat(), 0) / len,
    _.reduce(path, (passed, val) => passed + val.lng(), 0) / len
  );
};

GeoUtil.isContained = function(point, path) {
  let vertices = _.map(path, (pos, idx) => [
      pos,
      path[(idx + 1) % path.length]
    ]),
    crossingVertices = _.filter(vertices, vertex => {
      let r =
          (vertex[0].lng() - point.lng()) / (vertex[0].lng() - vertex[1].lng()),
        crossPtLat = r * vertex[1].lat() + (1 - r) * vertex[0].lat();

      return (
        crossPtLat >= point.lat() &&
        (vertex[0].lng() - point.lng()) * (vertex[1].lng() - point.lng()) <= 0
      );
    });

  return crossingVertices.length % 2 === 1;
};

/*
path=[
  new google.maps.LatLng(1,1),
  new google.maps.LatLng(2,4),
  new google.maps.LatLng(4,1),
  new google.maps.LatLng(2,0)
]
*/

GeoUtil.calcAngle = function(origin, p) {
  let modLng = Math.cos(2 * Math.PI * origin.lat() / 360),
    theta = Math.atan(
      (p.lat() - origin.lat()) / ((p.lng() - origin.lng()) * modLng)
    );

  if (p.lat() - origin.lat() > 0 && theta < 0) {
    theta += Math.PI;
  }
  if (p.lat() - origin.lat() < 0 && p.lng() - origin.lng() < 0) {
    theta += Math.PI;
  }
  if (p.lat() - origin.lat() < 0 && p.lng() - origin.lng() >= 0) {
    theta += 2 * Math.PI;
  }

  return theta;
};

GeoUtil.latLngToLiteral = function(latLng) {
  return { lat: latLng.lat(), lng: latLng.lng() };
};

GeoUtil.rotate = function(center, prevPoint, degree) {
  let radius = GeoUtil.distance(center, prevPoint),
    modLng = Math.cos(2 * Math.PI * center.lat() / 360),
    phi = GeoUtil.calcAngle(center, prevPoint) + degree * 2 * Math.PI / 360;

  return new google.maps.LatLng(
    center.lat() + radius * Math.sin(phi),
    center.lng() + radius * Math.cos(phi) / modLng
  );
};

export default GeoUtil;
