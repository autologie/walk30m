(function(window, _, GeoUtil, google) {
'use strict';

function CalculationService(options) {
	var me = this;
	
	options.$directionPanel.children().remove();
	
	me.isRunning = false;
	me.enableTollRoad = options.enableTollRoad;
	me.time = options.time;
	me.initial = options.initial;
	me.address = options.address;
	me.mode = options.mode;
	me.origin = options.origin;
	me.anglePerStep = options.anglePerStep;
	me.directionsRenderer = new google.maps.DirectionsRenderer({
		panel: options.$directionPanel[0],
		draggable: false,
		hideRouteList: true,
		suppressInfoWindow: true,
		map: options.map
	});
	me.vertices = new google.maps.MVCArray();
	me.vertices.addListener('insert_at', function(n) {
		var added = me.vertices.getAt(n);
		
		google.maps.event.trigger(me, 'progress', Math.round(100 * me.accumulateAngles(_.collect(me.vertices.getArray(), 'endLocation')) / 2 / Math.PI), added);
	});
}

CalculationService.prototype = new google.maps.MVCObject();

CalculationService.prototype.createRouteOptions = function(start, dest, mode) {
	var me = this;
	
	return {
		origin: start,
		destination: dest,
		travelMode: google.maps.TravelMode[mode],
		avoidFerries: true,
		avoidHighways: !me.enableTollRoad,
		avoidTolls: !me.enableTollRoad,
		transitOptions: {
			arrivalTime: new Date(2014, 11, 23, 10),
			departureTime: new Date(2014, 11, 23, 10)
		}
		
	};
}

CalculationService.prototype.calcRoute = (function(queue, interval) {
	var directionsService = new google.maps.DirectionsService(),
		successiveLimitOver = 0;
	
	window.setInterval(function() {
		var task = queue.pop();
		
		if (task && task.thisObj.isRunning) {
			google.maps.event.trigger(task.thisObj, 'request', task.opts);
			
			directionsService.route(task.opts, function(res, status) {
				if (!task.thisObj.isRunning) {
					queue = [];
					
				} else if (task.thisObj.isPausing) {
					queue.push(task);
					
				} else if (status !== google.maps.DirectionsStatus.OVER_QUERY_LIMIT) {
					successiveLimitOver = 0;
					task.opts.isNarrowing = task.isNarrowing;
					task.cb(res, status, task.opts);
				} else {
					window.setTimeout(function() { queue.push(task); }, (1 + successiveLimitOver) * 1000);
					
					successiveLimitOver++;
					if (successiveLimitOver > 2) {
						google.maps.event.trigger(task.thisObj, 'warning', 'FREQUENT_OVER_QUERY_LIMIT');
					}
				}
			});
		}
	}, interval);
	
	return function(dest, isNarrowing) {
		var me = this,
			opts = me.createRouteOptions(me.origin, dest, me.mode);
		
		if (!opts.destination) {
			google.maps.event.trigger(me, 'error', 'NO_DESTINATION_SPECIFIED');
		}
		queue.push({
			thisObj: me,
			opts: opts,
			cb: me.handleDirectionResponse.bind(me),
			isNarrowing: !!isNarrowing
		});
	};
})([], 100);

CalculationService.prototype.dispose = function() {
	var me = this;
	
	me.stop();
	me.directionsRenderer.setMap(null);
};

CalculationService.prototype.start = function() {
	var dest,
		center = this.origin,
		me = this;

	me.isPausing = false;
	me.isRunning = true;
	dest = new google.maps.LatLng(center.lat(), center.lng() + GeoUtil.meterToLng(100, center.lat()));
	me.calcRoute(dest);
	me.startTime = new Date();
	$.ajax({
		url: '/api/execution_log',
		type: 'POST',
		dataType: 'json',
		contentType: 'application/json; charset=utf-8',
		data: JSON.stringify({
			start_datetime: me.startTime.toISOString(),
			origin_address: me.address,
			origin_latitude: center.lat(),
			origin_longitude: center.lng(),
			initial: me.initial,
			travel_mode: me.mode,
			avoid_ferries: 1,
			avoid_tolls: me.enableTollRoad? 0: 1,
			travel_time_sec: me.time,
			url: window.location.href
		})
	}).done(function(res) {
		me.taskId = res.uuid;
	});
		
};

CalculationService.prototype.walkToFillSecondsAlong = function(sec, wayPoints) {

	function getPartial(step, ratio) {
		var len = 0, lat_lngs = [],
			limited_length = _.reduce(step.lat_lngs, function(passed, v, idx, arr) {
				return idx === arr.length - 1? passed: passed + GeoUtil.distance(v, arr[idx + 1]);
			}, 0) * ratio;
		
		_.each(step.lat_lngs, function(pos, idx, arr) {
			if (idx === 0 || (len += GeoUtil.distance(pos, arr[idx - 1])) <= limited_length) {
				lat_lngs.push(pos);
			} else {
				return false;
			}
		});
		return lat_lngs;
	}

	return _.reduce(wayPoints, function(passed, step) {
		var next_accum;
		
		if (passed && passed.end_flag) {
			return passed;
			
		} else {
			next_accum = (passed? passed.accum: 0) + step.duration.value;
			if (next_accum > sec) {
				step.lat_lngs = getPartial(step, 1 - (next_accum - sec) / step.duration.value);
			}
			
			step.accum = next_accum;
			step.end_flag = next_accum > sec;
			step.concat_path = ((passed && passed.concat_path) || []).concat(step.lat_lngs);
			return step;
		}
	}, null);
};

CalculationService.prototype.accumulateAngles = function(vertices) {
	var me = this,
		checked = 0,
		halfPi = Math.PI / 2,
		diff,
		angles = _.map(vertices, function(v) { return GeoUtil.calcAngle(me.origin, v) });
		
	return _.reduce(angles, function(passed, angle, idx, arr) {
			return passed + (idx > 0? ((diff = angle - arr[idx - 1]) < -1 * Math.PI? (diff + 2 * Math.PI): diff): 0);
		}, 0);
};

CalculationService.prototype.isComplete = function(vertices) {
	return this.accumulateAngles(vertices) >= 2 * Math.PI;
};

CalculationService.prototype.stop = function() { this.isRunning = false; };

CalculationService.prototype.pause = function() { this.isPausing = true; };

CalculationService.prototype.resume = function() { this.isPausing = false; };

CalculationService.prototype.handleDirectionResponse = function(response, status, request) {
	var leg, lastWayPoint, step,
		dest = request.destination,
		center = this.origin,
		sec = this.time,
		me = this,
		nextDest, sameLocation, rotateBase;
	
	if (status === google.maps.DirectionsStatus.ZERO_RESULTS) {
		nextDest = GeoUtil.divide(center, dest, 0.8);
		me.calcRoute(nextDest, true);
	
	} else if (status !== google.maps.DirectionsStatus.OK) {
		google.maps.event.trigger(me, 'error', status);
		
	} else {
		leg = response.routes[0].legs[0];
		
		if (!request.isNarrowing && leg.duration.value < sec) {
			nextDest = GeoUtil.divide(center, dest, Math.max(1.5, sec / leg.duration.value));
			if (GeoUtil.calcAngle(center, nextDest) <= GeoUtil.calcAngle(center, dest)) {
				nextDest = GeoUtil.rotate(center, nextDest, me.anglePerStep);
			}
			me.calcRoute(nextDest);
			
		} else if (step = me.walkToFillSecondsAlong(sec, leg.steps)) {
			lastWayPoint = step.lat_lngs[step.lat_lngs.length - 1];
			sameLocation = function(v) {
				return GeoUtil.distance(v.endLocation, lastWayPoint) < 0.0005;
			};
			
			if (_.some(me.vertices.getArray(), sameLocation)) {
				nextDest = GeoUtil.divide(center, GeoUtil.rotate(center, dest, 3), 0.8);
				me.calcRoute(nextDest, true);
				
			} else if (me.isComplete(_.collect(me.vertices.getArray(), 'endLocation').concat(lastWayPoint))) {
				me.isRunning = false;
				google.maps.event.trigger(me, 'complete', {
					result: me.vertices,
					timeConsumed: new Date() - me.startTime
				});
				$.ajax({
					url: '/api/execution_log/' + me.taskId,
					type: 'PUT',
					dataType: 'json',
					contentType: 'application/json; charset=utf-8',
					data: JSON.stringify({
						complete_datetime: new Date().toISOString(),
						extra_info: _.map(_.collect(me.vertices.getArray(), 'endLocation'), function(latLng) {
							return { lat: latLng.lat(), lng: latLng.lng() };
						})
					})
				});
				
			} else {
				me.vertices.push({
					endLocation: lastWayPoint,
					step: step,
					directionResult: response
				});
				rotateBase = GeoUtil.calcAngle(center, dest) < GeoUtil.calcAngle(center, lastWayPoint)? lastWayPoint: dest;
				nextDest = GeoUtil.rotate(center, rotateBase, me.anglePerStep);
				me.calcRoute(nextDest);
			}
		} else {
			google.maps.event.trigger(me, 'error');
		}
	}
};

window.CalculationService = CalculationService;

})(window, _, GeoUtil, google);
