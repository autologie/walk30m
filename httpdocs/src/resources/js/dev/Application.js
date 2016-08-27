'use strict';

define([
	'window',
	'jQuery',
	'underscore',
	'google',
	'./CalculationService.js',
	'./Logger.js',
	'./GeoUtil.js',
	'./Walk30mUtils.js',
	'./AdvancedSettingsController.js',
	'./ProgressBar.js',
	'./MapController.js',
	'./InputController.js'
], function(
	window,
	$,
	_,
	google,
	CalculationService,
	Logger,
	GeoUtil,
	Walk30mUtils,
	AdvancedSettingsController,
	ProgressBar,
	MapController,
	InputController) {
	
	function Application($el) {
		var me = this,
			startDate = new Date();
		
		me.messages = window.messages;
		me.$el = $el;
		me.$page = $('html,body');
		me.$gotoTopBtn = $el.find('.btn[role=goto-top]');
		me.$execBtn = $el.find('.btn[role=execute]');
		me.$cancelBtn = $el.find('#control span[role=cancel]');
		me.$sendMsgBtn = $el.find('.btn[role=send-message]');
		me.$goToAboutLink = $el.find('a[href=#about]');
		me.$message = $el.find('#message textarea');
		me.$goToAdvancedSettingsLink = $el.find('a[href=#advanced-settings]');
		me.calcService = new CalculationService();
		me.logger = new Logger(me.calcService);
		me.advancedSettingsController = new AdvancedSettingsController($el.find('#advanced-settings'));
	
		$el.find('#extra').css({ top: Math.min($(window).height(), 700) + 'px' });
		me.initEvents();

		$.get(PUBLIC_API_URL_BASE + '/client_location').done(function(data) {
			me.mapController = new MapController(me, $el.find('#map-wrapper'), {
				center: new google.maps.LatLng(data.lat, data.lng)
			});
			me.inputController = new InputController(
				me,
				$el.find('#control'),
				me.mapController
			);
			me.progressBar = new ProgressBar($el.find('#progressbar'));
			console.log('Application: initialized', new Date() - startDate);

			me.route();
		}).fail(function(err) {
			window.alert(err);
		});
	}
	
	Application.prototype.route = function() {
		var me = this,
			parseQuery = function(s) {
				var ret = s.split('=');
				
				return [
					ret[0],
					window.decodeURIComponent(ret[1])
				];
			},
			splittedHash = window.location.hash.split('?'),
			path = splittedHash[0].split('/')[1],
			query = _.object((splittedHash[1] || '').split('&').map(parseQuery));

		if (path === 'calc') {
			me.startCalcByQuery(query.request);
		} else if (path === 'result') {
			me.startViewResult(query.path, query.request);
		} else {
			me.moveTo(path);
		}
	};

	Application.prototype.startViewResult = function(path, request) {
		var me = this,
			decoded;

		try {
			request = JSON.parse(request);
			decoded = Walk30mUtils.decodeResult(path);

			me.inputController.applyValues(_.defaults({
				origin: new google.maps.LatLng(request.origin.lat, request.origin.lng)
			}, request)).then(function() {
				me.advancedSettingsController.applyValues(request);

				me.$cancelBtn.show();
				me.mapController.resultVisualizer.addResult({
					taskId: 'viewonly',
					vertices: new google.maps.MVCArray(decoded.map(function(latLng) {
						return {
							endLocation: new google.maps.LatLng(latLng.lat, latLng.lng)
						};
					})),
					config: request
				});
				me.viewMap();

			});
		} catch (ex) {
			window.alert(me.getMessage('brokenResult'));
			window.history.pushState(null, '', '/#!/');
		}
	};

	Application.prototype.startCalcByQuery = function(req) {
		var me = this;

		try {
			req = JSON.parse(req);
			if (req && req.origin) {
				me.inputController.applyValues(_.defaults({
					origin: new google.maps.LatLng(req.origin.lat, req.origin.lng)
				}, req)).then(function() {
					me.advancedSettingsController.applyValues(req);
					me.startCalculation();
				});
			} else {
				throw new Error('Not sufficient parameters provided.');
			}
		} catch(ex) {
			window.history.pushState(null, '', '/#!/');
		}
	};

	Application.prototype.initEvents = function() {
		var me = this;

		me.calcService.addListener('start', _.bind(me.onStartCalculation, me));
		me.calcService.addListener('complete', _.bind(me.onCompleteCalculation, me));
		me.calcService.addListener('progress', _.bind(me.onProgressCalculation, me));
		me.calcService.addListener('warn', _.bind(me.onWarning, me, me.calcService));
		me.calcService.addListener('error', _.bind(me.onError, me, me.calcService));

		me.$goToAboutLink.click(_.bind(me.onClickGoToAboutBtn, me));
		me.$goToAdvancedSettingsLink.click(_.bind(me.onClickGoToAdvancedSettingsBtn, me));
		me.$el.scroll(_.bind(me.onScroll, me));
		me.$gotoTopBtn.click(_.bind(me.moveTo, me, 'top'));
		me.$sendMsgBtn.click(_.bind(me.onClickSendMsgBtn, me));
		me.$execBtn.click(_.bind(me.startCalculation, me));
		me.$cancelBtn.click(_.bind(me.viewMap, me));
	};

	Application.prototype.onStartCalculation = function(task) {
		var me = this,
			serializedCalculation = window.encodeURIComponent(JSON.stringify(task.serialize().config));

		window.history.pushState(null, '', '/#!/calc?request=' + serializedCalculation);
	};

	Application.prototype.viewMap = function() {
		var me = this;

		me.inputController.togglePanel(false);
		me.mapController.startView(function() {
			me.inputController.togglePanel(true);
		});
	};

	Application.prototype.onProgressCalculation = function(percent, vertices) {
		var me = this;

		me.progressBar.update(percent);
	};

	Application.prototype.onError= function(calcService, message) {
		var me = this;

		window.alert([
			me.getMessage('pleaseCheckConditions'),
			message
		].join('\r\n'));
		me.onExitCalculation();
	};

	Application.prototype.onWarning = function(calcService, message) {
		var me = this;

		if (me.lastDenialReload
				&& new Date() - me.lastDenialReload < 60000) {
			return;
		}

		if (window.confirm(me.getMessage('askIfReload'))) {
			calcService.stop();
			window.location.reload();
		} else {
			me.lastDenialReload = new Date();
		}
	};

	Application.prototype.onCompleteCalculation = function(vertices, task) {
		var me = this,
			feature = new google.maps.Data.Feature({
				geometry: new google.maps.Data.Polygon([
					_.collect(vertices.getArray(), 'endLocation')
				]),
				id: task.taskId,
				properties: _.defaults({
					isResult: true,
					vertices: task.vertices.getArray().slice(0),
					task: task
				}, task)
			}),
			resultUrl = Walk30mUtils.createSharedURI(feature),
			newPath = '/' + (resultUrl || '').split('/').slice(3).join('/');

		me.progressBar.update(100);
		window.history.pushState(null, '', newPath);
	};

	Application.prototype.onScroll = _.throttle(function() {
		var me = this;

		if (me.$el.scrollTop() > 0) {
			me.$gotoTopBtn.fadeIn();
		} else {
			me.$gotoTopBtn.fadeOut();
		}
	}, 100);

	Application.prototype.moveTo = function(id) {
		var me = this,
			$target = id && me.$el.find('#' + id);

		if (id !== 'top' && $target && $target.length > 0) {
			me.$page.animate({
				scrollTop: $target.offset().top + 'px'
			}, undefined, 'swing', function() {
				window.history.pushState(null, '', '/#!/' + id);
			});
		} else {
			me.scrollToTop(function() {
				window.history.pushState(null, '', '/#!/');
			});
		}
	};

	Application.prototype.onClickGoToAdvancedSettingsBtn = function(ev) {
		var me = this;

		ev.preventDefault();
		me.moveTo('advanced-settings');
	};

	Application.prototype.onClickGoToAboutBtn = function(ev) {
		var me = this;

		ev.preventDefault();
		me.moveTo('about');
	};

	Application.prototype.onClickSendMsgBtn = function() {
		var me = this,
			message = me.$el.find('#message textarea').val(),
			uuid = me.$el.find('#message input[name=uuid]').val();

		if (message) {
			me.$sendMsgBtn.addClass('disabled');
			me.sendMessage(message, uuid).then(function() {
					_.delay(function() {
						me.$sendMsgBtn.removeClass('disabled');
					}, 500);
			});
		} else {
			window.alert(me.getMessage('contact'));
		}
	};

	Application.prototype.scrollToTop = function(callback) {
		var me = this,
			fired = false;

		me.$gotoTopBtn.blur();
		me.$page.animate({ scrollTop: '0px' }, undefined, function() {
			// this event fires twice, for the fact that
			// the selector for me.$page matches two elements: html and body.
			if (!fired && _.isFunction(callback)) {
				fired = true;
				callback();
			}
		});
	};

	Application.prototype.sendMessage = function(message, uuid) {
		var me = this;

		return $.ajax({
			type: 'POST',
			url: PUBLIC_API_URL_BASE + '/messages',
			contentType: 'application/json; charset=utf-8',
			data: JSON.stringify({
				message: uuid + ', ' + message,
				url: window.location.href
			})
		}).done(function() {
			window.alert(me.getMessage('thanks'));
		}).fail(function() {
			window.alert(me.getMessage('failedToSendMessage'));
		});
	};

	Application.prototype.compareGeocoderResultsByDistance = function(r1, r2) {
		var me = this,
			center = me.mapController.map.getCenter(),
			loc1 = r1.geometry.location,
			loc2 = r2.geometry.location,
			r1Dist = Math.pow(loc1.lat() - center.lat(), 2) + Math.pow(loc1.lng() - center.lng(), 2),
			r2Dist = Math.pow(loc2.lat() - center.lat(), 2) + Math.pow(loc2.lng() - center.lng(), 2);

			return r1Dist > r2Dist? 1: -1;
	};

	Application.prototype.startCalculation = function() {
		var me = this,
			settings = _.defaults(
				me.inputController.getValues(),
				me.advancedSettingsController.getValues());

		me.scrollToTop(function() {
			if (settings.origin) {
				me.doCalculation(settings);
			} else if (settings.address) {
				new google.maps.Geocoder().geocode({
					address: settings.address
				}, function(results, status) {
					var sortedResults = results.sort(_.bind(me.compareGeocoderResultsByDistance, me));

					if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
						window.alert(me.getMessage('geocoderResultNotFound'));
						return;
					} else if (status !== google.maps.GeocoderStatus.OK) {
						window.alert(status);
						return;
					}

					me.doCalculation(_.defaults({
						origin: sortedResults[0].geometry.location,
						address: GeoUtil.trimGeocoderAddress(sortedResults[0].formatted_address),
						keyword: settings.address
					}, settings));
				});
			} else {
				window.alert(me.getMessage('originLocationIsRequired'));
				me.inputController.$location.focus();
			}
		});
	};

	Application.prototype.onExitCalculation = function(complete) {
		var me = this;

		me.inputController.togglePanel(true);
		window.history.pushState(null, '', '/#!/');
		me.progressBar.finalize();
		if (complete) {
			me.$cancelBtn.show();
		}
	};

	Application.prototype.doCalculation = function(settings) {
		var me = this;

		me.inputController.togglePanel(false);
		me.progressBar.update(0);
		me.calcService.start(_.defaults(settings, {
			anglePerStep: ({
				SPEED: 20,
				BALANCE: 10,
				PRECISION: 5
			})[settings.preference]
		}));

		me.mapController.startCalculation(me.calcService, _.bind(me.onExitCalculation, me));
	};

	Application.prototype.startEditMessage = function(message, relatedResultId) {
		var me = this;

		me.$el.find('#message input[name=uuid]').val(relatedResultId);
		me.$message.val(message);
		me.$message.focus();
		if (message) {
			me.$message.attr('rows', 10);
		}
		me.moveTo('message');
	};

	Application.prototype.getMessage = function(code) {
		var me = this;

		return me.messages[code];
	};

	return Application;
});

