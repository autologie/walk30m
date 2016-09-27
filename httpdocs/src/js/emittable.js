
export default class Emittable {
  constructor() {
    this._listeners = [];
  }

  trigger(eventType, ...args) {
    this._listeners
      .filter(l => l.eventType === eventType)
      .forEach(l => l.handler.apply(null, args));
  }

  on(eventType, callback) {
    const registory = {eventType, handler: callback};

    this._listeners.push(registory);
    return registory;
  }

  off(regostory) {
    this._listeners = this._listeners.filter((listener) => {
      listener !== registory;
    });
  }
}
