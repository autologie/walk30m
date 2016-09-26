export default class Settings {
  constructor(
    origin,
    travelMode,
    time,
    preference = 'BALANCE',
    avoidTolls = false,
    avoidHighways = false,
    avoidFerries = false
  ) {
    this._origin = origin;
    this._travelMode = travelMode;
    this._time = time;
    this._preference = preference;
    this._avoidTolls = avoidTolls;
    this._avoidHighways = avoidHighways;
    this._avoidFerries = avoidFerries;
  }

  get origin() { return this._origin; }
  get travelMode() { return this._travelMode; }
  get time() { return this._time; }
  get preference() { return this._preference; }
  get avoidTolls() { return this._avoidTolls; }
  get avoidHighways() { return this._avoidHighways; }
  get avoidFerries() { return this._avoidFerries; }

  withOrigin(origin) {
    return new Settings(origin, this.travelMode, this.time, this.preference, this.avoidTolls, this.avoidHighways, this.avoidFerries);
  }

  withTravelMode(travelMode) {
    return new Settings(this.origin, travelMode, this.time, this.preference, this.avoidTolls, this.avoidHighways, this.avoidFerries);
  }

  withTime(time) {
    return new Settings(this.origin, this.travelMode, time, this.preference, this.avoidTolls, this.avoidHighways, this.avoidFerries);
  }

  withPreference(preference) {
    return new Settings(this.origin, this.travelMode, this.time, preference, this.avoidTolls, this.avoidHighways, this.avoidFerries);
  }

  withAvoidTolls(avoidTolls) {
    return new Settings(this.origin, this.travelMode, this.time, this.preference, avoidTolls, this.avoidHighways, this.avoidFerries);
  }

  withAvoidHighways(avoidHighways) {
    return new Settings(this.origin, this.travelMode, this.time, this.preference, this.avoidTolls, avoidHighways, this.avoidFerries);
  }

  withAvoidFerries(avoidFerries) {
    return new Settings(this.origin, this.travelMode, this.time, this.preference, this.avoidTolls, this.avoidHighways, avoidFerries);
  }

  withDefaultAdvancedSettings() {
    return new Settings(this.origin, this.travelMode, this.time);
  }

  get isValid() {
    return this.origin
      && this.origin.lat
      && this.origin.lng
      && this.travelMode
      && this.time;
  }
}
