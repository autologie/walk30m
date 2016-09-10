/* eslint-disable import/no-extraneous-dependencies,import/no-unresolved */
import window from 'window';
import _ from 'lodash';
import google from 'google';
import * as GeoUtil from './GeoUtil';
import Calculation from './Calculation';

export default class CalculationService extends google.maps.MVCObject {
  constructor() {
    super();

    this.directionsService = new google.maps.DirectionsService();
    this.isRunning = false;

    this.addListener('error', () => this.stop());
  }

  calcRoute(destination, callback, successiveRateLimitCount) {
    const task = this.currentTask;
    const config = task && task.config;
    const options = config && _.pick(config,
      'origin', 'avoidFerries', 'avoidTolls', 'avoidHighways');

    if (!task) return;

    google.maps.event.trigger(this, 'request', destination);

    /* eslint-disable no-console */
    console.log('CalculationService: do directions request',
      options.origin.toString(), destination.toString());

    this.directionsService.route(_.defaults({
      destination,
      travelMode: google.maps.TravelMode[config.mode],
    }, options), (res, status) => {
      if (status !== google.maps.DirectionsStatus.OVER_QUERY_LIMIT) {
        callback(res, status);
      } else if (successiveRateLimitCount < 3) {
        _.delay(() => {
          this.calcRoute(destination, callback, successiveRateLimitCount + 1);
        }, successiveRateLimitCount * 2000);
      } else {
        google.maps.event.trigger(this, 'warn', 'FREQUENT_OVER_QUERY_LIMIT');
        this.calcRoute(destination, callback, 0);
      }
    });
  }

  calcNext(destination, isNarrowing) {
    const tryDispatch = (res, status) => {
      if (this.isPausing) {
        _.delay(() => tryDispatch(res, status), 100);
      } else {
        this.dispatch(res, status, { destination, isNarrowing });
      }
    };

    if (!destination || _.isNaN(destination.lat()) || _.isNaN(destination.lng())) {
      google.maps.event.trigger(this, 'error', 'NO_DESTINATION');
    }

    this.calcRoute(destination, (res, status) => {
      if (this.isRunning) tryDispatch(res, status);
    }, 0);
  }

  stopMonitorVelocity() {
    const task = this.currentTask;

    if (task.timeout) {
      window.clearInterval(task.timeout);
      delete task.timeout;
    }
  }

  startMonitorVelocity(initialDelay, interval) {
    const task = this.currentTask;

    if (task.timeout) {
      /* eslint-disable no-console */
      console.log('CalculationService: already monitoring', task);
      return;
    }

    task.timeConsumed = 0;
    _.delay(() => {
      task.timeout = window.setInterval(() => {
        if (!this.isRunning) {
          this.stopMonitorVelocity();
          return;
        }

        const velocity = task.getVelocity();

        /* eslint-disable no-console */
        console.log('CalculationService: current velocity: ', velocity);

        if (velocity < 1) {
          google.maps.event.trigger(this, 'warn', 'CALCULATION_IS_GETTING_SLOWER');
        }
      }, interval);
    }, initialDelay);
  }

  start(request) {
    const task = new Calculation(request);
    const origin = request.origin;

    task.addListener('progress', (progress, added, goals) => {
      google.maps.event.trigger(this, 'progress', progress, added, goals);
    });

    this.currentTask = task;
    this.startMonitorVelocity(30000, 1000);

    this.isPausing = false;
    this.isRunning = true;
    this.calcNext(new google.maps.LatLng(
      origin.lat(),
      origin.lng() + GeoUtil.meterToLng(100, origin.lat())
    ));

    google.maps.event.trigger(this, 'start', task);
    return task;
  }

  walkToFillSecondsAlong(sec, wayPoints) {
    function getPartial(step, ratio) {
      const limitedLength = _.reduce(step.lat_lngs, (passed, v, idx, arr) => {
        const isLast = idx === arr.length - 1;

        return passed + (isLast ? 0 : GeoUtil.distance(v, arr[idx + 1]));
      }, 0) * ratio;
      const latLngs = [];
      let len = 0;

      _.each(step.lat_lngs, (pos, idx, arr) => {
        if (idx > 0) {
          len += GeoUtil.distance(pos, arr[idx - 1]);
        }
        if (len <= limitedLength) {
          latLngs.push(pos);
          return true;
        }
        return false;
      });

      return latLngs;
    }

    return _.reduce(wayPoints, (passed, step) => {
      if (passed && passed.endFlag) return passed;

      const nextAccum = (passed ? passed.accum : 0) + step.duration.value;

      return {
        accum: nextAccum,
        endFlag: nextAccum > sec,
        concat_path: ((passed && passed.concat_path) || []).concat(step.lat_lngs),
        lat_lngs: nextAccum > sec
          ? getPartial(step, 1 - ((nextAccum - sec) / step.duration.value))
          : step.lat_lngs,
      };
    }, null);
  }

  stop() {
    if (this.isRunning) {
      this.isRunning = false;
      this.stopMonitorVelocity();
      delete this.currentTask;
    }
  }

  pause() {
    const me = this;

    me.isPausing = true;
    me.currentTask.pauseStarted = new Date();
  }

  resume() {
    const task = this.currentTask;

    this.isPausing = false;

    if (task && task.pauseStarted) {
      task.pauseTime = task.pauseTime || 0;
      task.pauseTime += (new Date() - task.pauseStarted);
    }
  }

  willBeCompletedWith(wayPoint) {
    const me = this;

    return me.currentTask.isComplete(me.currentTask.getGoals().concat(wayPoint));
  }

  getAdvancedOne(task, p1, p2) {
    const origin = task.config.origin;

    return GeoUtil.calcAngle(origin, p1) <= GeoUtil.calcAngle(origin, p2)
      ? p2
      : p1;
  }

  dispatch(response, status, request) {
    const dest = request.destination;
    const task = this.currentTask;
    const sec = task.config.time;
    const center = task.config.origin;
    const anglePerStep = task.config.anglePerStep;
    let leg = null;
    let lastWayPoint = null;
    let step = null;
    let nextDest = null;

    if (status === google.maps.DirectionsStatus.ZERO_RESULTS) {
      nextDest = GeoUtil.divide(center, dest, 0.8);
      this.calcNext(nextDest, true);
    } else if (status !== google.maps.DirectionsStatus.OK) {
      google.maps.event.trigger(this, 'error', status);
    } else {
      leg = response.routes[0].legs[0];

      if (leg.duration.value > sec * 1.2) {
        nextDest = GeoUtil.divide(center, dest, 0.8);
        this.calcNext(nextDest, true);
      } else if (!request.isNarrowing && leg.duration.value < sec) {
        nextDest = GeoUtil.divide(center, dest, Math.max(1.1, sec / leg.duration.value));

        if (this.getAdvancedOne(task, dest, nextDest) === dest) {
          nextDest = GeoUtil.rotate(center, nextDest, anglePerStep);
        }
        this.calcNext(nextDest);
      } else {
        step = this.walkToFillSecondsAlong(sec, leg.steps);

        if (!step) {
          google.maps.event.trigger(this, 'error');
        } else {
          lastWayPoint = step.lat_lngs[step.lat_lngs.length - 1];

          if (task.hasVisited(lastWayPoint)) {
            nextDest = GeoUtil.divide(center, GeoUtil.rotate(center, dest, 3), 0.8);
            this.calcNext(nextDest, true);
          } else if (this.willBeCompletedWith(lastWayPoint)) {
            this.isRunning = false;
            google.maps.event.trigger(this, 'complete', task.vertices, task);
          } else {
            const advanced = this.getAdvancedOne(task, lastWayPoint, dest);

            task.vertices.push({
              endLocation: lastWayPoint,
              step,
              directionResult: response,
            });
            nextDest = GeoUtil.rotate(center, advanced, anglePerStep);
            this.calcNext(nextDest);
          }
        }
      }
    }
  }
}
