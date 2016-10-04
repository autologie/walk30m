import _ from 'lodash';

const toArray = v => [v.lng, v.lat];

export default class CalcGeoJson {
  constructor(calc) {
    this._calc = calc;
  }

  get origin() {
    const {settings, id} = this._calc;

    return {
      id: `calculation-${id}-origin`,
      type: 'Feature',
      properties: {
        calculation: this._calc,
      },
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
      properties: {
        calculation: this._calc,
      },
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
      properties: {
        calculation: this._calc,
      },
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
        properties: {
          calculation: this._calc,
        },
        geometry: {
          type: 'LineString',
          coordinates: route.map(toArray),
        }
      };
    });
  }
}
