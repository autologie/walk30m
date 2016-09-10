/* eslint-disable import/no-extraneous-dependencies,import/no-unresolved */
import _ from 'lodash';
import google from 'google';
import numeric from 'numeric';

const R = 40000; // 赤道での地球の周囲

export function trimGeocoderAddress(raw) {
  return raw.replace(/^[^〒]*〒[\d\-\s]+/, '');
}

export function degToRad(degree) {
  return 2 * Math.PI * (degree / 360);
}

export function spline(path) {
  const coords = _.map(path.concat(path[0]), s => ([s.lat(), s.lng()]));
  const points = _.range(0, path.length);
  const samples = _.range(0, path.length, 0.1);
  const splined = numeric.spline(points, coords).at(samples);

  return _.map(splined, s => new google.maps.LatLng(s[0], s[1]));
}

export function lngToMeter(lng, lat) {
  return (R * 1000 * Math.cos(degToRad(lat)) * lng) / 360;
}

export function meterToLng(meter, lat) {
  return (meter * 360) / (R * 1000 * Math.cos(degToRad(lat)));
}

export function distance(p1, p2) {
  const modLng = Math.cos(degToRad(p1.lat()));

  return Math.sqrt(Math.pow(p1.lat() - p2.lat(), 2) + Math.pow((p1.lng() - p2.lng()) * modLng, 2));
}

export function divide(p1, p2, r) {
  return new google.maps.LatLng(
    p1.lat() + ((p2.lat() - p1.lat()) * r),
    p1.lng() + ((p2.lng() - p1.lng()) * r)
  );
}

export function getInclusionBounds(path) {
  const delta = 0.00001;
  const first = path[0];
  const extend = (passed, pos) => passed.extend(pos);

  return _.reduce(path, extend, new google.maps.LatLngBounds(
    first,
    new google.maps.LatLng(first.lat() + delta, first.lng() + delta)
  ));
}

export function getGravityCenter(path) {
  const len = path.length;

  return new google.maps.LatLng(
    _.reduce(path, (passed, val) => passed + val.lat(), 0) / len,
    _.reduce(path, (passed, val) => passed + val.lng(), 0) / len
  );
}

export function isContained(point, path) {
  const vertices = _.map(path, (pos, idx) => [pos, path[(idx + 1) % path.length]]);
  const crossingVertices = _.filter(vertices, (vertex) => {
    const r = (vertex[0].lng() - point.lng()) / (vertex[0].lng() - vertex[1].lng());
    const crossPtLat = (r * vertex[1].lat()) + ((1 - r) * vertex[0].lat());

    return crossPtLat >= point.lat()
      && (vertex[0].lng() - point.lng()) * (vertex[1].lng() - point.lng()) <= 0;
  });

  return crossingVertices.length % 2 === 1;
}

/*
path=[
  new google.maps.LatLng(1,1),
  new google.maps.LatLng(2,4),
  new google.maps.LatLng(4,1),
  new google.maps.LatLng(2,0)
]
*/

export function calcAngle(origin, p) {
  const modLng = degToRad(origin.lat());
  let theta = Math.atan((p.lat() - origin.lat()) / ((p.lng() - origin.lng()) * modLng));

  if (p.lat() - origin.lat() > 0 && theta < 0) theta += Math.PI;
  if (p.lat() - origin.lat() < 0 && p.lng() - origin.lng() < 0) theta += Math.PI;
  if (p.lat() - origin.lat() < 0 && p.lng() - origin.lng() >= 0) theta += 2 * Math.PI;

  return theta;
}

export function latLngToLiteral({ lat, lng }) {
  return { lat: lat(), lng: lng() };
}

export function rotate(center, prevPoint, degree) {
  const radius = distance(center, prevPoint);
  const modLng = Math.cos(degToRad(center.lat()));
  const phi = calcAngle(center, prevPoint) + degToRad(degree);

  return new google.maps.LatLng(
    center.lat() + (radius * Math.sin(phi)),
    center.lng() + ((radius * Math.cos(phi)) / modLng)
  );
}

