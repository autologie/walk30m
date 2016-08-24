define([
	'./CalculationService.js',
	'./Logger.js',
	'./GeoUtil.js',
	'./AdvancedSettingsController.js',
	'./ProgressBar.js',
	'./MapController.js',
	'./InputController.js'
], function(
	CalculationService,
	Logger,
	GeoUtil,
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

		$.get('https://hotsh9cqva.execute-api.ap-northeast-1.amazonaws.com/develop/client_location').done(function(data) {
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
		}).fail(function(err) {
			window.alert(err);
		});

	}
	
	Application.prototype.initEvents = function() {
		var me = this;

		me.calcService.addListener('complete', _.bind(me.onCompleteCalculation, me));
		me.calcService.addListener('progress', _.bind(me.onProgressCalculation, me));
		me.calcService.addListener('warn', _.bind(me.onWarning, me));

		me.$goToAboutLink.click(_.bind(me.onClickGoToAboutBtn, me));
		me.$goToAdvancedSettingsLink.click(_.bind(me.onClickGoToAdvancedSettingsBtn, me));
		me.$el.scroll(_.bind(me.onScroll, me));
		me.$gotoTopBtn.click(_.bind(me.scrollToTop, me));
		me.$sendMsgBtn.click(_.bind(me.onClickSendMsgBtn, me));
		me.$execBtn.click(_.bind(me.startCalculation, me));
		me.$cancelBtn.click(_.bind(me.viewMap, me));
		me.scrollToTop();
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

	Application.prototype.onWarning = function(message) {
		var me = this;

		if (window.confirm(me.getMessage('askIfReload'))) {
			window.location.reload();
		}
	};

	Application.prototype.onCompleteCalculation = function(vertices) {
		var me = this;

		me.progressBar.update(100);
	};

	Application.prototype.onScroll = _.throttle(function() {
		var me = this;

		if (me.$el.scrollTop() > 0) {
			me.$gotoTopBtn.fadeIn();
		} else {
			me.$gotoTopBtn.fadeOut();
		}
	}, 100);

	Application.prototype.onClickGoToAdvancedSettingsBtn = function(ev) {
		var me = this;

		ev.preventDefault();
		me.$page.animate({
			scrollTop: me.$el.find('#advanced-settings').offset().top + 'px'
		}, undefined, 'swing');
	};

	Application.prototype.onClickGoToAboutBtn = function(ev) {
		var me = this;

		ev.preventDefault();
		me.$page.animate({
			scrollTop: me.$el.find('#about').offset().top + 'px'
		}, undefined, 'swing');
	};

	Application.prototype.onClickSendMsgBtn = function() {
		var me = this,
			message = me.$el.find('#message textarea').val();

		if (message) {
			me.$sendMsgBtn.addClass('disabled');
			me.sendMessage(message).then(function() {
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

	Application.prototype.sendMessage = function(message) {
		var me = this;

		return $.ajax({
			type: 'POST',
			url: 'https://hotsh9cqva.execute-api.ap-northeast-1.amazonaws.com/develop/messages',
			contentType: 'application/json; charset=utf-8',
			data: JSON.stringify({
				message: message,
				url: window.location.href
			})
		}).done(function() {
			window.alert(me.getMessage('thanks'));
		}).fail(function() {
		});
	};

	Application.prototype.compareGeocoderResultsByDistance = function(r1, r2) {
		var me = this,
			center = me.mapController.map.getCenter();
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
						address: GeoUtil.trimeGeocoderAddress(sortedResults[0].formatted_address),
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
		me.calcService.stop();
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

	Application.prototype.startEditMessage = function(message) {
		var me = this;

		me.$message.val(message);
		me.$page.animate({
			scrollTop: me.$el.find('#message').offset().top + 'px'
		}, undefined, 'swing');
		me.$message.focus();
		if (message) {
			me.$message.attr('rows', 10);
		}
	};

	Application.prototype.getMessage = function(code) {
		var me = this;

		return me.messages[code];
	};

	return Application;
});

