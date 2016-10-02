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
    const headComponent = _.head(this.components);

    if (!headComponent) return 0;

    let headAngle = calcAngle(this.settings.origin, headComponent.vertex);

    if (Math.PI * 2 - headAngle < headAngle) headAngle -= Math.PI * 2;

    const angles = _.map(this.components.slice(1), (c) => {
      const myAngle = calcAngle(this.settings.origin, c.vertex);

      return Math.min(Math.PI * 2, myAngle - headAngle);
    });
    const angleDiffs = _.zip(
      angles.slice(0, angles.length - 1),
      angles.slice(1)
    ).map(([prev, next]) => next - prev);

    if (_.some(angleDiffs, d => d < 0)) return 1;
    return _.max(angles) / (Math.PI * 2);
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
}
