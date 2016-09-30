import uuid from 'uuid';
import Emittable from './emittable';
import Settings from './domain/Settings';

export default class Calculation extends Emittable {
  constructor(settings) {
    super();
    this._settings = settings;
    this._timer = null;
    this._vertices = [];
    this._isAborted = false;
    this._id = uuid.v4();
  }

  static deserialize(serialized) {
    const instance = new Calculation();

    Object.assign(instance, Object.assign(serialized, {
      _settings: new Settings(serialized._settings),
    }));
    return instance;
  }

  start() {
    console.log('started', this._settings);

    this._progress = 0;

    this.setTimeout(() => this.next(), 1000);
  }

  next() {
    const {lat, lng} = this._settings.origin;

    this._progress += 0.1;
    this._vertices = this._vertices.concat([
      {lat: lat + this.progress * 0.01, lng: lng - this.progress * 0.01}
    ]);

    if (this.isCompleted) {
      this.trigger('complete', this._settings);
    } else {
      this.trigger('progress', this._settings, this._progress);
      this.setTimeout(() => this.next(), 1000);
    }
  }

  abort() {
    if (!this._timer) return;

    clearTimeout(this._timer);
    this._timer = null;
    this._isAborted = true;

    this.trigger('abort', this._settings);
  }

  setTimeout(callback, timeout) {
    if (this._timer) throw new Error('attempt to execute duplicate timeout');

    this._timer = setTimeout(() => {
      this._timer = null;
      callback();
    }, timeout);
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
