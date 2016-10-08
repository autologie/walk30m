const geocoder = new google.maps.Geocoder();

class GeocoderProvider {

  geocode(address) {
    return new Promise((resolve, reject) => {
      geocoder.geocode({address}, (results, status) => {
        if (status === window.google.maps.GeocoderStatus.OK) {
          resolve(results.map(result => ({
            lat: result.geometry.location.lat(),
            lng: result.geometry.location.lng(),
            address: result.formatted_address,
          })))
        } else {
          reject(status);
        }
      });
    });
  }
}

export default new GeocoderProvider();
