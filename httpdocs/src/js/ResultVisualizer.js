/* eslint-disable import/no-extraneous-dependencies,import/no-unresolved */
import window from 'window';
import $ from 'jquery';
import _ from 'lodash';
import google from 'google';
import * as GeoUtil from './GeoUtil';
import Walk30mUtils from './Walk30mUtils';
import Footprint from './Footprint';

export default class ResultVisualizer {
  constructor(application, map, objectManager) {
    const me = this;
    const defaultStyler = map.data.getStyle();

    me.colors = [
      'hsl(180, 50%, 33%)',
      'hsl(120, 50%, 33%)',
      'hsl(0, 50%, 33%)',
      'hsl(240, 50%, 33%)',
      'hsl(300, 50%, 33%)',
      'hsl(60, 50%, 33%)',
    ];
    me.application = application;
    me.map = map;
    me.objectManager = objectManager;
    me.twitterURITpl = _.template('https://twitter.com/intent/tweet?text=<%= message %>&url=<%= url %>&hashtags=walk30m');
    me.routeLinkTpl = _.template('https://www.google.co.jp/maps/dir/<%= originLat %>,<%= originLng %>/<%= destLat %>,<%= destLng %>');
    me.balloonTpl = _.template(application.getMessage('routeDetailBalloonTpl'));
    me.overviewBalloonTpl = _.template(application.getMessage('resultOverviewBalloonTpl'));
    me.summaryBalloonTpl = _.template(application.getMessage('resultSummaryBalloonTpl'));

    me.map.data.addListener('click', _.bind(me.onClickResult, me));

    me.map.data.setStyle(feature => {
      if (feature.getProperty('isResult') === true) {
        const color = feature.getProperty('color');

        return {
          strokeColor: color,
          fillColor: color,
          strokeOpacity: 1,
          strokeWeight: 2,
          fillOpacity: 0.3,
        };
      } else if (_.isObject(defaultStyler)) {
        return defaultStyler;
      } else if (_.isFunction(defaultStyler)) {
        return defaultStyler(feature);
      }
      return {};
    });
  }

  createRouteLink(route) {
    const path = route.overview_path;

    return this.routeLinkTpl({
      originLat: _.first(path).lat(),
      originLng: _.first(path).lng(),
      destLat: _.last(path).lat(),
      destLng: _.last(path).lng(),
    });
  }

  createDetailedBalloonContent(directionResult) {
    const route = directionResult.routes[0];
    const firstLeg = route.legs[0];

    return this.balloonTpl({
      dest: GeoUtil.trimGeocoderAddress(firstLeg.end_address),
      time: firstLeg.duration.text,
      url: this.createRouteLink(route),
      summary: route.summary,
      copyright: route.copyrights,
    });
  }

  clearResultDetail() {
    const me = this;

    me.objectManager.clearObjects('routeHilight');
    me.objectManager.clearObjects('route');
    me.objectManager.clearObject('summaryBalloon');
  }

  onClickRoute(feature, route, directionResult) {
    const om = this.objectManager;
    const cls = 'routeHilight';
    const color = (feature.getProperty('color') || '').replace('50%, 33%', '60%, 50%');
    const iw = new google.maps.InfoWindow({
      position: _.max(route.slice(route.length / 4), latLng => latLng.lat()),
      content: this.createDetailedBalloonContent(directionResult),
      maxWidth: Math.min(0.6 * $(window).width(), 320),
    });

    om.clearObjects(cls);
    iw.addListener('domready', () => {
      $(this.map.getDiv()).find('a[role=back-to-summary]').click(_.bind(this.onClickResult, this, {
        feature,
      }));
    });

    _.delay(() => {
      om.showObject(iw, cls, 'routeBalloon');
      om.showObject(this.createCircle({
        icon: {
          strokeColor: color,
          scale: 8,
          strokeWeight: 4,
        },
        position: route[route.length - 1],
        zIndex: 40,
      }), cls);
      om.showObject(new google.maps.Polyline({
        path: route,
        clickable: false,
        strokeColor: color,
        strokeWeight: 4,
        strokeOpacity: 1,
        zIndex: 25,
      }), cls);
      iw.addListener('closeclick', () => om.clearObjects(cls));
    }, 200);
  }

  createCircle(options) {
    return new google.maps.Marker(_.defaults(options, {
      icon: _.defaults(options.icon || {}, {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 4,
        strokeWeight: 2,
        fillColor: '#fff',
        fillOpacity: 1,
      }),
      zIndex: 30,
    }));
  }

  drawRoute(feature, route, directionResult) {
    const cls = 'route';
    const om = this.objectManager;
    const routePolygon = om.showObject(new google.maps.Polyline({
      path: route,
      clickable: false,
      strokeColor: feature.getProperty('color'),
      strokeWeight: 2,
      strokeOpacity: 1,
      zIndex: 20,
    }), cls);
    const endPoint = om.showObject(this.createCircle({
      icon: { strokeColor: feature.getProperty('color') },
      position: route[route.length - 1],
    }), cls);

    routePolygon.addListener('click', () => this.onClickRoute(feature, route, directionResult));
    endPoint.addListener('click', () => this.onClickRoute(feature, route, directionResult));
  }

  showResultDetail(feature) {
    const me = this;

    feature.getProperty('vertices').forEach(vertex => {
      me.drawRoute(feature, vertex.directionResult.routes[0].overview_path, vertex.directionResult);
    });
  }

  createSummary(feature) {
    const options = feature.getProperty('config');
    const color = feature.getProperty('color');
    const tpl = feature.getId() !== 'viewonly' ? this.overviewBalloonTpl : this.summaryBalloonTpl;

    return tpl(Object.assign({
      borderColor: color,
      bgColor: (color || '').replace('hsl', 'hsla').replace(')', ', .5)'),
    }, Walk30mUtils.createSummary(options)));
  }

  bindSummaryBalloonEvents(feature) {
    const om = this.objectManager;
    const msg = _.bind(this.application.getMessage, this.application);
    const options = feature.getProperty('config');
    const summary = Walk30mUtils.createSummary(_.defaults({
      travelModeExpr: msg('travelModes')[options.mode],
    }, options));
    const $balloon = $(this.map.getDiv()).find('.gm-style-iw');

    $balloon.find('a[role=tweet-result]').click(() => {
      const url = this.twitterURITpl({
        url: window.encodeURIComponent(Walk30mUtils.createSharedURI(feature)),
        message: window.encodeURIComponent(_.template(msg('tweetMessageTpl'))(summary)),
      });

      window.open(url, '_blank');
    });
    $balloon.find('a[role=report-problem]').click(() => {
      this.application.startEditMessage(_.template(msg('reportMessageTpl'))({
        summary: _.template(msg('summaryTpl'))(summary),
      }), feature.getId());
    });
    $balloon.find('a[role=erase-result]').click(() => {
      this.map.data.remove(feature);
      om.clearObject('summaryBalloon');
      om.clearObject(`origin-${feature.getId()}`);
    });
    $balloon.find('a[role=show-routes]').click(() => {
      om.clearObject('summaryBalloon');
      feature.setProperty('detailed', true);
      this.showResultDetail(feature);
    });
  }

  showSummaryBalloon(feature) {
    const om = this.objectManager;
    const iw = new google.maps.InfoWindow({
      maxWidth: Math.min(0.6 * $(window).width(), 320),
    });
    const marker = (om.findObject(`origin-${feature.getId()}`) || {})[0];

    iw.setContent(this.createSummary(feature));
    iw.addListener('domready', () => this.bindSummaryBalloonEvents(feature));
    om.showObject(iw, null, 'summaryBalloon', marker);
  }

  onClickResult({ feature }) {
    this.clearResultDetail();

    if (feature.getProperty('detailed')) {
      feature.setProperty('detailed', false);
    }
    this.showSummaryBalloon(feature);
  }

  addResult(result) {
    const me = this;
    const vertices = _.map(result.vertices.getArray(), 'endLocation');
    const toSpline = vertices.concat(vertices.slice(0).splice(0, Math.round(vertices.length / 2)));
    const toGeoJsonCoord = coord => ([coord.lng(), coord.lat()]);
    const splined = GeoUtil.spline(toSpline);
    const trimmed = splined.slice(0, Math.round((splined.length * 2) / 3) - 2);
    const delta = 0.01;
    const initialBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(vertices[0].lat() - delta, vertices[0].lng() - delta),
        new google.maps.LatLng(vertices[0].lat() + delta, vertices[0].lng() + delta)
      );
    const bounds = _.reduce(vertices, (passed, latLng) => passed.extend(latLng), initialBounds);
    let originMarker = null;
    let added = null;
    let count = 0;
    let myColor = null;

    me.map.fitBounds(bounds);
    me.map.data.forEach(() => (count++));
    myColor = me.colors[count % me.colors.length];

    added = me.map.data.addGeoJson({
      type: 'Feature',
      id: result.taskId,
      geometry: {
        type: 'Polygon',
        coordinates: [
          trimmed.concat([trimmed[0]]).map(toGeoJsonCoord),
        ],
      },
      properties: _.defaults({
        isResult: true,
        vertices: result.vertices.getArray().slice(0),
        color: myColor,
        task: result,
      }, result),
    });

    originMarker = me.objectManager.showObject(new Footprint({
      position: result.config.origin,
      zIndex: 50,
      icon: {
        fillColor: myColor,
        anchor: new google.maps.Point(20, 30),
      },
    }), null, `origin-${result.taskId}`);

    originMarker.addListener('click', _.bind(me.onClickResult, me, { feature: added[0] }));
    me.onClickResult({ feature: added[0] });
  }
}

