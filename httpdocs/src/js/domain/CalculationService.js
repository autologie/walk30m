import _ from 'lodash';
import uuid from 'uuid';
import Emittable from '../utils/Emittable';
import Settings from './Settings';
import {
  meterToLng,
  calcAngle,
  rotate,
  divide,
} from './GeoUtil';

const defaultInterval = 1000; // ms

function getInitialDestination(calc) {
  const {lat, lng} = calc.settings.origin;

  return {
    lat,
    lng: lng + meterToLng(100, lat),
  };
}

function getArgMaxAngle(origin, v1, v2) {
  const [angleV1, angleV2] = [v1, v2].map(v => calcAngle(origin, v));

  if (angleV1 <= angleV2) return v2;
  else return v1;
}

function guessDestination(calc) {
  if (calc.components.length === 0) {
    return getInitialDestination(calc);
  } else {
    const {angleParStep, origin} = calc.settings;
    const {destination, vertex} = _.last(calc.components);
    const lastEnd = getArgMaxAngle(origin, vertex, destination);

    return rotate(origin, lastEnd, calc.settings.anglePerStep);
  }
}

function getBetterDestination(calc, origin, destination, res) {
  if (!res) return divide(origin, destination, 0.8);

  const leg = res.routes[0].legs[0];
  const {time} = calc.settings;
  const timeTook = leg.duration.value;
  const wasTooFar = timeTook > time * 1.2;
  const wasTooNear = !wasTooFar && timeTook < time;

  if (wasTooFar) return divide(origin, destination, 0.8);
  if (wasTooNear) return divide(origin, destination, Math.max(1.1, time / timeTook));
  return null;
}

function modifyDestination(routeProvider, calc, destination) {
  const {origin} = calc.settings;

  return new Promise((resolve, reject) => {
    routeProvider.route(origin, destination, calc.settings).then((res) => {
      if (!calc.isInProgress) resolve(null);

      const betterDestination = getBetterDestination(calc, origin, destination, res);

      if (!betterDestination) {
        resolve(destination);
      } else {
        setTimeout(() => {
          modifyDestination(routeProvider, calc, betterDestination)
            .then(resolve)
            .catch(reject);
        }, defaultInterval);
      }
    });
  });
}

export default class CalculationService {
  constructor(provider) {
    this._routeProvider = provider;
  }

  computeNext(calc) {
    const {lat, lng} = calc.settings.origin;
    const destination = guessDestination(calc);

    return new Promise((resolve, reject) => {
      modifyDestination(this._routeProvider, calc, destination)
        .then((destination) => {
          const appendableVertex = destination;

          if (appendableVertex) {
            resolve({destination, vertex: appendableVertex});
          } else {
            // TODO
          }
        })
        .catch(reject);
    });
  }
}
