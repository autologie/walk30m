'use strict';

define([
  'window',
  'lodash',
  'google',
  './Calculation.js',
  './GeoUtil',
], function (window, _, google, Calculation, GeoUtil) {
  function CalculationService() {
    const me = this;

    me.directionsService = new google.maps.DirectionsService();
    me.isRunning = false;

    me.addListener('error', _.bind(me.stop, me));
  }

  CalculationService.prototype = new google.maps.MVCObject();

  CalculationService.prototype.calcRoute = function (dest, callback, successiveRateLimitCount) {
    let me = this,
      task = me.currentTask,
      config, options;

    if (!task) {
      return;
    }

    config = task.config;
    options = _.pick(config, 'origin', 'avoidFerries', 'avoidTolls', 'avoidHighways');

    google.maps.event.trigger(me, 'request', dest);
    console.log('CalculationService: do directions request', options.origin.toString(), dest.toString());

    me.directionsService.route(_.defaults({
      destination: dest,
      travelMode: google.maps.TravelMode[config.mode],
    }, options), function (res, status) {
      if (status !== google.maps.DirectionsStatus.OVER_QUERY_LIMIT) {
        callback(res, status);
      } else if (successiveRateLimitCount < 3) {
        _.delay(function () {
          me.calcRoute(dest, callback, ++successiveRateLimitCount);
        }, successiveRateLimitCount * 2000);
      } else {
        google.maps.event.trigger(me, 'warn', 'FREQUENT_OVER_QUERY_LIMIT');
        me.calcRoute(dest, callback, 0);
      }
    });
  };

  CalculationService.prototype.calcNext = function (dest, isNarrowing) {
    const me = this;

    function tryDispatch(res, status) {
      if (me.isPausing) {
        _.delay(function () { tryDispatch(res, status); }, 100);
      } else {
        me.dispatch(res, status, {
          destination: dest,
          isNarrowing,
        });
      }
    }

    if (!dest || _.isNaN(dest.lat()) || _.isNaN(dest.lng())) {
      google.maps.event.trigger(me, 'error', 'NO_DESTINATION');
    }

    me.calcRoute(dest, function (res, status) {
      if (me.isRunning) {
        tryDispatch(res, status);
      }
    }, 0);
  };

  CalculationService.prototype.stopMonitorVelocity = function (task) {
    if (task.timeout) {
      window.clearInterval(task.timeout);
      delete task.timeout;
    }
  };

  CalculationService.prototype.startMonitorVelocity = function (task, initialDelay, interval) {
    const me = this;

    if (task.timeout) {
      console.log('CalculationService: already monitoring', task);
      return;
    }

    task.timeConsumed = 0;
    _.delay(function () {
      task.timeout = window.setInterval(function () {
        if (!me.isRunning) {
          me.stopMonitorVelocity(task);
          return;
        }

        const velocity = task.getVelocity();

        console.log('CalculationService: current velocity: ', velocity);

        if (velocity < 1) {
          google.maps.event.trigger(me, 'warn', 'CALCULATION_IS_GETTING_SLOWER');
        }
      }, interval);
    }, initialDelay);
  };

  CalculationService.prototype.start = function (request) {
    let me = this,
      task = new Calculation(request),
      origin = request.origin;

    task.addListener('progress', function (progress, added, goals) {
      google.maps.event.trigger(me, 'progress', progress, added, goals);
    });

    me.startMonitorVelocity(task, 30000, 1000);

    me.currentTask = task;
    me.isPausing = false;
    me.isRunning = true;
    me.calcNext(new google.maps.LatLng(
      origin.lat(),
      origin.lng() + GeoUtil.meterToLng(100, origin.lat())
    ));

    google.maps.event.trigger(me, 'start', task);
    return task;
  };

  CalculationService.prototype.walkToFillSecondsAlong = function (sec, wayPoints) {
    function getPartial(step, ratio) {
      let len = 0, lat_lngs = [],
        limited_length = _.reduce(step.lat_lngs, function (passed, v, idx, arr) {
          return idx === arr.length - 1 ? passed : passed + GeoUtil.distance(v, arr[idx + 1]);
        }, 0) * ratio;

      _.each(step.lat_lngs, function (pos, idx, arr) {
        if (idx === 0 || (len += GeoUtil.distance(pos, arr[idx - 1])) <= limited_length) {
          lat_lngs.push(pos);
        } else {
          return false;
        }
      });
      return lat_lngs;
    }

    return _.reduce(wayPoints, function (passed, step) {
      let next_accum;

      if (passed && passed.end_flag) {
        return passed;
      } else {
        next_accum = (passed ? passed.accum : 0) + step.duration.value;
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

  CalculationService.prototype.stop = function () {
    const me = this;

    if (me.isRunning) {
      me.isRunning = false;
      me.stopMonitorVelocity(me.currentTask);
      delete me.currentTask;
    }
  };

  CalculationService.prototype.pause = function () {
    const me = this;

    me.isPausing = true;
    me.currentTask.pauseStarted = new Date();
  };

  CalculationService.prototype.resume = function () {
    let me = this,
      task = me.currentTask;

    me.isPausing = false;
    if (task && task.pauseStarted) {
      task.pauseTime = task.pauseTime || 0;
      task.pauseTime += (new Date() - task.pauseStarted);
    }
  };

  CalculationService.prototype.willBeCompletedWith = function (wayPoint) {
    const me = this;

    return me.currentTask.isComplete(me.currentTask.getGoals().concat(wayPoint));
  };

  CalculationService.prototype.getAdvancedOne = function (task, p1, p2) {
    const origin = task.config.origin;

    return GeoUtil.calcAngle(origin, p1) <= GeoUtil.calcAngle(origin, p2)
      ? p2
      : p1;
  };

  CalculationService.prototype.dispatch = function (response, status, request) {
    let leg, lastWayPoint, step,
      me = this,
      dest = request.destination,
      task = me.currentTask,
      sec = task.config.time,
      center = task.config.origin,
      anglePerStep = task.config.anglePerStep,
      nextDest;

    if (status === google.maps.DirectionsStatus.ZERO_RESULTS) {
      nextDest = GeoUtil.divide(center, dest, 0.8);
      me.calcNext(nextDest, true);
    } else if (status !== google.maps.DirectionsStatus.OK) {
      google.maps.event.trigger(me, 'error', status);
    } else {
      leg = response.routes[0].legs[0];

      if (leg.duration.value > sec * 1.2) {
        nextDest = GeoUtil.divide(center, dest, 0.8);
        me.calcNext(nextDest, true);
      } else if (!request.isNarrowing && leg.duration.value < sec) {
        nextDest = GeoUtil.divide(center, dest, Math.max(1.1, sec / leg.duration.value));

        if (me.getAdvancedOne(task, dest, nextDest) === dest) {
          nextDest = GeoUtil.rotate(center, nextDest, anglePerStep);
        }
        me.calcNext(nextDest);
      } else if (step = me.walkToFillSecondsAlong(sec, leg.steps)) {
        lastWayPoint = step.lat_lngs[step.lat_lngs.length - 1];

        if (task.hasVisited(lastWayPoint)) {
          nextDest = GeoUtil.divide(center, GeoUtil.rotate(center, dest, 3), 0.8);
          me.calcNext(nextDest, true);
        } else if (me.willBeCompletedWith(lastWayPoint)) {
          me.isRunning = false;
          google.maps.event.trigger(me, 'complete', task.vertices, task);
        } else {
          task.vertices.push({
            endLocation: lastWayPoint,
            step,
            directionResult: response,
          });
          nextDest = GeoUtil.rotate(center, me.getAdvancedOne(task, lastWayPoint, dest), anglePerStep);
          me.calcNext(nextDest);
        }
      } else {
        google.maps.event.trigger(me, 'error');
      }
    }
  };

  return CalculationService;
});
