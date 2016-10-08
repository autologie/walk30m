import geocoderProvider from './GeocoderProvider';

class GeolocationProvider {
  constructor() {
    this._promise = null;
  }

  getCurrentLocation() {
    if (!this._promise) {
      this._promise = new Promise((resolve, reject) => {
        window.navigator.geolocation.watchPosition((pos) => {
          geocoderProvider
            .inverse({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            })
            .then(results => resolve(results[0]))
            .catch(reject);
        }, (err) => {
          reject(err);
        }, {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        });
      });
    }

    return this._promise;
  }
}

export default new GeolocationProvider();
