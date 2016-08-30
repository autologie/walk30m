import window from 'window';
import _ from 'lodash';
import $ from 'jQuery';
import { PUBLIC_API_URL_BASE } from './config';

const endPoint = `${PUBLIC_API_URL_BASE}/execution_log/`;

class Logger {

  constructor(calcService) {
    this.calcService = calcService;
    this.executions = {};

    calcService.addListener('start', _.bind(this.onStart, this));
    calcService.addListener('complete', _.bind(this.onComplete, this));
  }

  onComplete(vertices, task) {
    const taskId = task.taskId;

    $.ajax({
      url: endPoint + taskId,
      type: 'PUT',
      dataType: 'json',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(_.defaults({
        complete_datetime: new Date().toISOString(),
        result_path: _.map(_.map(vertices.getArray(), 'endLocation'), (latLng) => ({
          lat: latLng.lat(),
          lng: latLng.lng(),
        })),
      }, this.executions[taskId])),
    });
  }

  collectClientInfo() {
    const $win = $(window);

    return {
      url: window.location.href,
      viewport: {
        width: $win.width(),
        height: $win.height(),
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

    $.ajax({
      url: endPoint,
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(data),
    }).done((res) => {
      this.executions[res.uuid] = data;

      task.taskId = res.uuid;
    });
  }
}

module.exports = Logger;

