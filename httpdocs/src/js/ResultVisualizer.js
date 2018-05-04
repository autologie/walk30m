import toKML from "tokml";
import $ from "jquery";
import _ from "lodash";
import GeoUtil from "./GeoUtil";
import Walk30mUtils from "./Walk30mUtils";
import Footprint from "./Footprint";

function ResultVisualizer(application, map, objectManager) {
  let me = this,
    defaultStyler = map.data.getStyle();

  me.colors = [
    "hsl(180, 50%, 33%)",
    "hsl(120, 50%, 33%)",
    "hsl(0, 50%, 33%)",
    "hsl(240, 50%, 33%)",
    "hsl(300, 50%, 33%)",
    "hsl(60, 50%, 33%)"
  ];
  me.application = application;
  me.map = map;
  me.objectManager = objectManager;
  me.twitterURITpl = _.template(
    "https://twitter.com/intent/tweet?text=<%= message %>&url=<%= url %>&hashtags=walk30m"
  );
  me.routeLinkTpl = _.template(
    "https://www.google.co.jp/maps/dir/<%= originLat %>,<%= originLng %>/<%= destLat %>,<%= destLng %>"
  );
  me.balloonTpl = _.template(application.getMessage("routeDetailBalloonTpl"));
  me.overviewBalloonTpl = _.template(
    application.getMessage("resultOverviewBalloonTpl")
  );
  me.summaryBalloonTpl = _.template(
    application.getMessage("resultSummaryBalloonTpl")
  );

  me.map.data.addListener("click", _.bind(me.onClickResult, me));

  me.map.data.setStyle(feature => {
    let color;

    if (feature.getProperty("isResult") === true) {
      color = feature.getProperty("color");
      return {
        strokeColor: color,
        fillColor: color,
        strokeOpacity: 1,
        strokeWeight: 2,
        fillOpacity: 0.3
      };
    }
    return _.isObject(defaultStyler)
      ? defaultStyler
      : _.isFunction(defaultStyler)
        ? defaultStyler(feature)
        : {};
  });
}

ResultVisualizer.prototype.createRouteLink = function(route) {
  let me = this,
    path = route.overview_path;

  return me.routeLinkTpl({
    originLat: path[0].lat(),
    originLng: path[0].lng(),
    destLat: route.overview_path[path.length - 1].lat(),
    destLng: path[path.length - 1].lng()
  });
};

ResultVisualizer.prototype.createDetailedBalloonContent = function(
  directionResult
) {
  let me = this,
    route = directionResult.routes[0],
    content = me.balloonTpl({
      dest: GeoUtil.trimGeocoderAddress(route.legs[0].end_address),
      time: route.legs[0].duration.text,
      url: me.createRouteLink(route),
      summary: route.summary,
      copyright: route.copyrights
    });

  return content;
};

ResultVisualizer.prototype.clearResultDetail = function() {
  const me = this;

  me.objectManager.clearObjects("routeHilight");
  me.objectManager.clearObjects("route");
  me.objectManager.clearObject("summaryBalloon");
};

ResultVisualizer.prototype.onClickRoute = function(
  feature,
  route,
  directionResult
) {
  let me = this,
    iw = new google.maps.InfoWindow({
      position: _.max(route.slice(route.length / 4), latLng => latLng.lat()),
      content: me.createDetailedBalloonContent(directionResult),
      maxWidth: Math.min(0.6 * $(window).width(), 320)
    }),
    cls = "routeHilight",
    color = (feature.getProperty("color") || "").replace(
      "50%, 33%",
      "60%, 50%"
    );

  me.objectManager.clearObjects(cls);
  iw.addListener("domready", () => {
    $(me.map.getDiv())
      .find("a[role=back-to-summary]")
      .click(
        _.bind(me.onClickResult, me, {
          feature
        })
      );
  });

  _.delay(() => {
    me.objectManager.showObject(iw, cls, "routeBalloon");
    me.objectManager.showObject(
      me.createCircle({
        icon: {
          strokeColor: color,
          scale: 8,
          strokeWeight: 4
        },
        position: route[route.length - 1],
        zIndex: 40
      }),
      cls
    );
    me.objectManager.showObject(
      new google.maps.Polyline({
        path: route,
        clickable: false,
        strokeColor: color,
        strokeWeight: 4,
        strokeOpacity: 1,
        zIndex: 25
      }),
      cls
    );
    iw.addListener("closeclick", () => {
      me.objectManager.clearObjects(cls);
    });
  }, 200);
};

ResultVisualizer.prototype.createCircle = function(options) {
  return new google.maps.Marker(
    _.defaults(options, {
      icon: _.defaults(options.icon || {}, {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 4,
        strokeWeight: 2,
        fillColor: "#fff",
        fillOpacity: 1
      }),
      zIndex: 30
    })
  );
};

ResultVisualizer.prototype.drawRoute = function(
  feature,
  route,
  directionResult
) {
  let me = this,
    cls = "route",
    routePolygon = me.objectManager.showObject(
      new google.maps.Polyline({
        path: route,
        clickable: false,
        strokeColor: feature.getProperty("color"),
        strokeWeight: 2,
        strokeOpacity: 1,
        zIndex: 20
      }),
      cls
    ),
    endPoint = me.objectManager.showObject(
      me.createCircle({
        icon: { strokeColor: feature.getProperty("color") },
        position: route[route.length - 1]
      }),
      cls
    );

  routePolygon.addListener(
    "click",
    _.bind(me.onClickRoute, me, feature, route, directionResult)
  );
  endPoint.addListener(
    "click",
    _.bind(me.onClickRoute, me, feature, route, directionResult)
  );
};

ResultVisualizer.prototype.showResultDetail = function(feature) {
  const me = this;

  feature.getProperty("vertices").forEach(vertex => {
    me.drawRoute(
      feature,
      vertex.directionResult.routes[0].overview_path,
      vertex.directionResult
    );
  });
};

ResultVisualizer.prototype.createSummary = function(feature) {
  let me = this,
    options = feature.getProperty("config"),
    color = feature.getProperty("color"),
    tpl =
      feature.getId() !== "viewonly"
        ? me.overviewBalloonTpl
        : me.summaryBalloonTpl;

  return tpl(
    _.defaults(
      {
        borderColor: color,
        bgColor: (color || "").replace("hsl", "hsla").replace(")", ", .5)")
      },
      me.toReadable(options)
    )
  );
};

ResultVisualizer.prototype.bindSummaryBalloonEvents = function(feature) {
  let me = this,
    __ = _.bind(me.application.getMessage, me.application),
    options = feature.getProperty("config"),
    summary = me.toReadable(options),
    $balloon = $(me.map.getDiv()).find(".gm-style-iw");

  $balloon.find("a[role=tweet-result]").click(() => {
    const url = me.twitterURITpl({
      url: window.encodeURIComponent(Walk30mUtils.createSharedURI(feature)),
      message: window.encodeURIComponent(
        _.template(__("tweetMessageTpl"))(summary)
      )
    });

    window.open(url, "_blank");
  });
  $balloon.find("a[role=report-problem]").click(() => {
    me.application.startEditMessage(
      _.template(__("reportMessageTpl"))({
        summary: _.template(__("summaryTpl"))(summary)
      }),
      feature.getId()
    );
  });
  $balloon.find("a[role=erase-result]").click(() => {
    me.map.data.remove(feature);
    me.objectManager.clearObject("summaryBalloon");
    me.objectManager.clearObject(`origin-${feature.getId()}`);
  });
  $balloon.find("a[role=show-routes]").click(() => {
    me.objectManager.clearObject("summaryBalloon");
    feature.setProperty("detailed", true);
    me.showResultDetail(feature);
  });
  me.createDataURI(feature).then(dataURI => {
    $balloon.find("a[role=download-geojson]").attr({
      download: `feature-${+new Date()}.geojson`,
      href: dataURI.geoJSON,
      target: "_blank"
    });
    $balloon.find("a[role=download-kml]").attr({
      download: `feature-${+new Date()}.kml`,
      href: dataURI.kml,
      target: "_blank"
    });
  });
};

ResultVisualizer.prototype.showSummaryBalloon = function(feature) {
  let me = this,
    iw = new google.maps.InfoWindow({
      maxWidth: Math.min(0.6 * $(window).width(), 320)
    });

  iw.setContent(me.createSummary(feature));
  iw.addListener("domready", _.bind(me.bindSummaryBalloonEvents, me, feature));
  me.objectManager.showObject(
    iw,
    null,
    "summaryBalloon",
    (me.objectManager.findObject(`origin-${feature.getId()}`) || {})[0]
  );
};

ResultVisualizer.prototype.onClickResult = function(event) {
  const me = this;

  me.clearResultDetail();

  if (event.feature.getProperty("detailed")) {
    event.feature.setProperty("detailed", false);
  }
  me.showSummaryBalloon(event.feature);
};

ResultVisualizer.prototype.addResult = function(result) {
  let me = this,
    vertices = _.map(result.vertices.getArray(), "endLocation"),
    toSpline = vertices.concat(
      vertices.slice(0).splice(0, Math.round(vertices.length / 2))
    ),
    toGeoJsonCoord = function(coord) {
      return [coord.lng(), coord.lat()];
    },
    splined = GeoUtil.spline(toSpline),
    delta = 0.01,
    bounds = _.reduce(
      vertices,
      (passed, latLng) => passed.extend(latLng),
      new google.maps.LatLngBounds(
        new google.maps.LatLng(
          vertices[0].lat() - delta,
          vertices[0].lng() - delta
        ),
        new google.maps.LatLng(
          vertices[0].lat() + delta,
          vertices[0].lng() + delta
        )
      )
    ),
    originMarker,
    added,
    count = 0,
    myColor;

  me.map.fitBounds(bounds);
  me.map.data.forEach(() => {
    count++;
  });
  myColor = me.colors[count % me.colors.length];
  splined = splined.slice(0, Math.round(splined.length * 2 / 3) - 2);

  added = me.map.data.addGeoJson({
    type: "Feature",
    id: result.taskId,
    geometry: {
      type: "Polygon",
      coordinates: [splined.concat([splined[0]]).map(toGeoJsonCoord)]
    },
    properties: _.defaults(
      {
        isResult: true,
        vertices: result.vertices.getArray().slice(0),
        color: myColor,
        task: result
      },
      result
    )
  });

  originMarker = me.objectManager.showObject(
    new Footprint({
      position: result.config.origin,
      zIndex: 50,
      icon: {
        fillColor: myColor,
        anchor: new google.maps.Point(20, 30)
      }
    }),
    null,
    `origin-${result.taskId}`
  );

  originMarker.addListener(
    "click",
    _.bind(me.onClickResult, me, { feature: added[0] })
  );
  me.onClickResult({ feature: added[0] });
};

ResultVisualizer.prototype.createDataURI = function(feature) {
  const readable = this.toReadable(feature.getProperty("config"));
  const nameTpl = _.template(this.application.getMessage("summaryTpl"));
  const name = nameTpl(readable);
  const descriptionTpl = _.template(
    this.application.getMessage("descriptionTpl")
  );
  const description = descriptionTpl(readable);

  return new Promise(resolve => {
    feature.toGeoJson(json => {
      const geoJSON = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [readable.origin.lng, readable.origin.lat]
            },
            properties: {
              name: readable.originAddress
            }
          },
          _.defaults(
            {
              properties: {
                name,
                description,
                timestamp: +new Date()
              }
            },
            _.omit(json, "id")
          )
        ]
      };

      resolve({
        kml: `data:text/xml;charset=UTF-8,${encodeURIComponent(
          toKML(geoJSON)
        )}`,
        geoJSON: `data:application/json;charset=UTF-8,${encodeURIComponent(
          JSON.stringify(geoJSON)
        )}`
      });
    });
  });
};

ResultVisualizer.prototype.toReadable = function(options) {
  const __ = this.application.getMessage.bind(this.application);
  const travelModes = __("travelModes");
  const useExpr = __("use");
  const noUseExpr = __("noUse");
  const readable = _.defaults(
    {
      executionDateExpr: new Date().toLocaleString(),
      origin: options.origin.toJSON ? options.origin.toJSON() : options.origin,
      travelModeExpr: travelModes[options.mode],
      preferenceExpr: __("preferences")[options.preference],
      avoidTollsExpr: options.avoidTolls ? noUseExpr : useExpr,
      avoidHighwaysExpr: options.avoidHighways ? noUseExpr : useExpr,
      avoidFerriesExpr: options.avoidFerries ? noUseExpr : useExpr
    },
    options
  );

  return Walk30mUtils.createSummary(readable);
};

export default ResultVisualizer;
