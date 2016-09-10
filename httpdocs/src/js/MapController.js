import window from 'window';
import _ from 'lodash';
import google from 'google';
import GeoUtils from './GeoUtil.js';
import Footprint from './Footprint.js';
import ObjectManager from './ObjectManager.js';
import ResultVisualizer from './ResultVisualizer.js';

class MapController {

  constructor(application, $el, mapOptions) {
    this.$el = $el;
    this.application = application;
    this.$centerMarker = $el.find('.center-marker');
    this.$message = $el.find('.message');
    this.$determineBtn = $el.find('.btn[role=determine-location]');
    this.$retryBtn = $el.find('.btn[role=retry]');
    this.$cancelBtn = $el.find('.btn[role=cancel]');
    this.map = this.initMap(mapOptions);
    this.footprint = new Footprint({
      map: this.map,
      angle: 90,
    });
    this.objectManager = new ObjectManager(this.map);
    this.resultVisualizer = new ResultVisualizer(application, this.map, this.objectManager);
  }

  initMap(options) {
    window.console.log('google map: initializing google map...');

    const map = new google.maps.Map(this.$el.find('#map-canvas').get(0), _.defaults(options || {}, {
      center: new google.maps.LatLng(36, 140),
      zoom: 13,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER,
      },
      streetViewControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER,
      },
    }));

    map.addListener('tileloaded', () => window.console.log('google map: tile loaded.'));

    return map;
  }

  hideMessage() {
    this.$message.fadeOut();
  }

  showMessage(message) {
    this.$message.text(message).fadeIn();
  }

  getMap() { return this.map; }

  startCalculation(calcService, onExit) {
    const me = this;
    const calcMsgTpl = _.template(this.application.getMessage('searching'));
    const request = calcService.currentTask.config;
    const listeners = [];

    function doExit(isCompleted) {
      if (isCompleted) {
        me.resultVisualizer.clearResultDetail();
      }
      me.objectManager.clearObject('inProgress');
      me.$retryBtn.hide();
      me.hideMessage();
      me.footprint.setMap(null);
      listeners.forEach((listener) => google.maps.event.removeListener(listener));
      onExit(isCompleted);
    }

    function onClickRetryBtn() {
      if (!calcService.isRunning) {
        doExit(true);
      } else {
        calcService.pause();
        if (window.confirm(me.application.getMessage('askIfAbort'))) {
          doExit(false);
        } else {
          calcService.resume();
          me.$retryBtn.off().one('click', onClickRetryBtn);
        }
      }
    }

    this.resultVisualizer.clearResultDetail();
    this.showMessage(calcMsgTpl(_.defaults({
      min: request.time / 60,
      travelModeExpr: this.application.getMessage('travelModes')[request.mode],
    }, request)));
    this.$retryBtn.show();
    this.$retryBtn.off().one('click', onClickRetryBtn);

    this.footprint.startFrom(request.origin);

    listeners.push(calcService.addListener('progress',
      _.once(_.bind(this.onInitialProgress, this, calcService))));
    listeners.push(calcService.addListener('progress',
      _.bind(this.onProgress, this, calcService)));
    listeners.push(calcService.addListener('complete',
      _.bind(this.onComplete, this, calcService)));

    this.map.panTo(request.origin);
  }

  onComplete(calcService, vertices, task) {
    this.objectManager.clearObject('inProgress');
    this.footprint.stop();
    this.showMessage(this.application.getMessage('completed'));
    _.delay(() => {
      this.hideMessage();
      this.footprint.setMap(null);
      this.resultVisualizer.addResult(task);
    }, 1000);
  }

  onProgress(calcService, percent, added, endLocations) {
    this.footprint.setAngle(90 - ((percent * 360) / 100) - 30);
    this.drawArea(endLocations, calcService.currentTask.config.origin);
  }

  onInitialProgress(calcService, percent, added) {
    const center = calcService.currentTask.config.origin;
    const latDiff = Math.abs(center.lat() - added.endLocation.lat());
    const lngDiff = Math.abs(center.lng() - added.endLocation.lng());

    this.map.fitBounds({
      north: center.lat() + latDiff,
      south: center.lat() - latDiff,
      east: center.lng() + lngDiff,
      west: center.lng() - lngDiff,
    });
    this.map.setZoom(this.map.getZoom() - 1);
  }

  drawArea(vertices, origin) {
    const toSpline = vertices
        .concat([origin])
        .concat(vertices.slice(0).splice(0, Math.round(vertices.length / 2)));
    const splined = GeoUtils.spline(toSpline);

    this.objectManager.showObject(new google.maps.Polygon({
      path: splined.splice(0, Math.round((splined.length * 2) / 3) - 2),
      // strokeColor: '#080',
      fillColor: '#080',
      clickable: false,
      // strokeOpacity: 0.7,
      strokeWeight: 0,
      fillOpacity: 0.3,
      zIndex: 100,
    }), null, 'inProgress');
  }

  startView(callback) {
    this.$retryBtn.show();
    this.$retryBtn.off().one('click', () => {
      this.resultVisualizer.clearResultDetail();
      this.$retryBtn.hide();
      callback();
    });
  }

  finalize(dragStartListener, callback = _.noop) {
    this.$centerMarker.hide();
    this.$determineBtn.hide();
    this.$cancelBtn.hide();
    google.maps.event.removeListener(dragStartListener);
    this.hideMessage();
    callback();
  }

  specifyLocation(callback) {
    this.$centerMarker.show();
    this.$determineBtn.show();
    this.$cancelBtn.show();
    this.showMessage(this.application.getMessage('dragMapToSpecifyLocation'));

    const dragStartListener = google.maps.event.addListenerOnce(
      this.map,
      'dragstart',
      () => this.hideMessage()
    );

    this.$cancelBtn.off().one('click',
      () => this.finalize(dragStartListener, callback)
    );
    this.$determineBtn.off().one('click',
      () => this.finalize(dragStartListener,
      () => callback(this.map.getCenter()))
    );
  }
}

module.exports = MapController;

