define([
], function() {
	'use strict';

	function OM(map) {
		var me = this;

		google.maps.MVCArray.constructor.call(me);
		me.map = map;
		me.addListener('remove_at', function(idx, elem) {
			if (elem[0].setMap) {
				elem[0].setMap(null);
			} else if (elem.close) {
				elem[0].close();
			} else {
				throw new Error('cannot destroy item', elem);
			}
		});

		me.addListener('insert_at', function(idx) {
			var elem = me.getArray()[idx],
				obj = elem[0],
				cls = elem[1],
				id = elem[2],
				marker;

			if (obj.open) {
				obj.open(me.map);
			} else {
				obj.setMap(me.map);
			}
		});
	}

	OM.prototype = new google.maps.MVCArray();

	OM.prototype.clearObject = function(id) {
		var me = this;

		if (!id) {
			return;
		}

		me.forEach(function(elem, idx) {
			if (elem[2] === id) {
				me.removeAt(idx);
				return false;
			}
		});
	};

	OM.prototype.clearObjects = function(taggedAs) {
		var me = this,
			toRemove = [];
		
		me.forEach(function(elem, idx) {
			if (elem && (taggedAs === undefined || elem[1] === taggedAs)) {
				toRemove.push(idx);
			}
		});

		for (var i = toRemove.length; i > 0; --i) {
			me.removeAt(i - 1) ;
		}
	};

	OM.prototype.findObject = function(id) {
		var me = this;
		
		return me.getArray().filter(function(elem) {
			return elem[2] === id;
		}).pop();
	};

	OM.prototype.showObject = function(obj, cls, id) {
		var me = this;
		
		me.clearObject(id);
		me.push([ obj, cls, id ]);
		return obj;
	};

	return OM;
});

