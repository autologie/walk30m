define([
	'./GeoUtil.js',
	'./ProgressBar.js'
], function(GeoUtil, ProgressBar) {
	var minuteArray = _.range(1, 61).concat(_.map(_.range(1, 19), function(n) {
		return 60 + n * 10;
	})).concat(_.map(_.range(1, 7), function(n) {
		return 240 + n * 60;
	}));
	
	function initializeScroll() {
		// correct unnecessary scroll offset caused by software keyboard of iPhone.
		window.scrollTo(0, 0);
	}

	function InputController(application, $el, mapController) {
		var me = this;
		var optionTpl = _.template('<option value="{{num}}" {{selected}}>{{num}}</option>');

		me.mapController = mapController;
		me.application = application;
		me.getLocationWatchId = null;

		me.$el = $el;
		me.$selModeList = $el.find('.select');
		me.$location = $el.find('input[name=location]');
		me.$time = $el.find('[name=travelTime]');
		me.$execBtn = $el.find('.btn[role=execute]');
		me.$cancelBtn = $el.find('.glyphicon[role=cancel]');
		me.$time.append(_.map(minuteArray, function(n) {
			return optionTpl({ num: n, selected: n === 30? 'selected': '' });
		}).join(''));

		me.defaultPlaceholder = me.$location.attr('placeholder');

		if (!window.navigator.geolocation) {
			me.$selModeList.find('[data-selmode=' + me.selMode.CURRENT + ']').addClass('disabled');
		}

		me.initEvents();
	}

	InputController.prototype.initEvents = function() {
		var me = this;

		me.$selModeList.find('li[data-selmode]:not(.disabled)').click(function(ev) {
			var $target = $(ev.target),
				$li = $target.is('li')
					? $target
					: $target.parents('li');

			me.onSelModeChoosed($li.attr('data-selmode'));
		}).keydown(_.bind(me.onKeyDownSelModeListItem, me))
			.blur(_.bind(me.onBlurSelModeListItem, me));

		me.$location.focus(function() {
			me.toggleSelModeList(true);
		});
		me.$location.blur(_.bind(me.onBlurSelModeListItem, me));
		me.$location.keydown(_.bind(me.onKeydown, me));
		me.$location.change(function() {
			me.$location.removeAttr('data-latitude');
			me.$location.removeAttr('data-longitude');
		});
		me.$time.blur(initializeScroll);
	};
	
	InputController.prototype.onBlurSelModeListItem= function() {
		var me = this;

		_.defer(function() {
			initializeScroll();
			if (!me.$el.find(':focus').is('li')) {
				me.toggleSelModeList(false);
			}
		});
	};

	InputController.prototype.onKeydown = function(ev) {
		var me = this,
			$currentFocus,
			$items;

		if (ev.keyCode === 13) {
			// return
			me.$location.blur();
		} else if (ev.keyCode === 38 || ev.keyCode === 40) {
			// up or down
			$items = me.$selModeList.find('li');
			$currentFocus = $items.filter(':focus');

			me.$location.blur();
			$items.eq(ev.keyCode === 38? $items.length - 1: 0).focus();
			ev.preventDefault();

		} else {
			me.updateLocationCombo();
		}
	};

	InputController.prototype.onKeyDownSelModeListItem = function(ev) {
		var me = this,
			$target = $(ev.target),
			$items,
			$li = $target.is('li')
				? $target
				: $target.parents('li');

		if (ev.keyCode === 13) {
			me.onSelModeChoosed($li.attr('data-selmode'), me.extractSelModeListItemData($li));
		} else if (ev.keyCode === 38 || ev.keyCode === 40) {
			$items = me.$selModeList.find('li');
			$items.eq(($li.index() + (ev.keyCode === 38? -1: 1)) % $items.length).focus();
			ev.preventDefault();
		}
	};

	InputController.prototype.extractSelModeListItemData = function($item) {
		return {
			position: {
				lat: +$item.attr('data-latitude'),
				lng: +$item.attr('data-longitude')
			},
			address: $item.text()
		};
	};

	InputController.prototype.updateLocationCombo = _.debounce(function() {
		var me = this,
			val = me.$location.val(),
			selector = 'li[data-selmode=selmode-geocode]',
			tpl = _.template('<li tabindex="-1" data-selmode="selmode-geocode" data-latitude="{{lat}}" data-longitude="{{lng}}">{{address}}</li>');

		me.$selModeList.find(selector).remove();

		if (!val || val.length < 2) {
			return;
		}

		new google.maps.Geocoder().geocode({
			address: val
		}, function(results, status) {
			if (status === google.maps.GeocoderStatus.OK) {
				me.$selModeList.prepend(results.slice(0, 3).map(function(result) {
					return tpl({
						lat: result.geometry.location.lat(),
						lng: result.geometry.location.lng(),
						address: GeoUtil.trimGeocoderAddress(result.formatted_address)
					});
				}).join(''));

				me.$selModeList.find(selector).click(function(ev) {
					var $choosed = $(ev.target);

					me.onSelModeChoosed(me.selMode.GEOCODE, me.extractSelModeListItemData($choosed));
				}).keydown(_.bind(me.onKeyDownSelModeListItem, me))
					.blur(_.bind(me.onBlurSelModeListItem, me));
			}
		});
	}, 200);

	InputController.prototype.selMode = {
		TEXT: 'selmode-text',
		MAP: 'selmode-map',
		CURRENT: 'selmode-current',
		GEOCODE: 'selmode-geocode'
	};

	InputController.prototype.appendElementToLocationInput = function($el, fix) {
		var me = this,
			$loc = me.$location;

		fix = _.defaults(fix || {}, { top: 0, left: 0, width: 0 });

		$el.css({
			top: (fix.top + $loc.outerHeight()) + 'px',
			left: (fix.left + Math.round($loc.offset().left - ($loc.outerWidth() - $loc.width()) / 2)) + 'px',
			width: (fix.width + $loc.outerWidth()) + 'px'
		});
	};

	InputController.prototype.toggleSelModeList = function(show) {
		var me = this,
			isVisible = me.$selModeList.is(':visible'),
			doShow = !isVisible && (show !== false || show === true),
			doHide = isVisible && (show === false || show !== true),
			deferred = new $.Deferred();

		if (doShow) {
			me.appendElementToLocationInput(me.$selModeList, { left: -3 });
			me.$selModeList.fadeIn(undefined, function() {
				deferred.resolve();
			});
			_.delay(function() {
				me.$el.one('click', me.__bgClickHandler);
			}, 100);
		} else if (doHide) {
			me.$selModeList.fadeOut(undefined, function() {
				deferred.resolve();
			});
		}

		return deferred.promise();
	};

	InputController.prototype.selectLocationOnMap = function() {
		var me = this;

		me.togglePanel(false);
		me.mapController.specifyLocation(function(loc) {
			me.togglePanel(true);
			if (loc) {
				me.setLatLng(loc);
				me.$execBtn.focus();
			}
		});
	};

	InputController.prototype.selectLocationByText = function() {
		var me = this;

		me.$location.focus();
	};

	InputController.prototype.applyGeoLocationResult = function() {
		var me = this,
			__ = _.bind(me.application.getMessage, me.application);

		if (me.lastGeoLocationResult.code === 1) {
			window.alert(__('geolocationForbidden'));

		} else if (me.lastGeoLocationResult.code === 2) {
			window.alert(__('geolocationUnavailable'));

		} else if (me.lastGeoLocationResult.code === 3) {
			window.alert(__('geolocationFailure'));

		} else if (me.lastGeoLocationResult.coords) {
			crd = me.lastGeoLocationResult.coords;
			latLng = new google.maps.LatLng(crd.latitude, crd.longitude);
			me.setLatLng(latLng);
			me.mapController.map.panTo(latLng);

		} else {
			window.alert(__('geolocationError'));
		}
	};

	InputController.prototype.selectLocationByGeoLocation = function() {
		var me = this,
			crd, latLng, bar, $bar, initial = false;

		if (me.lastGeoLocationResult) {
			me.$location.attr('placeholder', me.defaultPlaceholder);
			me.applyGeoLocationResult(me.lastGeoLocationResult);
			me.$execBtn.focus();

		} else {
			if (!me.geoLocationWatchId) {
				initial = true;
				$bar = me.$location.parent().find('div[role=progressbar]');
				bar = new ProgressBar($bar);
				me.appendElementToLocationInput($bar, { top: 8, left: 7 });
				bar.update(99.9);
				me.$location.attr('placeholder', me.application.getMessage('geolocationDetecting'));
				_.delay(function() {
					me.geoLocationWatchId = window.navigator.geolocation.watchPosition(function(pos) {
						// on success
						me.lastGeoLocationResult = pos;
						bar.finalize();
					}, function(err) {
						// on error
						me.lastGeoLocationResult = err;
						bar.finalize();
					}, {
						enableHighAccuracy: true,
						maximumAge: 0,
						timeout: 5000
					});
				}, 500);
			}
			
			_.delay(function() {
				me.selectLocationByGeoLocation();
			}, initial? 500: 100);
		}
	};

	InputController.prototype.setLatLng = function(loc) {
		var me = this;
	
		new google.maps.Geocoder().geocode({
			location: loc
		}, function(results, status) {
				var filteredResults = results.filter(function(r) {
					// exclude road name
					return !_.contains(r.types, 'route');
				});

			if (status !== google.maps.GeocoderStatus.OK) {
				window.alert(status);
				return;
			} else if (filteredResults.length === 0) {
				addr = '不明な住所';
			} else {
				addr = GeoUtil.trimGeocoderAddress(filteredResults[0].formatted_address);
			}

			me.$location.val(addr);
			me.$location.attr('data-latitude', loc.lat());
			me.$location.attr('data-longitude', loc.lng());
			me.$location.blur();
		});
	};

	InputController.prototype.onSelModeChoosed = function(mode, data) {
		var me = this;
		
		me.toggleSelModeList(false);

		if (mode === me.selMode.MAP) {
			me.selectLocationOnMap();

		} else if (mode === me.selMode.GEOCODE) {
			me.selectLocationByGeocodeResult(data);

		} else if (mode === me.selMode.TEXT) {
			me.selectLocationByText();

		} else if (mode === me.selMode.CURRENT) {
			me.selectLocationByGeoLocation();
		}
	};

	InputController.prototype.selectLocationByGeocodeResult = function(data) {
		var me = this;

		me.$location.val(data.address);
		me.$location.attr('data-latitude', data.position.lat);
		me.$location.attr('data-longitude', data.position.lng);
		me.$execBtn.focus();
	};

	InputController.prototype.togglePanel = function(show) {
		var me = this,
			$header = me.$el.find('#app-header'),
			// isVisible = me.$el.is(':visible'),
			isVisible = me.$el.css('height') !== '50px',
			doShow = !isVisible && (show !== false),
			doHide = isVisible && (show !== true);

		if (doShow) {
			// me.$el.fadeIn();
			if (me.isCancellable()) {
				me.$cancelBtn.show();
			}
			$header.animate({ padding: '3.6em 0 0 120px', zoom: '100%' });
			$header.find('h1').animate({ marginTop: '1em' });
			me.$el.animate({ height: '100%' });
		} else if (doHide) {
			// me.$el.fadeOut();
			me.$cancelBtn.hide();
			$header.animate({ padding: '1em 0 0 60px', zoom: '60%' });
			$header.find('h1').animate({ marginTop: '0' });
			me.$el.animate({ height: '50px' });
		}
	};

	InputController.prototype.isCancellable= function() {
		var me = this,
			retVal = false;
		
		me.mapController.map.data.forEach(function(feature) {
			if (feature.getProperty('isResult') === true) {
				retVal = true;
				return false;
			}
		});

		return retVal;
	};

	InputController.prototype.getValues = function() {
		var me = this,
			latVal = +me.$location.attr('data-latitude'),
			lngVal = +me.$location.attr('data-longitude');

		return {
			address: me.$location.val(),
			origin: latVal && lngVal
				? new google.maps.LatLng(latVal, lngVal)
				: undefined,
			time: +me.$time.val() * 60,
			mode: me.$el.find('input[name=travelMode]:checked').val()
		};
	};

	return InputController;
});
