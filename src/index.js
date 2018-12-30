import "babel-polyfill";
import execute from "@walk30m/core";
import { Elm } from "./Main.elm";

function renderButton(callback) {
  gapi.signin2.render("google-signin-button-container", {
    scope: "profile email",
    width: 240,
    height: 50,
    longtitle: true,
    theme: "dark",
    onsuccess: user => callback(user.getAuthResponse().id_token),
    onfailure: e => console.log(e)
  });
}

function cachedMatrixFactory(service, createRequest, logger = () => {}) {
  let callCount = 0;

  async function cachedMatrix(destinations) {
    const q = createRequest(destinations);
    const serializedQ = JSON.stringify(q);
    const cached = JSON.parse(localStorage.getItem(serializedQ) || null);

    if (cached) {
      logger("cache hit", ++callCount);
      return cached;
    }

    return new Promise((resolve, reject) => {
      service.getDistanceMatrix(q, (result, status) => {
        if (status === "OVER_QUERY_LIMIT") {
          return setTimeout(async () => {
            resolve(await cachedMatrix(destinations));
          }, 2000);
        }

        if (status !== "OK") {
          return reject(status);
        }

        logger("cache miss", ++callCount, destinations.length);

        const times = result.rows[0].elements.map(
          el => el.duration && el.duration.value
        );

        localStorage.setItem(serializedQ, JSON.stringify(times));

        return resolve(times);
      });
    });
  }

  return cachedMatrix;
}

let waitedScripts = 2;

function onLoadScript() {
  let map = null;

  if (--waitedScripts > 0) return;

  const app = Elm.Main.init({
    node: document.getElementById("app"),
    flags: []
  });

  app.ports.execute.subscribe(
    ({ origin, time, travelMode, avoidFerries, avoidHighways, avoidTolls }) => {
      const service = new google.maps.DistanceMatrixService();

      execute(
        { origin, time, travelMode },
        10,
        cachedMatrixFactory(service, destinations => ({
          origins: [origin],
          destinations,
          travelMode,
          avoidFerries,
          avoidHighways,
          avoidTolls
        })),
        (result, visiting, progress) =>
          app.ports.executionProgress.send({ result, visiting, progress })
      );
    }
  );

  app.ports.renderGoogleMaps.subscribe(mapOptions =>
    requestAnimationFrame(() => {
      map = new google.maps.Map(
        document.getElementById("google-maps"),
        mapOptions
      );

      map.data.setStyle(p => p.getProperty("style"));

      const marker = new google.maps.Marker({
        position: mapOptions.center,
        draggable: true
      });

      marker.addListener("dragend", () =>
        app.ports.markerPositionChanged.send(marker.getPosition().toJSON())
      );
      marker.setMap(map);
    })
  );

  app.ports.replaceData.subscribe(data => {
    if (map === null) return;

    map.data.forEach(f => map.data.remove(f));
    map.data.addGeoJson(data);
  });

  app.ports.renderGoogleSignInButton.subscribe(() =>
    requestAnimationFrame(() =>
      renderButton(token => app.ports.receiveIdToken.send(token))
    )
  );

  app.ports.signOut.subscribe(() =>
    gapi.auth2
      .getAuthInstance()
      .signOut()
      .then(() => app.ports.signedOut.send(null))
  );
}

window.onGoogleMapsScriptLoaded = onLoadScript;
window.onGooglePlatformScriptLoaded = onLoadScript;
