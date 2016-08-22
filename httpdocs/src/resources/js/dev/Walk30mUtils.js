define([
], function() {
	'use strict';

	var Walk30mUtils = {};

	Walk30mUtils.createSummary = function(options) {
		return _.defaults({
			originAddress: options.address,
			timeExpr: (options.time / 60) + options.timeUnitMinExpr
		}, options);
	};

	Walk30mUtils.encodeResult = function(coords) {
		var diffSequence = coords.reduce(function(passed, elem) {
			return [
				elem,
				passed[1].concat([[
					Math.round(1000000 * (elem.lng - (passed[0] === null? 0: passed[0].lng))),
					Math.round(1000000 * (elem.lat - (passed[0] === null? 0: passed[0].lat)))
				]])
			];
		}, [ null, [] ])[1];

		return diffSequence.map(function(s) {
			return [
				s[0].toString(36),
				s[1].toString(36)
			].join(' ');
		}).join(',')
			.replace(/,/g, ' ')
			.replace(/\s/g, '+')
			.replace(/\+\-/g, '-');
	};

	Walk30mUtils.decodeResult = function(str) {
		var charSeq = str
			.replace(/\+/g, ' ')
			.replace(/\-/g, ' -')
			.split(' ')
			.reduce(function(passed, elem) {
				return [
					passed[0] === null? elem: null,
					passed[0] === null? passed[1]: passed[1].concat([[ passed[0], elem ]])
				]
			}, [ null, [] ])[1];
		
		return charSeq.reduce(function(passed, elem) {
			var x = parseInt(elem[0], 36) / 1000000,
				y = parseInt(elem[1], 36) / 1000000;
				
			return [
				[ x, y ],
				passed
					? passed[1].concat([ { lat: passed[0][1] + y, lng: passed[0][0] + x } ])
					: [ { lat: y, lng: x } ]
			];
		}, null)[1];
	};

	Walk30mUtils.createSharedURI = function(feature) {
		return _.template('https://walk30m.com?path={{path}}')({
			path: Walk30mUtils.encodeResult(_.collect(feature.getProperty('vertices'), 'endLocation').map(function(latLng) {
				return { lat: latLng.lat(), lng: latLng.lng() };
			}))
		});
	};

	return Walk30mUtils;
});

