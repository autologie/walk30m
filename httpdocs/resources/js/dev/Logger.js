define([
], function() {
	var endPoint = 'https://hotsh9cqva.execute-api.ap-northeast-1.amazonaws.com/develop/execution_log/';

	function Logger(calcService) {
		var me = this;

		me.calcService = calcService;
		me.executions = {};

		calcService.addListener('start', _.bind(me.onStart, me));
		calcService.addListener('complete', _.bind(me.onComplete, me));
	}

	Logger.prototype.onComplete = function(vertices, task) {
		var me = this,
			taskId = task.taskId;

		$.ajax({
			url: endPoint + taskId,
			type: 'PUT',
			dataType: 'json',
			contentType: 'application/json; charset=utf-8',
			data: JSON.stringify(_.defaults({
				complete_datetime: new Date().toISOString(),
				extra_info: _.map(_.collect(vertices.getArray(), 'endLocation'), function(latLng) {
					return { lat: latLng.lat(), lng: latLng.lng() };
				})
			}, me.executions[taskId]))
		})
	};

	Logger.prototype.collectClientInfo = function() {
		var $win = $(window);

		return {
			url: window.location.href,
			viewport: [ $win.width(), $win.height() ]
		};
	};

	Logger.prototype.onStart = function(task) {
		var me = this,
			request = task.config,
			center = request.origin,
			data = _.defaults({
				start_datetime: new Date().toISOString(),
				origin_address: task.address,
				origin_latitude: center.lat(),
				origin_longitude: center.lng(),
				travel_mode: task.mode,
				avoid_ferries: request.avoidFerries? 1: 0,
				avoid_tolls: request.avoidTolls? 1: 0,
				avoid_highways: request.avoidHighways? 1: 0,
				travel_time_sec: task.time,
				query: request.keyword
			}, me.collectClientInfo());

		$.ajax({
			url: endPoint,
			type: 'POST',
			dataType: 'json',
			contentType: 'application/json; charset=utf-8',
			data: JSON.stringify(data)
		}).done(function(res) {
			me.executions[res.uuid] = _.defaults({
				uuid: res.uuid
			}, data);

			task.taskId = res.uuid;
		});
	};

	return Logger;
});

