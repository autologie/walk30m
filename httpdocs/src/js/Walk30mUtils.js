import _ from 'lodash';
import { APP_URL } from './config';

class Walk30mUtils {

  static createSummary(options) {
    return _.defaults({
      originAddress: options.address,
      timeExpr: (options.time / 60),
    }, options);
  }

  static encodeResult(coords) {
    const diffSequence = coords.reduce((passed, elem) => [
      elem,
      passed[1].concat([[
        Math.round(1000000 * (elem.lng - (passed[0] === null ? 0 : passed[0].lng))),
        Math.round(1000000 * (elem.lat - (passed[0] === null ? 0 : passed[0].lat))),
      ]]),
    ], [null, []])[1];

    return diffSequence.map((s) => [
      s[0].toString(36),
      s[1].toString(36),
    ].join(' ')).join(',')
      .replace(/,/g, ' ')
      .replace(/\s/g, '+')
      .replace(/\+\-/g, '-');
  }

  static decodeResult(str) {
    const charSeq = str
      .replace(/\+/g, ' ')
      .replace(/\-/g, ' -')
      .split(' ')
      .reduce((passed, elem) => [
        passed[0] === null ? elem : null,
        passed[0] === null ? passed[1] : passed[1].concat([[passed[0], elem]]),
      ], [null, []])[1];

    return charSeq.reduce((passed, elem) => {
      const x = parseInt(elem[0], 36) / 1000000;
      const y = parseInt(elem[1], 36) / 1000000;
      const last = passed ? passed[passed.length - 1] : null;

      return passed
        ? passed.concat([{ lat: last.lat + y, lng: last.lng + x }])
        : [{ lat: y, lng: x }];
    }, null);
  }

  static createSharedURI(feature) {
    try {
      const path = _.map(feature.getProperty('vertices'), 'endLocation');
      const encoded = JSON.stringify(feature.getProperty('task').serialize().config);
      const reqExpr = window.encodeURIComponent(encoded);
      const pathExpr = Walk30mUtils.encodeResult(path.map((latLng) => latLng.toJSON()));

      return `${APP_URL}/#!/result?request=${reqExpr}&path=${pathExpr}`;
    } catch (ex) {
      // fallback
      return APP_URL;
    }
  }
}

export default Walk30mUtils;
