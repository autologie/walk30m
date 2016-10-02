const directionsService = new google.maps.DirectionsService;

function createRequest(origin, destination, {travelMode, avoidTolls, avoidFerries, avoidHighways}) {
  return {
    origin: new google.maps.LatLng(origin.lat, origin.lng),
    destination: new google.maps.LatLng(destination.lat, destination.lng),
    travelMode: google.maps.TravelMode[travelMode],
    transitOptions: {
      departureTime: new Date(),
      modes: [
        google.maps.TransitMode.BUS,
        google.maps.TransitMode.RAIL,
        google.maps.TransitMode.SUBWAY,
        google.maps.TransitMode.TRAIN,
        google.maps.TransitMode.TRAM,
      ],
      routingPreference: google.maps.TransitRoutePreference.FEWER_TRANSFERS,
    },
    drivingOptions: {
      departureTime: new Date(),
      trafficModel: google.maps.TrafficModel.BASIC_GUESS,
    },
    avoidTolls,
    avoidHighways,
    avoidFerries,
  };
}

function doRoute(request, retry, maxRetry) {
  if (retry > 0) {
    console.log(`DirectionsService#route retry count: ${retry}`);
  }

  return new Promise((resolve, reject) => {
    directionsService.route(request, (resp, status) => {
      switch (status) {
        case google.maps.DirectionsStatus.ZERO_RESULTS: return resolve(null);
        case google.maps.DirectionsStatus.OK: return resolve(resp.routes[0].legs[0]);
        case google.maps.DirectionsStatus.OVER_QUERY_LIMIT:
          if (retry >= maxRetry) return reject(resp);
          const interval = Math.pow(2, retry) * 1000;

          return setTimeout(() => {
            doRoute(request, retry + 1, maxRetry).then(resolve).catch(reject);
          }, interval);
        default: return reject(resp);
      }
    });
  });
}

class RouteProvider {
  constructor(interval) {
    this._interval = interval;
  }

  get interval() {
    return this._interval;
  }

  route(origin, destination, settings) {
    const request = createRequest(origin, destination, settings);

    if (window.gmap) {
      // debug
      new google.maps.Marker({
        position: new google.maps.LatLng(destination.lat, destination.lng),
        map: window.gmap,
        icon: 'http://www.famfamfam.com/lab/icons/mini/icons/icon_accept.gif',
      });
    }

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        doRoute(request, 0, 3)
        .then((result) => resolve(result))
        .catch((err) => reject(err));

      }, this.interval);
    });
  }
}

export default new RouteProvider(1000);
