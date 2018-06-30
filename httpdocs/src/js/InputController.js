import $ from "jquery";

import _ from "lodash";
import GeoUtil from "./GeoUtil";
import ProgressBar from "./ProgressBar";

const minuteArray = _.range(1, 61)
  .concat(_.map(_.range(1, 19), n => 60 + n * 10))
  .concat(_.map(_.range(1, 7), n => 240 + n * 60));

function initializeScroll() {
  // correct unnecessary scroll offset caused by software keyboard of iPhone.
  window.scrollTo(0, 0);
}

class InputController {
  constructor(application, $el, mapController) {
    const me = this;
    const optionTpl = _.template(
      '<option value="<%= num %>" <%= selected %>><%= num %></option>'
    );

    this.selMode = {
      TEXT: "selmode-text",
      MAP: "selmode-map",
      CURRENT: "selmode-current",
      GEOCODE: "selmode-geocode",
      SPEECH: "selmode-voice"
    };

    me.isSpeechAvailable = undefined !== window.webkitSpeechRecognition;
    me.mapController = mapController;
    me.application = application;
    me.getLocationWatchId = null;

    me.$el = $el;
    me.$selModeList = $el.find(".select");
    me.$location = $el.find("input[name=location]");
    me.$time = $el.find("[name=travelTime]");
    me.$execBtn = $el.find(".btn[role=execute]");
    me.$cancelBtn = $el.find(".glyphicon[role=cancel]");
    me.$time.append(
      _.map(minuteArray, n =>
        optionTpl({ num: n, selected: n === 30 ? "selected" : "" })
      ).join("")
    );

    me.defaultPlaceholder = me.$location.attr("placeholder");
    this.updateLocationCombo = _.debounce(
      () => this.doUpdateLocationCombo(),
      200
    );

    if (!me.isSpeechAvailable) {
      me.$selModeList
        .find(`[data-selmode=${me.selMode.SPEECH}]`)
        .addClass("disabled");
    }
    if (!window.navigator.geolocation) {
      me.$selModeList
        .find(`[data-selmode=${me.selMode.CURRENT}]`)
        .addClass("disabled");
    }

    me.initEvents();
  }

  initEvents() {
    const me = this;

    me.$selModeList
      .find("li[data-selmode]:not(.disabled)")
      .click(ev => {
        let $target = $(ev.target),
          $li = $target.is("li") ? $target : $target.parents("li");

        $li.blur(); // bug fix -> https://www.pivotaltracker.com/story/show/109711984
        me.onSelModeChoosed($li.attr("data-selmode"));
      })
      .keydown(_.bind(me.onKeyDownSelModeListItem, me))
      .blur(_.bind(me.onBlurSelModeListItem, me));

    me.$location.focus(() => {
      me.toggleSelModeList(true);

      if (window.matchMedia("(orientation: portrait)").matches) {
        _.delay(() => {
          me.application.$page.animate(
            {
              scrollTop: `${Math.round(me.$location.offset().top - 10)}px`
            },
            100
          );
        }, 500);
      }
    });
    me.$location.blur(_.bind(me.onBlurSelModeListItem, me));
    me.$location.keydown(_.bind(me.onKeydown, me));
    me.$location.change(_.bind(me.resetLatLng, me));
    me.$time.blur(initializeScroll);
  }

  resetLatLng() {
    const me = this;

    me.$location.removeAttr("data-latitude");
    me.$location.removeAttr("data-longitude");
  }

  onBlurSelModeListItem() {
    const me = this;

    _.defer(() => {
      initializeScroll();
      if (!me.$el.find(":focus").is("li")) {
        me.toggleSelModeList(false);
      }
    });
  }

  onKeydown(ev) {
    let me = this,
      $items;

    if (ev.keyCode === 13) {
      // return
      me.$location.blur();
    } else if (ev.keyCode === 38 || ev.keyCode === 40) {
      // up or down
      $items = me.$selModeList.find("li");

      me.$location.blur();
      $items.eq(ev.keyCode === 38 ? $items.length - 1 : 0).focus();
      ev.preventDefault();
    } else {
      me.updateLocationCombo();
    }
  }

  onKeyDownSelModeListItem(ev) {
    let me = this,
      $target = $(ev.target),
      $items,
      $li = $target.is("li") ? $target : $target.parents("li");

    if (ev.keyCode === 13) {
      me.onSelModeChoosed(
        $li.attr("data-selmode"),
        me.extractSelModeListItemData($li)
      );
    } else if (ev.keyCode === 38 || ev.keyCode === 40) {
      $items = me.$selModeList.find("li");
      $items
        .eq(($li.index() + (ev.keyCode === 38 ? -1 : 1)) % $items.length)
        .focus();
      ev.preventDefault();
    }
  }

  extractSelModeListItemData($item) {
    return {
      position: {
        lat: +$item.attr("data-latitude"),
        lng: +$item.attr("data-longitude")
      },
      address: $item.text()
    };
  }

  resolveLocationByWhat3words(words) {
    return new Promise((resolve, reject) => {
      const apiKey = process.env.WHAT3WORDS_API_KEY;

      if (!/^([^.]+)\.([^.]+)\.([^.]+)$/.test(words)) return resolve([]);

      return $.ajax({
        url: `https://api.what3words.com/v2/autosuggest?key=${apiKey}&addr=${words}&lang=en`,
        type: "GET"
      })
        .then(data => {
          const format = result => ({
            lat: result.geometry.lat,
            lng: result.geometry.lng,
            address: `///${result.words}`
          });

          if (
            data.status.status !== 200 ||
            typeof data.status.code !== "undefined"
          )
            return reject(new Error(data.status.message));

          return resolve(data.suggestions.map(format));
        })
        .catch(reject);
    });
  }

  resolveLocationByGoogleMapsGeocoder(address) {
    return new Promise((resolve, reject) => {
      new google.maps.Geocoder().geocode({ address }, (results, status) => {
        if (status === google.maps.GeocoderStatus.ZERO_RESULTS)
          return resolve([]);

        if (status === google.maps.GeocoderStatus.OK)
          return resolve(
            results.slice(0, 3).map(result => ({
              lat: result.geometry.location.lat(),
              lng: result.geometry.location.lng(),
              address: GeoUtil.trimGeocoderAddress(result.formatted_address)
            }))
          );

        return reject(status);
      });
    });
  }

  resolveLocation(inputValue) {
    if (/^\/\/\//.test(inputValue))
      return this.resolveLocationByWhat3words(inputValue.slice(3));

    return this.resolveLocationByGoogleMapsGeocoder(inputValue);
  }

  doUpdateLocationCombo() {
    let me = this,
      val = me.$location.val(),
      selector = "li[data-selmode=selmode-geocode]",
      tpl = _.template(
        '<li tabindex="-1" data-selmode="selmode-geocode" data-latitude="<%= lat %>" data-longitude="<%= lng %>"><%= address %></li>'
      );

    me.$selModeList.find(selector).remove();

    if (!val || val.length < 2) {
      return;
    }

    me
      .resolveLocation(val)
      .then(results => {
        me.$selModeList.prepend(
          results
            .slice(0, 3)
            .map(tpl)
            .join("")
        );

        me.$selModeList
          .find(selector)
          .click(ev => {
            const $choosed = $(ev.target);

            me.onSelModeChoosed(
              me.selMode.GEOCODE,
              me.extractSelModeListItemData($choosed)
            );
          })
          .keydown(_.bind(me.onKeyDownSelModeListItem, me))
          .blur(_.bind(me.onBlurSelModeListItem, me));
      })
      .catch(e => {
        const message = me.application.getMessage("resolveLocationFailed");

        window.alert([message, (e && e.message) || e].join("\n\n"));
      });
  }

  appendElementToLocationInput($el, fix) {
    let me = this,
      $loc = me.$location;

    fix = _.defaults(fix || {}, { top: 0, left: 0, width: 0 });

    $el.css({
      top: `${fix.top + $loc.outerHeight()}px`,
      left: `${fix.left +
        Math.round(
          $loc.offset().left - ($loc.outerWidth() - $loc.width()) / 2
        )}px`,
      width: `${fix.width + $loc.outerWidth()}px`
    });
  }

  toggleSelModeList(show) {
    let me = this,
      isVisible = me.$selModeList.is(":visible"),
      doShow = !isVisible && (show !== false || show === true),
      doHide = isVisible && (show === false || show !== true),
      deferred = new $.Deferred();

    window.console.log("InputController: toggleSelModeList", doShow, doHide);

    if (doShow) {
      me.appendElementToLocationInput(me.$selModeList, { left: -3 });
      me.$selModeList.fadeIn(undefined, () => {
        deferred.resolve();
      });
      _.delay(() => {
        me.$el.one("click", me.__bgClickHandler);
      }, 100);
    } else if (doHide) {
      me.$selModeList.fadeOut(undefined, () => {
        deferred.resolve();
      });
    }

    return deferred.promise();
  }

  selectLocationOnMap() {
    const me = this;

    me.togglePanel(false);
    me.mapController.specifyLocation(loc => {
      me.togglePanel(true);
      if (loc) {
        me.setLatLng(loc);
        me.$execBtn.focus();
      }
    });
  }

  selectLocationByText(data) {
    const me = this;

    me.$location.focus();

    if (_.isString(data)) {
      me.$location.val(data);
      me.updateLocationCombo();
    }
  }

  applyGeoLocationResult() {
    let me = this,
      crd,
      latLng,
      __ = _.bind(me.application.getMessage, me.application);

    if (me.lastGeoLocationResult.code === 1) {
      window.alert(__("geolocationForbidden"));
    } else if (me.lastGeoLocationResult.code === 2) {
      window.alert(__("geolocationUnavailable"));
    } else if (me.lastGeoLocationResult.code === 3) {
      window.alert(__("geolocationFailure"));
    } else if (me.lastGeoLocationResult.coords) {
      crd = me.lastGeoLocationResult.coords;
      latLng = new google.maps.LatLng(crd.latitude, crd.longitude);
      me.setLatLng(latLng).then(() => {
        me.mapController.map.panTo(latLng);
        me.$location.attr("placeholder", me.defaultPlaceholder);
      });
    } else {
      window.alert(__("geolocationError"));
    }
  }

  initGeoLocationAPI(progressBar) {
    const me = this;

    me.geoLocationWatchId = window.navigator.geolocation.watchPosition(
      pos => {
        // on success
        me.lastGeoLocationResult = pos;
        progressBar.finalize();
      },
      err => {
        // on error
        me.lastGeoLocationResult = err;
        progressBar.finalize();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );

    me.selectLocationByGeoLocation();
  }

  selectLocationByGeoLocation() {
    let me = this,
      bar,
      $bar;

    if (me.lastGeoLocationResult) {
      me.applyGeoLocationResult(me.lastGeoLocationResult);
    } else if (me.geoLocationWatchId) {
      _.delay(_.bind(me.selectLocationByGeoLocation, me), 100);
    } else {
      $bar = me.$location.parent().find("div[role=progressbar]");
      bar = new ProgressBar($bar);
      me.appendElementToLocationInput($bar, { top: 8, left: 7 });
      bar.update(99.9);
      me.$location.attr(
        "placeholder",
        me.application.getMessage("geolocationDetecting")
      );

      _.delay(_.bind(me.initGeoLocationAPI, me, bar), 1000);
    }
  }

  setLatLng(loc) {
    let me = this,
      deferred = new $.Deferred();

    new google.maps.Geocoder().geocode(
      {
        location: loc
      },
      (results, status) => {
        let filteredResults =
            results &&
            results.filter(
              r =>
                // exclude road name
                !_.includes(r.types, "route")
            ),
          addr;

        if (status !== google.maps.GeocoderStatus.OK) {
          window.alert(status);
          deferred.reject(status);
        } else {
          addr =
            filteredResults.length === 0
              ? "不明な住所"
              : GeoUtil.trimGeocoderAddress(
                  filteredResults[0].formatted_address
                );

          me.$location.val(addr);
          me.$location.attr("data-latitude", loc.lat());
          me.$location.attr("data-longitude", loc.lng());
          me.$location.blur();
          deferred.resolve();
        }
      }
    );

    return deferred.promise();
  }

  onSelModeChoosed(mode, data) {
    const me = this;

    window.console.log("InputController: onSelModeChoosed", mode, data);
    me.toggleSelModeList(false);

    if (mode === me.selMode.MAP) {
      me.selectLocationOnMap();
    } else if (mode === me.selMode.GEOCODE) {
      me.selectLocationByGeocodeResult(data);
    } else if (mode === me.selMode.TEXT) {
      me.selectLocationByText();
    } else if (mode === me.selMode.SPEECH) {
      me.selectLocationBySpeech();
    } else if (mode === me.selMode.CURRENT) {
      me.selectLocationByGeoLocation();
    }
  }

  selectLocationBySpeech() {
    let me = this,
      recognizer = new window.webkitSpeechRecognition(), // eslint-disable-line new-cap
      accepted,
      __ = _.bind(me.application.getMessage, me.application);

    recognizer.onresult = function(ev) {
      const result = ev.results.length > 0 ? ev.results[0] : null;

      if (result && result[0]) {
        me.$location.attr("placeholder", me.defaultPlaceholder);
        me.selectLocationByText(result[0].transcript);
        accepted = result[0];
      }
    };

    recognizer.onend = function() {
      if (!accepted) {
        window.alert(__("cannotRecognizeSpeech"));
        me.$location.attr("placeholder", me.defaultPlaceholder);
      }
    };

    me.$location.val("");
    me.$location.attr("placeholder", __("pleaseSpeak"));
    recognizer.lang = window.navigator.language;
    recognizer.start();
  }

  selectLocationByGeocodeResult(data) {
    const me = this;

    me.$location.val(data.address);
    me.$location.attr("data-latitude", data.position.lat);
    me.$location.attr("data-longitude", data.position.lng);
    me.$execBtn.focus();
    me.application.mapController.map.setCenter(
      new google.maps.LatLng(data.position.lat, data.position.lng)
    );
  }

  togglePanel(show) {
    let me = this,
      isVisible = me.$el.css("height") !== "50px",
      doShow = !isVisible && show !== false,
      doHide = isVisible && show !== true;

    if (doShow) {
      // me.$el.fadeIn();
      me.$el.removeClass("shrink");
    } else if (doHide) {
      // me.$el.fadeOut();
      me.$el.addClass("shrink");
    }
  }

  isCancellable() {
    let me = this,
      retVal = false;

    me.mapController.map.data.forEach(feature => {
      if (feature.getProperty("isResult") === true) {
        retVal = true;
        return false;
      }
      return true;
    });

    return retVal;
  }

  applyValues(values) {
    let me = this,
      $modes = me.$el.find("input[name=travelMode]"),
      deferred = new $.Deferred();

    me.setLatLng(values.origin).then(() => {
      me.$location.val(values.address);
      deferred.resolve();
    });
    me.$time.val(Math.round(values.time / 60));
    $modes.prop("checked", false);
    $modes.filter(`[value=${values.mode}]`).prop("checked", true);

    return deferred.promise();
  }

  getValues() {
    let me = this,
      latVal = +me.$location.attr("data-latitude"),
      lngVal = +me.$location.attr("data-longitude");

    return {
      address: me.$location.val(),
      origin:
        latVal && lngVal ? new google.maps.LatLng(latVal, lngVal) : undefined,
      time: +me.$time.val() * 60,
      mode: me.$el.find("input[name=travelMode]:checked").val()
    };
  }
}

export default InputController;
