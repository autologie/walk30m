import request from 'superagent';
import _ from 'lodash';
import { PUBLIC_API_URL_BASE } from './config';

const endPoint = 'dummy'; //`${PUBLIC_API_URL_BASE}/execution_log/`;

export default class Logger {

  constructor(calcService) {
    this.calcService = calcService;
    this.executions = {};

    calcService.addListener('start', _.bind(this.onStart, this));
    calcService.addListener('complete', _.bind(this.onComplete, this));
  }

  createGaValue(data) {
    return [
      data.mode,
      data.time,
      data.preference,
    ].join(',');
  }

  sendGA(action, data, value) {
    if (!window.ga) return;

    window.ga('send', {
      hitType: 'event',
      eventCategory: 'calculation',
      eventAction: action,
      eventLabel: this.createGaValue(data),
      eventValue: value,
    });
  }

  onComplete(vertices, task) {
    const taskId = task.taskId;
    const now = new Date();
    const took = +now - +new Date(this.executions[taskId].start_datetime);
    const data = _.defaults({
      complete_datetime: now.toISOString(),
      result_path: _.map(_.map(vertices.getArray(), 'endLocation'), (latLng) => ({
        lat: latLng.lat(),
        lng: latLng.lng(),
      })),
    }, this.executions[taskId]);

    this.sendGA('complete', data, took);
    request
      .put(endPoint + taskId)
      .set('Content-Type', 'application/json; charset=utf-8')
      .send(data)
      .end();
  }

  collectClientInfo() {
    return {
      url: window.location.href,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };
  }

  onStart(task) {
    const data = _.mapKeys(_.defaults({
      startDatetime: new Date().toISOString(),
      isInitial: false,
    }, _.mapValues(_.omit(task.config, 'address'), (val, key) => (key === 'origin' ? {
      address: task.config.address,
      lat: val.lat(),
      lng: val.lng(),
    } : val)), this.collectClientInfo()), (value, key) => _.snakeCase(key));

    this.sendGA('start', data);
    request
      .post(endPoint)
      .set('Content-Type', 'application/json; charset=utf-8')
      .send(data)
      .end();
  }
}
