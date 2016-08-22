define([
	'./GeoUtil.js',
	'./Footprint.js',
	'./ObjectManager.js',
	'./ResultVisualizer.js'
], function(GeoUtils, Footprint, ObjectManager, ResultVisualizer) {

	function MapController(application, $el, mapOptions) {
		var me = this;

		me.$el = $el;
		me.application = application;
		me.$centerMarker = $el.find('.center-marker');
		me.$message = $el.find('.message');
		me.$determineBtn = $el.find('.btn[role=determine-location]');
		me.$retryBtn = $el.find('.btn[role=retry]');
		me.$cancelBtn = $el.find('.btn[role=cancel]');
		me.footprint = new Footprint();
		me.map = me.initMap(mapOptions);
		me.objectManager = new ObjectManager(me.map);
		me.resultVisualizer= new ResultVisualizer(application, me.map, me.objectManager);
	}

	MapController.prototype.initMap = function(options) {
		return new google.maps.Map(this.$el.find('#map-canvas').get(0), _.defaults(options || {}, {
			center: new google.maps.LatLng(36, 140),
			zoom: 13,
			zoomControlOptions: {
				position: google.maps.ControlPosition.RIGHT_CENTER
			},
			streetViewControlOptions: {
				position: google.maps.ControlPosition.RIGHT_CENTER
			}
		}));
	};
	
	MapController.prototype.hideMessage = function(message) {
		this.$message.fadeOut();
	};
	
	MapController.prototype.showMessage = function(message) {
		this.$message.text(message).fadeIn();
	};

	MapController.prototype.getMap = function() { return this.map; };

	MapController.prototype.startCalculation = function(calcService, onExit) {
		var me = this,
			calcMsgTpl = _.template(me.application.getMessage('searching')),
			request = calcService.currentTask.config,
			listeners = [];

		function onClickRetryBtn() {
			var isCompleted = !calcService.isRunning;

			if (isCompleted || window.confirm(me.application.getMessage('askIfAbort'))) {
				me.objectManager.clearObject('inProgress');
				me.$retryBtn.hide();
				me.hideMessage();
				me.footprint.setMap(null);
				listeners.forEach(function(listener) {
					google.maps.event.removeListener(listener);
				});
				onExit(isCompleted);
			} else {
				me.$retryBtn.off().one('click', onClickRetryBtn);
			}
		}

		me.resultVisualizer.clearResultDetail();
		me.showMessage(calcMsgTpl(_.defaults({
			min: request.time / 60,
			travelModeExpr: me.application.getMessage('travelModes')[request.mode]
		}, request)));
		me.$retryBtn.show();
		me.$retryBtn.off().one('click', onClickRetryBtn);

		me.footprint.setOptions({ position: request.origin });
		me.footprint.setMap(me.map);

		listeners.push(calcService.addListener('progress', _.once(_.bind(me.onInitialProgress, me, calcService))));
		listeners.push(calcService.addListener('progress', _.bind(me.onProgress, me, calcService)));
		listeners.push(calcService.addListener('complete', _.bind(me.onComplete, me, calcService)));

		me.map.panTo(request.origin);
	};

	MapController.prototype.onComplete = function(calcService, vertices, task) {
		var me = this;
		
		me.objectManager.clearObject('inProgress');
		me.resultVisualizer.addResult({
			taskId: task.taskId,
			options: task.config,
			vertices: vertices.getArray()
		});
		me.footprint.stop();
		me.showMessage(me.application.getMessage('completed'));
		_.delay(function() {
			me.hideMessage();
			me.footprint.setMap(null);
		}, 2000);
	};

	MapController.prototype.onProgress = function(calcService, percent, added, endLocations) {
		var me = this;

		me.footprint.setAngle(90 - percent * 360 / 100);
		me.drawArea(endLocations);
	};

	MapController.prototype.onInitialProgress = function(calcService, percent, added, endLocations) {
		var me = this,
			center = calcService.currentTask.config.origin,
			latDiff, lngDiff;

		latDiff = Math.abs(center.lat() - added.endLocation.lat());
		lngDiff = Math.abs(center.lng() - added.endLocation.lng());
		me.map.fitBounds({
			north: center.lat() + latDiff,
			south: center.lat() - latDiff,
			east: center.lng() + lngDiff,
			west: center.lng() - lngDiff
		});
		me.map.setZoom(me.map.getZoom() - 1);
	};

	MapController.prototype.drawArea = function(vertices) {
		var me = this,
			splined = GeoUtils.spline(vertices.concat(vertices.slice(0).splice(0, Math.round(vertices.length / 2))));
			
		me.objectManager.showObject(new google.maps.Polygon({
			path: splined.splice(0, Math.round(splined.length * 2 / 3) - 2),
			strokeColor: '#080',
			fillColor: '#080',
			clickable: false,
			strokeOpacity: 0.7,
			fillOpacity: 0.3,
			zIndex: 100
		}), null, 'inProgress');
	};

	MapController.prototype.startView = function(callback) {
		var me = this;

		me.$retryBtn.show();
		me.$retryBtn.off().one('click', function() {
			me.$retryBtn.hide();
			callback();
		});
	};

	MapController.prototype.specifyLocation = function(callback) {
		var me = this,
			dragStartListener;

		function hideMessage() {
			me.hideMessage();
		}

		function finalize(latLng) {
			me.$centerMarker.hide();
			me.$determineBtn.hide();
			me.$cancelBtn.hide();
			google.maps.event.removeListener(dragStartListener);
			hideMessage();
			callback(latLng);
		}

		me.$centerMarker.show();
		me.$determineBtn.show();
		me.$cancelBtn.show();
		me.showMessage(me.application.getMessage('dragMapToSpecifyLocation'));

		dragStartListener = google.maps.event.addListenerOnce(me.map, 'dragstart', hideMessage);

		me.$cancelBtn.off().one('click', function() {
			finalize();
		});
		me.$determineBtn.off().one('click', function() {
			finalize(me.map.getCenter());
		});
	};

	return MapController;
});

