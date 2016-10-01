import uuid from 'uuid';
import Emittable from '../utils/Emittable';
import Settings from './Settings';

function next(service) {
  service.computeNext(this).then(({progress, vertices}) => {
    this._progress = progress;
    this._vertices = vertices;

    if (this.isCompleted) {
      this.trigger('complete', this._settings);
    } else {
      this.trigger('progress', this._settings, this._progress);
      next.bind(this)(service);
    }
  });
}

export default class Calculation extends Emittable {
  constructor(settings) {
    super();
    this._settings = settings;
    this._vertices = [];
    this._isAborted = false;
    this._id = uuid.v4();
  }

  static deserialize(serialized) {
    const instance = new Calculation();

    Object.assign(instance, Object.assign(serialized, {
      _settings: new Settings(serialized._settings),
      _listeners: [],
    }));
    return instance;
  }

  start(service) {
    this._progress = 0;
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
    return this._progress;
  }

  get isCompleted() {
    return this.progress >= 1;
  }

  get isAborted() {
    return this._isAborted;
  }

  get vertices() {
    return this._vertices;
  }

  get isInProgress() {
    return !this.isCompleted && !this.isAborted;
  }

  get settings() {
    return this._settings;
  }
}
