'use strict';
define([
	'window',
	'underscore'
], function(window, _) {
	var Walk30mUtils = {};

	Walk30mUtils.createSummary = function(options) {
		return _.defaults({
			originAddress: options.address,
			timeExpr: (options.time / 60)
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
				];
			}, [ null, [] ])[1];
		
		return charSeq.reduce(function(passed, elem) {
			var x = parseInt(elem[0], 36) / 1000000,
				y = parseInt(elem[1], 36) / 1000000,
				last = passed? passed[passed.length - 1]: null;
				
			return passed
				? passed.concat([ { lat: last.lat + y, lng: last.lng + x } ])
				: [ { lat: y, lng: x } ];
		}, null);
	};

	Walk30mUtils.createSharedURI = function(feature) {
		var path = _.collect(feature.getProperty('vertices'), 'endLocation');

		try {
			return _.template('https://www.walk30m.com/#!/result?request={{req}}&path={{path}}')({
				req: window.encodeURIComponent(JSON.stringify(feature.getProperty('task').serialize().config)),
				path: Walk30mUtils.encodeResult(path.map(function(latLng) {
					return { lat: latLng.lat(), lng: latLng.lng() };
				}))
			});

		} catch(ex) {
			// fallback
			return 'https://www.walk30m.com/';
		}
	};

	return Walk30mUtils;
});

