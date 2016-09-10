/* eslint-disable import/no-extraneous-dependencies,import/no-unresolved */
import _ from 'lodash';
import google from 'google';
import * as GeoUtil from './GeoUtil';

const twicePI = 2 * Math.PI;

export default class Calculation extends google.maps.MVCObject {
  constructor(request) {
    super();

    this.config = request;
    this.startTime = new Date();
    this.pauseTime = 0;
    this.vertices = new google.maps.MVCArray();

    this.vertices.addListener('insert_at', n => {
      const added = this.vertices.getAt(n);

      google.maps.event.trigger(this, 'progress', this.getProgress(), added, this.getGoals());
    });
  }

  getGoals() {
    return _.map(this.vertices.getArray(), 'endLocation');
  }

  getProgress() {
    return Math.round((100 * this.accumulateAngles(this.getGoals())) / twicePI);
  }

  getVelocity() {
    const progress = this.getProgress();
    const consumedTime = new Date() - this.startTime - this.pauseTime;

    return progress === 0 ? 0 : (1000 * progress) / consumedTime;
  }

  isComplete(vertices) {
    return this.accumulateAngles(vertices || this.getGoals()) >= twicePI;
  }

  hasVisited(location) {
    const sameLocation = v => GeoUtil.distance(v.endLocation, location) < 0.0005;

    return _.some(this.vertices.getArray(), sameLocation);
  }

  accumulateAngles(vertices) {
    const angles = _.map(vertices, v => GeoUtil.calcAngle(this.config.origin, v));

    return _.reduce(angles, ({ accum, diff, prev }, angle) => {
      let angleToAdd = 0;

      if (prev === undefined) {
        angleToAdd = 0;
      } else {
        angleToAdd = prev - angle > Math.PI ? (diff + twicePI) : diff;
      }

      return { accum: accum + angleToAdd, diff: angleToAdd, prev: angle };
    }, { accum: 0, diff: 0, prev: undefined }).accum;
  }

  serialize() {
    return {
      config: _.defaults({
        origin: GeoUtil.latLngToLiteral(this.config.origin),
      }, this.config),
    };
  }
}
