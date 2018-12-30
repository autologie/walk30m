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

let waitedScripts = 2;

function onLoadScript() {
  if (--waitedScripts > 0) return;

  const app = Elm.Main.init({
    node: document.getElementById("app"),
    flags: []
  });

  app.ports.execute.subscribe(req =>
    execute(
      req,
      10,
      (...args) => console.log(...args),
      (result, visiting, progress) =>
        app.ports.executionProgress.send({ result, visiting, progress })
    )
  );

  app.ports.renderGoogleMaps.subscribe(() =>
    requestAnimationFrame(
      () =>
        new google.maps.Map(document.getElementById("google-maps"), {
          center: { lat: 38, lng: 140 },
          zoom: 10
        })
    )
  );

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
