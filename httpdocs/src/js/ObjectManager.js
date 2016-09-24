import _ from 'lodash';
import google from 'google';

function OM(map) {
  const me = this;

  google.maps.MVCArray.constructor.call(me);
  me.map = map;
  me.addListener('remove_at', function (idx, elem) {
    if (elem[0].setMap) {
      elem[0].setMap(null);
    } else if (elem.close) {
      elem[0].close();
    } else {
      throw new Error('cannot destroy item', elem);
    }
  });

  me.addListener('insert_at', function (idx) {
    let elem = me.getArray()[idx],
      obj = elem[0];

    if (obj.open) {
      if (elem[3] instanceof google.maps.MVCObject) {
        obj.open(me.map, elem[3]);
      } else {
        obj.open(me.map);
      }
    } else {
      obj.setMap(me.map);
    }
  });
}

OM.prototype = new google.maps.MVCArray();

OM.prototype.clearObject = function (id) {
  const me = this;

  if (!id) {
    return;
  }

  me.forEach(function (elem, idx) {
    if (elem && elem[2] === id) {
      me.removeAt(idx);
      return false;
    }
  });
};

OM.prototype.clearObjects = function (taggedAs) {
  const me = this;

  me.forEach(function (elem, idx) {
    if (elem && (taggedAs === undefined || elem[1] === taggedAs)) {
      me.removeAt(idx);
      _.defer(function () {
        me.clearObjects(taggedAs);
      });
      return false;
    }
  });
};

OM.prototype.findObject = function (id) {
  const me = this;

  return me.getArray().filter(function (elem) {
    return elem[2] === id;
  }).pop();
};

OM.prototype.showObject = function (obj, cls, id, options) {
  const me = this;

  me.clearObject(id);
  me.push([obj, cls, id, options]);
  return obj;
};

export default OM;
