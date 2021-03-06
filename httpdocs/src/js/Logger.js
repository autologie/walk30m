import _ from "lodash";
import $ from "jquery";
import { EXECUTION_LOG_API_URL } from "./config";

const endPoint = EXECUTION_LOG_API_URL;

const withRetries = (maxAttempt, process) => {
  const processWithRetries = attemptCount => {
    process().catch(() => {
      if (attemptCount < maxAttempt) {
        console.log("Failed to send execution log. Will retry again.");
        setTimeout(
          () => processWithRetries(attemptCount + 1),
          500 * Math.pow(2, attemptCount)
        );
      } else {
        console.log(
          "Failed to send execution log. Given up after several retries."
        );
      }
    });
  };

  processWithRetries(0);
};

export default class Logger {
  constructor(calcService) {
    this.calcService = calcService;
    this.executions = {};

    calcService.addListener("start", _.bind(this.onStart, this));
    calcService.addListener("complete", _.bind(this.onComplete, this));
  }

  createGaValue(data) {
    return [data.mode, data.time, data.preference].join(",");
  }

  sendGA(action, data, value) {
    if (!window.ga) return;

    window.ga("send", {
      hitType: "event",
      eventCategory: "calculation",
      eventAction: action,
      eventLabel: this.createGaValue(data),
      eventValue: value
    });
  }

  onComplete(vertices, task) {
    const taskId = task.taskId;

    if (!taskId) return;

    const now = new Date();
    const took = +now - +new Date(this.executions[taskId].start_datetime);
    const data = _.defaults(
      {
        complete_datetime: now.toISOString(),
        result_path: _.map(
          _.map(vertices.getArray(), "endLocation"),
          latLng => ({
            lat: latLng.lat(),
            lng: latLng.lng()
          })
        ),
        api_call_stats: task.apiCallStats
      },
      this.executions[taskId]
    );

    withRetries(5, () =>
      $.ajax({
        url: `${endPoint}/${taskId}`,
        type: "PUT",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data)
      })
    );

    this.sendGA("complete", data, took);
  }

  collectClientInfo() {
    const $win = $(window);

    return {
      url: window.location.href,
      viewport: {
        width: $win.width(),
        height: $win.height()
      }
    };
  }

  onStart(task) {
    const data = _.mapKeys(
      _.defaults(
        {
          startDatetime: new Date().toISOString(),
          isInitial: false
        },
        _.mapValues(
          _.omit(task.config, "address"),
          (val, key) =>
            key === "origin"
              ? {
                  address: task.config.address,
                  lat: val.lat(),
                  lng: val.lng()
                }
              : val
        ),
        this.collectClientInfo()
      ),
      (value, key) => _.snakeCase(key)
    );

    withRetries(5, () =>
      $.ajax({
        url: endPoint,
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data)
      }).then(res => {
        this.executions[res.uuid] = data;

        task.taskId = res.uuid;
      })
    );

    this.sendGA("start", data);
  }
}
