'use strict';
define([
  'window',
  'lodash',
  'jQuery'
], function(window, _, $) {
  var endPoint = PUBLIC_API_URL_BASE + '/execution_log/';

  function Logger(calcService) {
    var me = this;

    me.calcService = calcService;
    me.executions = {};

    calcService.addListener('start', _.bind(me.onStart, me));
    calcService.addListener('complete', _.bind(me.onComplete, me));
  }

  Logger.prototype.onComplete = function(vertices, task) {
    var me = this,
      taskId = task.taskId;

    $.ajax({
      url: endPoint + taskId,
      type: 'PUT',
      dataType: 'json',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(_.defaults({
        complete_datetime: new Date().toISOString(),
        result_path: _.map(_.map(vertices.getArray(), 'endLocation'), function(latLng) {
          return { lat: latLng.lat(), lng: latLng.lng() };
        })
      }, me.executions[taskId]))
    });
  };

  Logger.prototype.collectClientInfo = function() {
    var $win = $(window);

    return {
      url: window.location.href,
      viewport: {
        width: $win.width(),
        height: $win.height()
      }
    };
  };

  Logger.prototype.onStart = function(task) {
    var me = this,
      data = _.mapKeys(_.defaults({
        startDatetime: new Date().toISOString(),
        isInitial: false
      }, _.mapValues(_.omit(task.config, 'address'), function(val, key) {
        return key === 'origin'
          ? {
            address: task.config.address,
            lat: val.lat(),
            lng: val.lng()
          }
          : val;
      }), me.collectClientInfo()), function(value, key) {
        return _.snakeCase(key);
      });

    $.ajax({
      url: endPoint,
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(data)
    }).done(function(res) {
      me.executions[res.uuid] = data;

      task.taskId = res.uuid;
    });
  };

  return Logger;
});

