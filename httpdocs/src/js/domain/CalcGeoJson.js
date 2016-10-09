import _ from 'lodash';

const toArray = v => [v.lng, v.lat];

export default class CalcGeoJson {
  constructor(calc, properties) {
    this._calc = calc;
    this._propertiesFn = _.isFunction(properties)
      ? properties
      : () => properties;
  }

  get origin() {
    const {settings, id} = this._calc;

    return {
      id: `calculation-${id}-origin`,
      type: 'Feature',
      properties: this._propertiesFn('origin'),
      geometry: {
        type: 'Point',
        coordinates: toArray(settings.origin),
      },
    };
  }

  get vertexArray() {
    const {vertices, id} = this._calc;

    return vertices.map((vertex, vid) => ({
      id: `calculation-${id}-vertex-${vid}`,
      type: 'Feature',
      properties: this._propertiesFn('vertexArray'),
      geometry: {
        type: 'Point',
        coordinates: toArray(vertex),
      },
    }));
  }

  get polygon() {
    const {vertices, id} = this._calc;

    return vertices.length >= 3 ? {
      id: `calculation-${id}`,
      type: 'Feature',
      properties: this._propertiesFn('polygon'),
      geometry: {
        type: 'Polygon',
        coordinates: [
          vertices.concat(vertices.length > 0 ? [_.head(vertices)] : []).map(toArray),
        ],
      },
    } : null;
  }

  get routes() {
    const {routes, id} = this._calc;

    return routes.map((route, idx) => {
      return {
        id: `calculation-${id}-route-${idx}`,
        type: 'Feature',
        properties: this._propertiesFn('routes'),
        geometry: {
          type: 'LineString',
          coordinates: route.map(toArray),
        }
      };
    });
  }

  static collection(calculations) {
    return {
      type: 'FeatureCollection',
      features: _.flatten(calculations.map((calc) => {
        const { origin, polygon, routes } = new CalcGeoJson(calc, ((fType) => {
          switch (fType) {
            case 'origin':
              return {
                name: calc.settings.origin.address,
                timestamp: +calc.endAt,
              };
            case 'polygon':
              return {
                name: '計算結果',
                timestamp: +calc.endAt,
              };
            case 'routes':
              return {
                name: 'ルート',
                timestamp: +calc.endAt,
              };
          }
        }));

        return [origin, polygon].concat(routes);
      })),
    };
  }
}
