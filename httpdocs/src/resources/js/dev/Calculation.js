define([
	'./GeoUtil'
], function(GeoUtil) {
	'use strict';
	var twicePI = 2 * Math.PI,
		halfPI = Math.PI / 2;

	function Calculation(request) {
		var me = this;

		me.config = request;
		me.consumedTime = 0;
		me.vertices = new google.maps.MVCArray();
		
		me.vertices.addListener('insert_at', function(n) {
			var added = me.vertices.getAt(n);
			
			google.maps.event.trigger(me, 'progress', me.getProgress(), added, me.getGoals());
		});
	}

	Calculation.prototype = new google.maps.MVCObject();

	Calculation.prototype.getGoals = function() {
		return _.collect(this.vertices.getArray(), 'endLocation');
	};

	Calculation.prototype.getProgress = function() {
		var me = this;

		return Math.round(100 * me.accumulateAngles(me.getGoals()) / twicePI);
	};

	Calculation.prototype.getVelocity = function() {
		var me = this;

		return 1000 * me.getProgress() / me.consumedTime;
	}

	Calculation.prototype.isComplete = function(vertices) {
		var me = this;

		return me.accumulateAngles(vertices || me.getGoals()) >= twicePI;
	};

	Calculation.prototype.hasVisited = function(location) {
		var me = this,
			sameLocation = function(v) {
				return GeoUtil.distance(v.endLocation, location) < 0.0005;
			};
			
			return _.some(me.vertices.getArray(), sameLocation);
	};

	Calculation.prototype.accumulateAngles = function(vertices) {
		var me = this,
			checked = 0,
			diff,
			angles = _.map(vertices, function(v) {
				return GeoUtil.calcAngle(me.config.origin, v);
			});
			
		return _.reduce(angles, function(passed, angle, idx, arr) {
			return passed + (idx > 0? ((diff = angle - arr[idx - 1]) < -1 * Math.PI? (diff + twicePI): diff): 0);
		}, 0);
	};

	return Calculation;
});

