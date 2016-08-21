(function(window, document, $, _, google, numeric) {
'use strict';

function spline(path) {
	var coords = _.map(path.concat(path[0]), function(s) {
		return [ s.lat(), s.lng() ];
	}),
	points = _.range(0, path.length),
	samples = _.range(0, path.length, 0.1);
	
	return _.map(numeric.spline(points, coords).at(samples), function(s) {
		return new google.maps.LatLng(s[0], s[1]);
	});
}

function OM(map) {
	this.map = map;
	this.hash = {};
	this.mapObjects = [];
}

OM.prototype.getPgColor = function() {
	var mapTypeId = this.map.getMapTypeId();
	
	return mapTypeId === google.maps.MapTypeId.ROADMAP
		? '#080'
		: '#f80';
};

OM.prototype.clearObject = function(id) {
	var me = this,
		target = _.filter(me.mapObjects, function(o) {
			return o[2] === id;
		}).pop();
	
	if (target) {
		me.mapObjects.splice(me.mapObjects.indexOf(target), 1);
	}
};

OM.prototype.clearObjects = function(taggedAs) {
	var me = this,
		targets = _.filter(me.mapObjects, function(o) {
			return taggedAs === undefined || o[1] === taggedAs;
		});
	
	_.each(targets, function(o) {
		me.mapObjects.splice(me.mapObjects.indexOf(o), 1);
		delete me.hash[o[2]];
		if (o[0].setMap) {
			o[0].setMap(null);
		} else if (o.close) {
			o[0].close();
		} else {
			throw new Error('cannot destroy item', o);
		}
	});
};

OM.prototype.drawArea = function(vertices, options) {
	var me = this,
		splined = spline(vertices.concat(vertices.slice(0).splice(0, Math.round(vertices.length / 2)))),
		polygon = me.showObject(new google.maps.Polygon(_.extend({
			path: splined.splice(0, Math.round(splined.length * 2 / 3) - 2),
			strokeColor: me.getPgColor(),
			fillColor: me.getPgColor(),
			clickable: false,
			zIndex: 100
		}, options)), 'result');
	
	google.maps.event.addListener(me.map, 'maptypeid_changed', function() {
		if (polygon.getMap()) {
			polygon.setOptions({
				fillColor: me.getPgColor(),
				strokeColor: me.getPgColor()
			});
		}
	});
};

OM.prototype.findObject = function(id) {
	var me = this;
	
	return me.hash[id];
};

OM.prototype.showObject = function(obj, cls, id) {
	var me = this,
		marker;
	
	if ($('input[name=dev]:checked').val() === 'on' || cls !== 'debug') {
		if (obj.open) {
			marker = obj.marker
				|| me.showObject(new google.maps.Marker({ position: obj.getPosition() }), cls);
			obj.open(me.map, marker);
			google.maps.event.addListener(obj, 'closeclick', function() {
				google.maps.event.addListenerOnce(marker, 'click', function() {
					obj.open(me.map, marker);
				});
			});
		} else {
			obj.setMap(me.map);
		}
	}
	me.mapObjects.push([ obj, cls, id ]);
	me.hash[id] = obj;
	return obj;
};

window.ObjectManager = OM;

})(window, document, $, _, google, numeric);
