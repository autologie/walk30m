define([ 'resources/js/dev/GeoUtil.js',
	'resources/js/dev/Walk30mUtils.js'
], function(GeoUtil, Walk30mUtils) {

	function ResultVisualizer(application, map, objectManager) {
		var me = this,
			defaultStyler = map.data.getStyle();

		me.application = application;
		me.map = map;
		me.objectManager = objectManager;
		me.twitterURITpl = _.template('https://twitter.com/intent/tweet?text={{message}}&url={{url}}&hashtags=walk30m');
		me.routeLinkTpl = _.template('https://www.google.co.jp/maps/dir/{{originLat}},{{originLng}}/{{destLat}},{{destLng}}');
		me.balloonTpl = _.template(application.getMessage('routeDetailBalloonTpl'));
		me.summaryBalloonTpl = _.template(application.getMessage('resultSummaryBalloonTpl'));

		me.map.data.addListener('click', _.bind(me.onClickResult, me));

		me.map.data.setStyle(function(feature) {
			if (feature.getProperty('isResult') === true) {
				return {
					strokeColor: '#4a4',
					fillColor: '#4a4',
					strokeOpacity: 1,
					fillOpacity: 0.3
				};
			} else {
				return _.isObject(defaultStyler)
					? defaultStyler
					: _.isFunction(defaultStyler)
						? defaultStyler(feature)
						: {};
			}
		});
	}

	ResultVisualizer.prototype.createRouteLink = function(route) { 
		var me = this,
			path = route.overview_path;

		return me.routeLinkTpl({
			originLat: path[0].lat(),
			originLng: path[0].lng(),
			destLat: route.overview_path[path.length - 1].lat(),
			destLng: path[path.length - 1].lng(),
		});
	};

	ResultVisualizer.prototype.createBalloonContent = function(directionResult) {
		var me = this,
			route = directionResult.routes[0],
			content = me.balloonTpl({
				dest: GeoUtil.trimGeocoderAddress(route.legs[0].end_address),
				time: route.legs[0].duration.text,
				url: me.createRouteLink(route),
				summary: route.summary,
				copyright: route.copyrights
			});

		return content;
	};

	ResultVisualizer.prototype.clearResultDetail = function() {
		var me = this;

		me.objectManager.clearObject('routeBalloon');
		me.objectManager.clearObjects('route');
	};

	ResultVisualizer.prototype.showResultDetail = function(feature) {
		var me = this,
			cls = 'route';
		
		feature.getProperty('vertices').forEach(function(vertex) {
			var route = vertex.directionResult.routes[0].overview_path,
				endPoint = me.objectManager.showObject(new google.maps.Marker({
					position: route[route.length - 1],
					icon: {
						path: google.maps.SymbolPath.CIRCLE,
						scale: 6,
						strokeColor: '#4a4',
						strokeWeight: 3
					}
				}), cls),
				path = me.objectManager.showObject(new google.maps.Polyline({
					path: route,
					clickable: false,
					strokeColor: '#4a4',
					strokeWeight: 3,
					strokeOpacity: 1
				}), cls);

			function onClickRoute(event) {
				me.objectManager.clearObject('routeBalloon');
				me.objectManager.showObject(new google.maps.InfoWindow({
					position: event.latLng,
					content: me.createBalloonContent(vertex.directionResult),
					maxWidth: 320
				}), null, 'routeBalloon');
			}

			endPoint.addListener('click', onClickRoute);
		});
	};

	ResultVisualizer.prototype.createSummary = function(feature) {
		var me = this,
			options = feature.getProperty('options');

		return me.summaryBalloonTpl(Walk30mUtils.createSummary(_.defaults({
			timeUnitMinExpr: me.application.getMessage('timeUnitMinExpr')
		}, options)));
	};

	ResultVisualizer.prototype.showSummaryBalloon = function(feature) {
		var me = this,
			__ = _.bind(me.application.getMessage, me.application)
			$balloon = $(me.map.getDiv()).find('.gm-style-iw'),
			options = feature.getProperty('options'),
			summary = Walk30mUtils.createSummary(_.defaults({
				travelModeExpr: __('travelModes')[options.mode],
				timeUnitMinExpr: __('timeUnitMinExpr')
			}, options));

		me.objectManager.showObject(new google.maps.InfoWindow({
			position: options.origin,
			content: me.createSummary(feature),
			maxWidth: 320
		}), null, 'summaryBalloon');

		$balloon.find('a[role=tweet-result]').click(function() {
			var url = me.twitterURITpl({
				url: window.encodeURIComponent(Walk30mUtils.createSharedURI(feature)),
				message: window.encodeURIComponent(_.template(__('tweetMessageTpl'))(summary))
			});

			window.open(url, '_blank');
		});
		$balloon.find('a[role=report-problem]').click(function() {
			me.application.startEditMessage(_.template(__('reportMessageTpl'))({
				id: feature.getId(),
				summary: _.template(__('summaryTpl'))(summary)
			}));
		});
		$balloon.find('a[role=erase-result]').click(function() {
			me.map.data.remove(feature);
			me.objectManager.clearObject('summaryBalloon');
		});
		$balloon.find('a[role=show-routes]').click(function() {
			me.objectManager.clearObject('summaryBalloon');
			feature.setProperty('detailed', true);
			me.showResultDetail(feature);
		});
	};

	ResultVisualizer.prototype.onClickResult = function(event) {
		var me = this;
		
		me.clearResultDetail();

		if (event.feature.getProperty('detailed')) {
			event.feature.setProperty('detailed', false);
		}
		me.showSummaryBalloon(event.feature);
	};

	ResultVisualizer.prototype.addResult = function(result) {
		var me = this,
			vertices = _.collect(result.vertices, 'endLocation'),
			toSpline = vertices.concat(vertices.slice(0).splice(0, Math.round(vertices.length / 2))),
			toGeoJsonCoord = function(coord) {
				return [ coord.lng(), coord.lat() ];
			},
			splined = GeoUtil.spline(toSpline);
		
		splined = splined.slice(0, Math.round(splined.length * 2 / 3) - 2);

		me.map.data.addGeoJson({
			type: 'Feature',
			id: result.taskId,
			geometry: {
				type: 'Polygon',
				coordinates: [
					splined.concat([ splined[0] ]).map(toGeoJsonCoord)
				]
			},
			properties: _.defaults({
				isResult: true,
				vertices: result.vertices.slice(0)
			}, result)
		});
	};

	return ResultVisualizer;
});

