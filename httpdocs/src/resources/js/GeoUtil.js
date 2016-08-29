define([
	'lodash',
	'google',
	'numeric'
], function(_, google, numeric) {
	'use strict';

	var GeoUtil = {};

	GeoUtil.trimGeocoderAddress = function(raw) {
		return raw.replace(/^[^〒]*〒[\d\-\s]+/, '');
	};

	GeoUtil.spline = function(path) {
		var coords = _.map(path.concat(path[0]), function(s) {
			return [ s.lat(), s.lng() ];
		}),
		points = _.range(0, path.length),
		samples = _.range(0, path.length, 0.1);
		
		return _.map(numeric.spline(points, coords).at(samples), function(s) {
			return new google.maps.LatLng(s[0], s[1]);
		});
	};

	GeoUtil.lngToMeter = function(lng, lat) {
		var R = 40000; // 赤道での地球の周囲
		return R * 1000 * Math.cos(2 * Math.PI * lat / 360) * lng / 360;
	};

	GeoUtil.meterToLng = function(meter, lat) {
		var R = 40000; // 赤道での地球の周囲
		return meter * 360 / (R * 1000 * Math.cos(2 * Math.PI * lat / 360));
	};

	GeoUtil.distance = function(p1, p2) {
		var modLng = Math.cos(2 * Math.PI * p1.lat() / 360);
		
		return Math.sqrt(Math.pow(p1.lat() - p2.lat(), 2) + Math.pow((p1.lng() - p2.lng()) * modLng, 2));
	};

	GeoUtil.divide = function(p1, p2, r) {
		return new google.maps.LatLng(
			p1.lat() + (p2.lat() - p1.lat()) * r,
			p1.lng() + (p2.lng() - p1.lng()) * r
		);
	};

	GeoUtil.getInclusionBounds = function(path) {
		var delta = 0.00001;
		
		return _.reduce(path, function(passed, pos) {
			if (passed === null) {
				return new google.maps.LatLngBounds(
					pos,
					new google.maps.LatLng(pos.lat() + delta, pos.lng() + delta)
				);
			} else {
				return passed.extend(pos);
			}
		}, null);
	};

	GeoUtil.getGravityCenter = function(path) {
		var len = path.length;
		
		return new google.maps.LatLng(
			_.reduce(path, function(passed, val) { return passed + val.lat(); }, 0) / len,
			_.reduce(path, function(passed, val) { return passed + val.lng(); }, 0) / len
		);
	};

	GeoUtil.isContained = function(point, path) {
		var vertices = _.map(path, function(pos, idx) {
				return [ pos, path[(idx + 1) % path.length] ];
			}),
			crossingVertices = _.filter(vertices, function(vertex) {
				var r = (vertex[0].lng() - point.lng()) / (vertex[0].lng() - vertex[1].lng()),
					crossPtLat = r * vertex[1].lat() + (1 - r) * vertex[0].lat();
				
				return crossPtLat >= point.lat()
					&& (vertex[0].lng() - point.lng()) * (vertex[1].lng() - point.lng()) <= 0;
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
		var modLng = Math.cos(2 * Math.PI * origin.lat() / 360),
			theta = Math.atan((p.lat() - origin.lat()) / ((p.lng() - origin.lng()) * modLng));
		
		if (p.lat() - origin.lat() > 0 && theta < 0) { theta += Math.PI; }
		if (p.lat() - origin.lat() < 0 && p.lng() - origin.lng() < 0) { theta += Math.PI; }
		if (p.lat() - origin.lat() < 0 && p.lng() - origin.lng() >= 0) { theta += 2 * Math.PI; }
		
		return theta;
	};

	GeoUtil.latLngToLiteral = function(latLng) {
		return { lat: latLng.lat(), lng: latLng.lng() };
	};

	GeoUtil.rotate = function(center, prevPoint, degree) {
		var radius = GeoUtil.distance(center, prevPoint),
			modLng = Math.cos(2 * Math.PI * center.lat() / 360),
			phi = GeoUtil.calcAngle(center, prevPoint) + degree * 2 * Math.PI / 360;
		
		return new google.maps.LatLng(
			center.lat() + radius * Math.sin(phi),
			center.lng() + radius * Math.cos(phi) / modLng
		);
	};

	return GeoUtil;
});

