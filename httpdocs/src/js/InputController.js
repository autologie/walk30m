/* eslint-disable import/no-extraneous-dependencies,import/no-unresolved */
import window from 'window';
import $ from 'jquery';
import _ from 'lodash';
import google from 'google';
import * as GeoUtil from './GeoUtil';
import ProgressBar from './ProgressBar';

const minuteArray = _.range(1, 61)
  .concat(_.map(_.range(1, 19), n => 60 + (n * 10)))
  .concat(_.map(_.range(1, 7), n => 240 + (n * 60)));

function initializeScroll() {
  // correct unnecessary scroll offset caused by software keyboard of iPhone.
  window.scrollTo(0, 0);
}

export default class InputController {
  constructor(application, $el, mapController) {
    const me = this;
    const defaultSelection = 30;
    const optionTpl = _.template('<option value="<%= num %>" <%= selected %>><%= num %></option>');
    const createOptionEl = n => optionTpl({
      num: n,
      selected: n === defaultSelection ? 'selected' : '',
    });

    this.selMode = {
      TEXT: 'selmode-text',
      MAP: 'selmode-map',
      CURRENT: 'selmode-current',
      GEOCODE: 'selmode-geocode',
      SPEECH: 'selmode-voice',
    };

    me.isSpeechAvailable = undefined !== window.webkitSpeechRecognition;
    me.mapController = mapController;
    me.application = application;
    me.getLocationWatchId = null;

    me.$el = $el;
    me.$selModeList = $el.find('.select');
    me.$location = $el.find('input[name=location]');
    me.$time = $el.find('[name=travelTime]');
    me.$execBtn = $el.find('.btn[role=execute]');
    me.$cancelBtn = $el.find('.glyphicon[role=cancel]');
    me.$time.append(_.map(minuteArray, createOptionEl).join(''));

    me.defaultPlaceholder = me.$location.attr('placeholder');
    this.updateLocationCombo = _.debounce(() => this.doUpdateLocationCombo(), 200);

    if (!me.isSpeechAvailable) {
      me.$selModeList.find(`[data-selmode=${me.selMode.SPEECH}]`).addClass('disabled');
    }
    if (!window.navigator.geolocation) {
      me.$selModeList.find(`[data-selmode=${me.selMode.CURRENT}]`).addClass('disabled');
    }

    me.initEvents();
  }

  initEvents() {
    const me = this;

    me.$selModeList.find('li[data-selmode]:not(.disabled)').click(ev => {
      const $target = $(ev.target);
      const $li = $target.is('li') ? $target : $target.parents('li');

      $li.blur(); // bug fix -> https://www.pivotaltracker.com/story/show/109711984
      me.onSelModeChoosed($li.attr('data-selmode'));
    }).keydown(_.bind(me.onKeyDownSelModeListItem, me))
      .blur(_.bind(me.onBlurSelModeListItem, me));

    me.$location.focus(() => {
      me.toggleSelModeList(true);

      if (window.matchMedia('(orientation: portrait)').matches) {
        _.delay(() => {
          me.application.$page.animate({
            scrollTop: `${Math.round(me.$location.offset().top - 10)}px`,
          }, 100);
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

    me.$location.removeAttr('data-latitude');
    me.$location.removeAttr('data-longitude');
  }

  onBlurSelModeListItem() {
    const me = this;

    _.defer(() => {
      initializeScroll();
      if (!me.$el.find(':focus').is('li')) {
        me.toggleSelModeList(false);
      }
    });
  }

  onKeydown(ev) {
    const me = this;
    let $items = null;

    if (ev.keyCode === 13) {
      // return
      me.$location.blur();
    } else if (ev.keyCode === 38 || ev.keyCode === 40) {
      // up or down
      $items = me.$selModeList.find('li');

      me.$location.blur();
      $items.eq(ev.keyCode === 38 ? $items.length - 1 : 0).focus();
      ev.preventDefault();
    } else {
      me.updateLocationCombo();
    }
  }

  onKeyDownSelModeListItem(ev) {
    const me = this;
    const $target = $(ev.target);
    const $li = $target.is('li') ? $target : $target.parents('li');
    let $items = null;

    if (ev.keyCode === 13) {
      me.onSelModeChoosed($li.attr('data-selmode'), me.extractSelModeListItemData($li));
    } else if (ev.keyCode === 38 || ev.keyCode === 40) {
      $items = me.$selModeList.find('li');
      $items.eq(($li.index() + (ev.keyCode === 38 ? -1 : 1)) % $items.length).focus();
      ev.preventDefault();
    }
  }

  extractSelModeListItemData($item) {
    return {
      position: {
        lat: +$item.attr('data-latitude'),
        lng: +$item.attr('data-longitude'),
      },
      address: $item.text(),
    };
  }

  doUpdateLocationCombo() {
    const me = this;
    const val = me.$location.val();
    const selector = 'li[data-selmode=selmode-geocode]';
    const tpl = _.template([
      '<li tabindex="-1" data-selmode="selmode-geocode"',
      'data-latitude="<%= lat %>" data-longitude="<%= lng %>">',
      '<%= address %>',
      '</li>',
    ].join(' '));

    me.$selModeList.find(selector).remove();

    if (!val || val.length < 2) {
      return;
    }

    new google.maps.Geocoder().geocode({
      address: val,
    }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK) {
        me.$selModeList.prepend(results.slice(0, 3).map(result => tpl({
          lat: result.geometry.location.lat(),
          lng: result.geometry.location.lng(),
          address: GeoUtil.trimGeocoderAddress(result.formatted_address),
        })).join(''));

        me.$selModeList.find(selector).click(ev => {
          const $choosed = $(ev.target);

          me.onSelModeChoosed(me.selMode.GEOCODE, me.extractSelModeListItemData($choosed));
        }).keydown(_.bind(me.onKeyDownSelModeListItem, me))
          .blur(_.bind(me.onBlurSelModeListItem, me));
      }
    });
  }

  appendElementToLocationInput($el, { top = 0, left = 0, width = 0 }) {
    const me = this;
    const $loc = me.$location;

    $el.css({
      top: `${top + $loc.outerHeight()}px`,
      left: `${left + Math.round($loc.offset().left - (($loc.outerWidth() - $loc.width()) / 2))}px`,
      width: `${width + $loc.outerWidth()}px`,
    });
  }

  toggleSelModeList(show) {
    const isVisible = this.$selModeList.is(':visible');
    const doShow = !isVisible && (show !== false || show === true);
    const doHide = isVisible && (show === false || show !== true);

    window.console.log('InputController: toggleSelModeList', doShow, doHide);

    return new Promise((resolve) => {
      if (doShow) {
        this.appendElementToLocationInput(this.$selModeList, { left: -3 });
        this.$selModeList.fadeIn(undefined, resolve);
      } else if (doHide) {
        this.$selModeList.fadeOut(undefined, resolve);
      }
    });
  }

  selectLocationOnMap() {
    const me = this;

    me.togglePanel(false);
    me.mapController.specifyLocation(loc => {
      me.togglePanel(true);
      if (!loc) return;

      me.setLatLng(loc);
      me.$execBtn.focus();
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
    const me = this;
    const msg = _.bind(me.application.getMessage, me.application);
    let crd = null;
    let latLng = null;

    if (me.lastGeoLocationResult.code === 1) {
      window.alert(msg('geolocationForbidden'));
    } else if (me.lastGeoLocationResult.code === 2) {
      window.alert(msg('geolocationUnavailable'));
    } else if (me.lastGeoLocationResult.code === 3) {
      window.alert(msg('geolocationFailure'));
    } else if (me.lastGeoLocationResult.coords) {
      crd = me.lastGeoLocationResult.coords;
      latLng = new google.maps.LatLng(crd.latitude, crd.longitude);
      me.setLatLng(latLng).then(() => {
        me.mapController.map.panTo(latLng);
        me.$location.attr('placeholder', me.defaultPlaceholder);
      });
    } else {
      window.alert(msg('geolocationError'));
    }
  }

  initGeoLocationAPI(progressBar) {
    const me = this;

    me.geoLocationWatchId = window.navigator.geolocation.watchPosition(pos => {
      // on success
      me.lastGeoLocationResult = pos;
      progressBar.finalize();
    }, err => {
      // on error
      me.lastGeoLocationResult = err;
      progressBar.finalize();
    }, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000,
    });

    me.selectLocationByGeoLocation();
  }

  selectLocationByGeoLocation() {
    const me = this;
    let bar = null;
    let $bar = null;

    if (me.lastGeoLocationResult) {
      me.applyGeoLocationResult(me.lastGeoLocationResult);
    } else if (me.geoLocationWatchId) {
      _.delay(_.bind(me.selectLocationByGeoLocation, me), 100);
    } else {
      $bar = me.$location.parent().find('div[role=progressbar]');
      bar = new ProgressBar($bar);
      me.appendElementToLocationInput($bar, { top: 8, left: 7 });
      bar.update(99.9);
      me.$location.attr('placeholder', me.application.getMessage('geolocationDetecting'));

      _.delay(_.bind(me.initGeoLocationAPI, me, bar), 1000);
    }
  }

  setLatLng(location) {
    const $location = this.$location;

    return new Promise((resolve, reject) => {
      new google.maps.Geocoder().geocode({ location }, (results, status) => {
        const filteredResults = results
          && results.filter(r => !_.includes(r.types, 'route')); // exclude road name
        if (status !== google.maps.GeocoderStatus.OK) {
          window.alert(status);
          reject(status);
        } else {
          const addr = filteredResults.length === 0
            ? '不明な住所'
            : GeoUtil.trimGeocoderAddress(filteredResults[0].formatted_address);

          $location.val(addr);
          $location.attr('data-latitude', location.lat());
          $location.attr('data-longitude', location.lng());
          $location.blur();
          resolve();
        }
      });
    });
  }

  onSelModeChoosed(mode, data) {
    const me = this;

    window.console.log('InputController: onSelModeChoosed', mode, data);
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
    const me = this;
    /* eslint-disable new-cap */
    const recognizer = new window.webkitSpeechRecognition();
    const msg = _.bind(me.application.getMessage, me.application);
    let accepted = null;

    recognizer.onresult = ev => {
      const result = ev.results.length > 0 ? ev.results[0] : null;

      if (result && result[0]) {
        me.$location.attr('placeholder', me.defaultPlaceholder);
        me.selectLocationByText(result[0].transcript);
        accepted = result[0];
      }
    };

    recognizer.onend = () => {
      if (!accepted) {
        window.alert(msg('cannotRecognizeSpeech'));
        me.$location.attr('placeholder', me.defaultPlaceholder);
      }
    };

    me.$location.val('');
    me.$location.attr('placeholder', msg('pleaseSpeak'));
    recognizer.lang = window.navigator.language;
    recognizer.start();
  }

  selectLocationByGeocodeResult({ address, position }) {
    const me = this;
    const selectedLoc = new google.maps.LatLng(position.lat, position.lng);

    me.$location.val(address);
    me.$location.attr('data-latitude', position.lat);
    me.$location.attr('data-longitude', position.lng);
    me.$execBtn.focus();
    me.application.mapController.map.setCenter(selectedLoc);
  }

  togglePanel(show) {
    const isVisible = this.$el.css('height') !== '50px';
    const doShow = !isVisible && (show !== false);
    const doHide = isVisible && (show !== true);

    if (doShow) {
      this.$el.removeClass('shrink');
    } else if (doHide) {
      this.$el.addClass('shrink');
    }
  }

  isCancellable() {
    const me = this;
    let retVal = false;

    me.mapController.map.data.forEach(feature => {
      if (feature.getProperty('isResult') === true) {
        retVal = true;
        return false;
      }
      return true;
    });

    return retVal;
  }

  applyValues(values) {
    const me = this;
    const $modes = me.$el.find('input[name=travelMode]');
    const deferred = new $.Deferred();

    me.setLatLng(values.origin).then(() => {
      me.$location.val(values.address);
      deferred.resolve();
    });
    me.$time.val(Math.round(values.time / 60));
    $modes.prop('checked', false);
    $modes.filter(`[value=${values.mode}]`).prop('checked', true);

    return deferred.promise();
  }

  getValues() {
    const me = this;
    const latVal = +me.$location.attr('data-latitude');
    const lngVal = +me.$location.attr('data-longitude');

    return {
      address: me.$location.val(),
      origin: latVal && lngVal
        ? new google.maps.LatLng(latVal, lngVal)
        : undefined,
      time: +me.$time.val() * 60,
      mode: me.$el.find('input[name=travelMode]:checked').val(),
    };
  }
}
