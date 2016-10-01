import uuid from 'uuid';
import Emittable from '../utils/Emittable';
import Settings from './Settings';

export default class CalculationService {

  computeNext(calc) {
    const {lat, lng} = calc.settings.origin;

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({
          progress: calc.progress + 0.1,
          vertices: calc.vertices.concat([
            {lat: lat + calc.progress * 0.01, lng: lng - calc.progress * 0.01}
          ]),
        });
      }, 1000);
    });
  }
}
