import _ from 'lodash';
import uuid from 'uuid';
import Emittable from '../utils/Emittable';
import Settings from './Settings';
import {calcAngle} from './GeoUtil';

function next(service) {
  service.computeNext(this)
    .then((newComponent) => {
      if (!this.isInProgress) return;

      this._components = this.components.concat([ newComponent ]);

      if (this.isCompleted) {
        this.trigger('complete', this.settings);
      } else {
        this.trigger('progress', this.settings, this.progress);
        next.bind(this)(service);
      }
    })
    .catch((err) => {
      console.log(err);
      this.abort();
    });
}

function getHeadAngle(components, origin) {
  if (components.length === 0) return null;

  const headComponent = _.head(components);
  const headAngle = calcAngle(origin, headComponent.vertex);

  if (Math.PI * 2 - headAngle < headAngle) return headAngle - Math.PI * 2;
  return headAngle;
}

export default class Calculation extends Emittable {
  constructor(settings) {
    super();
    this._settings = settings;
    this._components = [];
    this._isAborted = false;
    this._id = uuid.v4();
    this._startAt = null;
    this._endAt = null;

    this.on('start', () => this._startAt = new Date());
    this.on('complete', () => this._endAt = new Date());
    this.on('abort', () => this._endAt = new Date());
  }

  static deserialize(serialized) {
    const instance = new Calculation();

    Object.assign(instance, Object.assign(serialized, {
      _settings: new Settings(serialized._settings),
      _listeners: [],
      _startAt: serialized._startAt ? new Date(serialized._startAt) : null,
      _endAt: serialized._endAt ? new Date(serialized._endAt) : null,
    }));
    return instance;
  }

  start(service) {
    this.trigger('start', this._settings);
    next.bind(this)(service);
  }

  resume(service) {
    this._isAborted = false;
    next.bind(this)(service);
  }

  abort() {
    this._isAborted = true;
    this.trigger('abort', this._settings);
  }

  get id() {
    return this._id;
  }

  get progress() {
    const origin = this.settings.origin;
    const offset = getHeadAngle(this.components, origin);
    const DP = Math.PI * 2;

    if (offset === null) return 0;

    const angles = _.tail(this.components).map(c => Math.min(DP, calcAngle(origin, c.vertex) - offset));
    const diff = ([prev, next]) => next - prev;
    const angleDiffs = _.zip(_.initial(angles), _.tail(angles)).map(diff);

    if (_.some(angleDiffs, d => d < 0)) return 1;
    return _.max(angles) / DP;
  }

  get isCompleted() {
    return this.progress >= 1;
  }

  get isAborted() {
    return this._isAborted;
  }

  get components() {
    return this._components;
  }

  get vertices() {
    return this._components.map(cmp => cmp.vertex);
  }

  get routes() {
    return this._components.map(cmp => cmp.route);
  }

  get isInProgress() {
    return !this.isCompleted && !this.isAborted;
  }

  get startAt() {
    return this._startAt;
  }

  get endAt() {
    return this._endAt;
  }

  get settings() {
    return this._settings;
  }

  get status() {
    if (this.isCompleted) return 'completed';
    if (this.isInProgress) return 'inProgress';
    if (this.isAborted) return 'aborted';
    return 'unknown';
  }

  get bounds() {
    const lats = this.vertices.map(v => v.lat);
    const lngs = this.vertices.map(v => v.lng);

    return {
      sw: {lat: _.min(lats), lng: _.min(lngs)},
      ne: {lat: _.max(lats), lng: _.max(lngs)},
    };
  }
}
