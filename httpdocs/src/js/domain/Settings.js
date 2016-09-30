export default class Settings {
  constructor(
    first,
    travelMode,
    time,
    preference = 'BALANCE',
    avoidTolls = false,
    avoidHighways = false,
    avoidFerries = false
  ) {
    if (first && first._origin) {
      Object.assign(this, first);
    } else {
      this._origin = first;
      this._travelMode = travelMode;
      this._time = time;
      this._preference = preference;
      this._avoidTolls = avoidTolls;
      this._avoidHighways = avoidHighways;
      this._avoidFerries = avoidFerries;
    }
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

  get anglePerStep() {
    if (this.preference === 'PRECISION') return 5;
    if (this.preference === 'SPEED') return 20;
    return 10;
  }

  get hasDefaultAdvancedSettings() {
    return this.preference === 'BALANCE'
      && !this.avoidTolls
      && !this.avoidHighways
      && !this.avoidFerries;
  }
}
