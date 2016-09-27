import Emittable from './emittable';

export default class Calculation extends Emittable {
  constructor(settings) {
    super();
    this._settings = settings;
    this._timer = null;
    this._vertices = [];
  }

  start() {
    console.log('started', this._settings);

    this._progress = 0;

    this.setTimeout(() => this.next(), 1000);
  }

  next() {
    console.log('next');
    const {lat, lng} = this._settings.origin;

    this._progress += 0.001;
    this._vertices = this._vertices.concat([
      {lat: lat + this.progress, lng: lng - this.progress}
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

    this.trigger('aborted', this._settings);
  }

  setTimeout(callback, timeout) {
    if (this._timer) throw new Error('attempt to execute duplicate timeout');

    this._timer = setTimeout(() => {
      this._timer = null;
      callback();
    }, timeout);
  }

  get progress() {
    return this._progress;
  }

  get isCompleted() {
    return this._progress >= 0.01;
  }

  get vertices() {
    return this._vertices;
  }
}
