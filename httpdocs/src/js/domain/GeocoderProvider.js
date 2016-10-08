const geocoder = new google.maps.Geocoder();

function geocode(options) {
  return new Promise((resolve, reject) => {
    geocoder.geocode(options, (results, status) => {
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

class GeocoderProvider {

  geocode(address) {
    return geocode({address});
  }

  inverse(location) {
    return geocode({location});
  }
}

export default new GeocoderProvider();
