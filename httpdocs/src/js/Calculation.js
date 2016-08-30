define([
  'lodash',
  'google',
  './GeoUtil',
], function (_, google, GeoUtil) {
  'use strict';
  let twicePI = 2 * Math.PI,
    halfPI = Math.PI / 2;

  function Calculation(request) {
    const me = this;

    me.config = request;
    me.startTime = new Date();
    me.pauseTime = 0;
    me.vertices = new google.maps.MVCArray();

    me.vertices.addListener('insert_at', function (n) {
      const added = me.vertices.getAt(n);

      google.maps.event.trigger(me, 'progress', me.getProgress(), added, me.getGoals());
    });
  }

  Calculation.prototype = new google.maps.MVCObject();

  Calculation.prototype.getGoals = function () {
    return _.map(this.vertices.getArray(), 'endLocation');
  };

  Calculation.prototype.getProgress = function () {
    const me = this;

    return Math.round(100 * me.accumulateAngles(me.getGoals()) / twicePI);
  };

  Calculation.prototype.getVelocity = function () {
    let me = this,
      progress = me.getProgress(),
      consumedTime = new Date() - me.startTime - me.pauseTime;

    return progress === 0 ? 0 : 1000 * progress / consumedTime;
  };

  Calculation.prototype.isComplete = function (vertices) {
    const me = this;

    return me.accumulateAngles(vertices || me.getGoals()) >= twicePI;
  };

  Calculation.prototype.hasVisited = function (location) {
    let me = this,
      sameLocation = function (v) {
        return GeoUtil.distance(v.endLocation, location) < 0.0005;
      };

    return _.some(me.vertices.getArray(), sameLocation);
  };

  Calculation.prototype.accumulateAngles = function (vertices) {
    let me = this,
      checked = 0,
      diff,
      angles = _.map(vertices, function (v) {
        return GeoUtil.calcAngle(me.config.origin, v);
      });

    return _.reduce(angles, function (passed, angle, idx, arr) {
      return passed + (idx > 0 ? ((diff = angle - arr[idx - 1]) < -1 * Math.PI ? (diff + twicePI) : diff) : 0);
    }, 0);
  };

  Calculation.prototype.serialize = function () {
    const me = this;

    return {
      config: _.defaults({
        origin: GeoUtil.latLngToLiteral(me.config.origin),
      }, me.config),
    };
  };

  return Calculation;
});

