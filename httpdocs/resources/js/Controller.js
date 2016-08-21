(function(window, document, $, _, google, _bspline, GeoUtil, CalculationService, GNaviService, ObjectManager) {
'use strict';

_.templateSettings = {
	interpolate: /\{\{(\w+?)\}\}/g
};

function Footprint(objectManager, latLng) {
	var me = this;
	
	me.angle = 90;
	me.stepCount = 0;

	me.marker = objectManager.showObject(new google.maps.Marker({
		position: latLng,
		icon: me.createIconOption(),
		zIndex: 10000
	}));
	
	me.timer = window.setInterval(function() {
		me.stepCount++;
		me.marker.setIcon(me.createIconOption());
	}, 500);
}

Footprint.prototype.getMarker = function() { return this.marker; };

Footprint.prototype.stop = function() {
	var me = this;
	
	me.marker.setIcon(me.createIconOption(true));
	window.clearInterval(me.timer);
};

Footprint.prototype.createIconOption = function(stop) {
	var me = this;
	
	return {
		path: stop
			? 'M 33.25 16.025278207000508 C 32.0125 16.01137519315023 29.875 17.125 28.5 18.5 C 26.944444444444443 20.055555555555557 26 22.133333333333333 26 24 C 26 25.65 26.718232309083987 29.1375 27.59607179796442 31.75 C 28.817051115483906 35.38370354993694 28.934556004964225 37.02877200266145 28.09607179796442 38.75 C 27.49323230908399 39.9875 27 41.9 27 43 C 27 44.1 27.9 45.45 29 46 C 30.1 46.55 31.5625 46.79335988647727 32.25 46.54079974772727 C 32.9375 46.28823960897727 34.244611443600775 44.60073960897727 35.154692096890614 42.79079974772727 C 36.06477275018045 40.98085988647727 37.29976312969924 37.7 37.89911516248792 35.5 C 38.49846719527659 33.3 39.006023382671565 28.8 39.02701780114341 25.5 C 39.05552142071855 21.019668967058752 38.61369715435026 19.063165635728122 37.28259473554611 17.775278207000508 C 36.30216763099575 16.826681220850787 34.4875 16.039181220850786 33.25 16.025278207000508 Z M 15.25 18.025278207000508 C 14.0125 18.01137519315023 12.029399448381973 19.0125 10.843109885293275 20.25 C 9.06600455055934 22.103820450048765 8.782723188934392 23.29235909990247 9.234286149351865 27 C 9.535722657672789 29.475 10.956323209290815 34.0875 12.39117626405859 37.25 C 13.826029318826365 40.4125 16.0125 43.697443923338966 17.25 44.54987538519771 C 18.4875 45.402306847056444 20.4 45.96020979614915 21.5 45.789659716514834 C 22.773760289505443 45.59216888123285 23.610306095530625 44.57547853664944 23.803773241635348 42.989784331317125 C 23.970848524534787 41.62040294909271 23.408348524534787 39.0375 22.553773241635348 37.25 C 21.64498244521012 35.34909836954499 21.01353030910185 31.40558005856733 21.03259473554611 27.75 C 21.057182515417388 23.035323791686757 20.6272918537451 21.07631897554676 19.28259473554611 19.775278207000508 C 18.302167630995747 18.826681220850787 16.4875 18.039181220850786 15.25 18.025278207000508 Z '
			: me.stepCount % 2 === 0
				? 'M 6.75 0.9674052644538893 C 5.512499999999999 0.9494781599035285 3.7238751931502287 1.7369781599035283 2.7752782070005075 2.7174052644538893 C 1.537811369197653 3.996395232246864 1.0449905640558672 6.195073224589727 1.0308551414032063 10.5 C 1.0200194414744117 13.8 1.5015328047234089 18.3 2.1008848375120888 20.5 C 2.7002368703007686 22.7 3.9352272498195546 25.980859886477273 4.84530790310939 27.790799747727274 C 5.755388556399225 29.600739608977275 7.0625 31.288239608977275 7.75 31.540799747727274 C 8.4375 31.793359886477273 9.9 31.55 11 31 C 12.1 30.45 13 29.1 13 28 C 13 26.9 12.50676769091601 24.9875 11.90392820203558 23.75 C 11.065443995035771 22.028772002661448 11.182948884516094 20.383703549936946 12.40392820203558 16.75 C 13.281767690916011 14.1375 14 10.65 14 9 C 14 7.133333333333333 13.055555555555555 5.055555555555555 11.5 3.5 C 10.125 2.125 7.987500000000001 0.9853323690042503 6.75 0.9674052644538893 Z M 22.75 18.967405264453888 C 21.5125 18.949478159903528 19.723875193150228 19.73697815990353 18.775278207000508 20.717405264453888 C 17.523506201306184 22.01118040924059 17.043624674242828 24.213862596654838 17.025278207000508 28.75 C 17.010964011861812 32.289163976901435 16.326076083975728 36.409634732011256 15.44622675836466 38.25 C 14.591651475465222 40.0375 14.029151475465222 42.62040294909271 14.19622675836466 43.989784331317125 C 14.389693904469379 45.57547853664944 15.226239710494553 46.592168881232844 16.5 46.789659716514834 C 17.6 46.960209796149144 19.5125 46.40230684705644 20.75 45.5498753851977 C 21.9875 44.697443923338966 24.173970681173635 41.4125 25.60882373594141 38.25 C 27.043676790709185 35.0875 28.46427734232721 30.475 28.765713850648137 28 C 29.21727681106561 24.29235909990247 28.933995449440662 23.103820450048765 27.156890114706727 21.25 C 25.970600551618027 20.0125 23.9875 18.98533236900425 22.75 18.967405264453888 Z '
				: 'M 23.25 1.025278207000508 C 22.0125 1.0113751931502286 19.875 2.125 18.5 3.5 C 16.944444444444443 5.055555555555555 16 7.133333333333333 16 9 C 16 10.65 16.718232309083987 14.1375 17.59607179796442 16.75 C 18.817051115483906 20.383703549936943 18.934556004964225 22.028772002661448 18.09607179796442 23.75 C 17.49323230908399 24.9875 17 26.9 17 28 C 17 29.1 17.9 30.45 19 31 C 20.1 31.55 21.5625 31.793359886477273 22.25 31.54079974772727 C 22.9375 31.288239608977268 24.244611443600775 29.600739608977268 25.154692096890614 27.79079974772727 C 26.06477275018045 25.980859886477273 27.299763129699233 22.7 27.89911516248791 20.5 C 28.49846719527659 18.3 29.006023382671565 13.8 29.02701780114341 10.5 C 29.05552142071855 6.019668967058752 28.613697154350263 4.063165635728123 27.28259473554611 2.7752782070005075 C 26.302167630995747 1.8266812208507872 24.4875 1.0391812208507871 23.25 1.025278207000508 Z M 7.25 19.025278207000508 C 6.012499999999999 19.01137519315023 4.029399448381974 20.0125 2.843109885293275 21.25 C 1.066004550559339 23.103820450048765 0.782723188934392 24.29235909990247 1.234286149351865 28 C 1.535722657672788 30.475 2.9563232092908143 35.0875 4.39117626405859 38.25 C 5.826029318826366 41.4125 8.0125 44.697443923338966 9.25 45.54987538519771 C 10.4875 46.402306847056444 12.4 46.96020979614915 13.5 46.789659716514834 C 14.773760289505443 46.59216888123285 15.610306095530625 45.57547853664944 15.803773241635348 43.989784331317125 C 15.970848524534787 42.62040294909271 15.408348524534787 40.0375 14.553773241635348 38.25 C 13.644982445210116 36.34909836954499 13.013530309101847 32.40558005856733 13.032594735546109 28.75 C 13.057182515417391 24.03532379168675 12.6272918537451 22.07631897554676 11.282594735546109 20.775278207000508 C 10.302167630995749 19.826681220850787 8.4875 19.039181220850786 7.25 19.025278207000508 Z ',
		fillColor: '#233f5b',
		fillOpacity: 1,
		strokeWeight: 0,
		rotation: me.angle,
		scale: 1,
		anchor: new google.maps.Point(15, 24)
	};
};

Footprint.prototype.setAngle = function(angle) { this.angle = angle; };

function Controller() {
	var me = this,
		loc,
		queryParams = window.location.search.replace('?', '').split('&'),
		options = _.object(queryParams.map(function(q) { return q.split('='); })),
		$search = $('#control-search');
	
	me.longPressStart = null;
	me.map = null;
	me.geoCoder = new google.maps.Geocoder();
	me.progressBar = new ProgressBar($('#progressbar'));

	window.onInput = function(ev) { me.onInput(ev); };
	window.calc = function() {
		if (me.address === $search.val()) {
			me.calcByLatLng(me.calculation.origin);
		} else {
			me.calcByAddress($search.val());
		}
	};
	window.askIfCancel = function(ev) { me.askIfCancel(ev); };
	window.save_config = function() { me.save_config(); };
	window.toggle_config = function(ev) { me.toggle_config(ev); };
	window.closeWindow = function(ev) {
		$(ev.target).parents('.floating').hide('fast');
	};
	
	me.initGNavi();
	
	if (options.origin) {
		loc = options.origin.split(',');
		$('#control-time').val(options.time.replace('m', '') || 30);
		$('#control-travelmode').val(options.travelmode || 'WALKING');
		me.initMap(new google.maps.LatLng(loc[0], loc[1]));
		
	} else if (window.navigator.geolocation) {
		window.navigator.geolocation.getCurrentPosition(function(pos) {
			var latLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
			
			me.geoCoder.geocode({
				location: latLng
			}, function(results, status) {
				var addr;
				
				if (status === google.maps.GeocoderStatus.OK) {
					addr = results[0].formatted_address.replace(/日本,\s*/, '');
					
					$search.val(addr);
				}
				me.initMap(latLng);
			});
		}, function() {
			me.initDefault();
		});
	} else {
		me.initDefault();
	}
}

Controller.prototype = new google.maps.MVCObject();

function ProgressBar($el) {
	this.$el = $el;
	$el.append('<div class="progress"><div class="inner"></div></div>');
}

ProgressBar.prototype.finalize = function() {
	var me = this;

	me.$el.fadeOut(undefined, function() {
		me.$el.find('.progress').css({ width: 0 });
	});
};

ProgressBar.prototype.update = _.throttle(function(percent) {
	var $el = this.$el,
		me = this;

	if ($el.is(':visible')) {
		$el.find('.progress').animate({ width: percent + '%' }, 1000, function() {
			if (percent === 100) {
				me.finalize();	
			}
		});
	} else {
		$el.fadeIn(undefined, function() { me.update(percent); });
	}
}, 1000);

Controller.prototype.initGNavi = function($target, speed) {
	var me = this,
		gNavi = new GNaviService(),
		$categorySelect = $('#restaurant-categories');
	
	function setDisabled() {
		if ($('input[name=restaurant]:checked').val() === 'on') {
			$categorySelect.removeAttr('disabled');
		} else {
			$categorySelect.attr('disabled', 'disabled');
		}
	}
	
	$('input[name=restaurant]').change(setDisabled);
	setDisabled();
	
	gNavi.getCategories(function(result) {
		if (result) {
			_.each(result.category_l, function(r) {
				$('<option />')
					.attr('name', 'restaurant-category')
					.val(r.category_l_code)
					.text(r.category_l_name)
					.appendTo($categorySelect);
			});
			$categorySelect.val('RSFST18000');	// カフェを初期選択
			
		} else {
			me.showMessage('エラー', '飲食店表示機能の初期化に失敗しました。');
		}
	});
};

Controller.prototype.showModal = function($target, speed) {
	$('#mask').show();
	$target.show(speed || 'fast');
};

Controller.prototype.setStatus = function(message) {
	return;
	$("#status").text(message);
};

Controller.prototype.onComplete = function(result) {
	var me = this,
		vertices = _.collect(me.calculation.vertices.getArray(), 'endLocation'),
		range = GeoUtil.lngToMeter(GeoUtil.distance(vertices[0], vertices[vertices.length - 1]), vertices[0].lat());
	
	me.showGNaviData(vertices[0], range, function() {
		range = GeoUtil.lngToMeter(GeoUtil.distance(vertices[1], vertices[0]), vertices[1].lat());
		
		me.showGNaviData(vertices[1], range, function() {
			me.footprint.stop();
			me.setStatus('完了（' + Math.round(result.timeConsumed / 1000) + '秒）');
			me.objectManager.clearObjects('result');
			me.objectManager.drawArea(vertices, {		
				strokeOpacity: 0.5,
				fillOpacity: 0.2
			});
			$('#control-stop').hide();
			$('#control-recalculate').val('再計算').show();
		});
	});

	me.progressBar.update(100);
};

Controller.prototype.onRequest = function(opts) {
	var me = this;
	
	me.objectManager.showObject(new google.maps.Marker({
		position: opts.destination,
		icon: {
			scale: 4,
			fillColor: '#c44',
			fillOpacity: 0.3,
			path: google.maps.SymbolPath.CIRCLE,
			strokeWeight: 2,
			strokeColor: '#c44',
			strokeOpacity: 0.5
		},
		zIndex: 100
	}), 'debug');
};

Controller.prototype.onError = function(message) {
	var me = this;
	
	me.showMessage('Oops! 失敗!! ', message);
};

Controller.prototype.onWarning = function(code) {
	var me = this,
		calc = me.calculation;
	
	if (code === 'FREQUENT_OVER_QUERY_LIMIT' && !me.isMessageShown()) {
		me.showMessage('情報', '計算に時間がかかる場合はページを再読み込みします。それでも改善しない場合、しばらく間を置いて再度お試しください。', {
			'このまま待つ': function() {},
			'再読み込み': function() {
				window.location.href = _.template('{{path}}?origin={{lat}},{{lng}}&time={{time}}m&travelmode={{mode}}&z={{zoom}}')({
					path: window.location.pathname,
					lat: calc.origin.lat(),
					lng: calc.origin.lng(),
					time: Math.round(calc.time / 60),
					mode: calc.mode,
					zoom: me.map.getZoom()
				});
			}
		});
	}
};

Controller.prototype.initCalc = function(latLng, address, time, mode, initial) {
	var me = this,
		calc = new CalculationService({
			map: me.map,
			initial: !!initial,
			$directionPanel: $('#route-detail div.body'),
			origin: latLng,
			address: address,
			enableTollRoad: $('input[name=tollroad]:checked').length > 0,
			time: time * 60,
			mode: mode,
			anglePerStep: (function(preference) {
				return preference === 'precision'? 5: preference === 'normal'? 10: 20;
				
			})($('input[name=preference]:checked').val())
		});
	
	me.objectManager.clearObjects();
	me.address = address;
	
	me.setStatus('計算中...');
	me.progressBar.update(0);
	$('#route-detail').hide('fast');
	$('#control-recalculate').hide();
	$('#control-stop').show();
	
	me.showStartLocation(latLng, address);

	calc.addListener('request', function(opts) { me.onRequest(opts); });
	calc.addListener('error', function(message) { me.onError(message); });
	calc.addListener('warning', function(code) { me.onWarning(code); });
	calc.addListener('progress', (function(noUserOperation, manuallyZoomChanged) {
		google.maps.event.addListener(me.map, 'dragstart', function() { noUserOperation = false; });
		google.maps.event.addListener(me.map, 'click', function() { noUserOperation = false; });
		google.maps.event.addListener(me.map, 'mousedown', function() { noUserOperation = false; });
		google.maps.event.addListener(me.map, 'zoom_changed', function() { if (manuallyZoomChanged) { noUserOperation = false; } });
		
		return function() {
			var bounds;
			
			me.showProgress.apply(me, arguments);

			if (noUserOperation) {
				bounds = new google.maps.LatLngBounds(latLng, new google.maps.LatLng(latLng.lat() + 0.0001, latLng.lng() + 0.0001));
				calc.vertices.forEach(function(v) {
					bounds
						.extend(v.endLocation)
						.extend(GeoUtil.divide(latLng, v.endLocation, -1));
				});
				manuallyZoomChanged = false;
				me.map.fitBounds(bounds);
				window.setTimeout(function() { manuallyZoomChanged = true; }, 100);
			}
		};
	})(true, true));
	calc.addListener('complete', function(result) { me.onComplete(result); });
	
	if (me.calculation) {
		me.calculation.dispose();
	}
	
	me.calculation = calc;
	calc.start();
};

Controller.prototype.drawRoute = function(route) {
	var me = this,
		outline = me.objectManager.showObject(new google.maps.Polyline({
			path: route.step.concat_path,
			strokeOpacity: 0,
			strokeWeight: 72,
			zIndex: 2000
		}), 'path'),
		polyline = me.objectManager.showObject(new google.maps.Polyline({
			path: route.step.concat_path,
			strokeColor: me.objectManager.getPgColor(),
			strokeOpacity: 0,
			strokeWeight: 4,
			zIndex: 1000
		}), 'path');
	
	google.maps.event.addListener(outline, 'mouseover', function() {
		polyline.setOptions({
			strokeOpacity: 0.8,
			strokeColor: me.objectManager.getPgColor()
		});
	});
	google.maps.event.addListener(outline, 'mouseout', function() {
		polyline.setOptions({ strokeOpacity: 0 });
	});
	google.maps.event.addListener(outline, 'click', function() {
		var $panel = $('#route-detail');
		
		me.calculation.directionsRenderer.setDirections(route.directionResult);
		$panel.children('.body').css({
			height: $('#map-wrap').height() - 280
		});
		$panel.show('fast').children('.body').animate({
			scrollTop: 0
		});
	});
};

Controller.prototype.showGNaviData = function(center, range, callback) {
	var me = this,
		gNavi = new GNaviService(),
		category = $('option[name=restaurant-category]:checked').val(),
		region = _.collect(me.calculation.vertices.getArray(), 'endLocation');

	callback = callback || function() {};
	
	if ($('input[name=restaurant]:checked').val() !== 'on') {
		callback();
	} else {
		gNavi.getRestaurants(center, category, range, function(result) {
			_.each(result.rest, function(r) {
				var marker,
					pos = new google.maps.LatLng(r.latitude, r.longitude);
				
				if (!me.objectManager.findObject(r.id)
					&& GeoUtil.isContained(pos, region)) {
					marker = me.objectManager.showObject(new google.maps.Marker({
						position: pos,
						icon: { url: GNaviService.getIconUrl(category) },
						zIndex: 30000,
						optimized: false
					}), 'gnavi', r.id);
					
					google.maps.event.addListener(marker, 'click', function() {
						var balloon = me.objectManager.findObject('gnavi'),
							content = GNaviService.createInfoWindowContent(r);
						
						if (balloon) {
							balloon.setContent(content);
							balloon.open(me.map, marker);
							
						} else {
							me.objectManager.showObject(new google.maps.InfoWindow({
								marker: marker,
								content: content,
								position: pos
							}), 'gnavi', 'gnavi');
						}
					});
				}
			});
			if (Number(result.total_hit_count) > Number(result.hit_per_page)
				&& !me.isMessageShown()) {
				me.geoCoder.geocode({
					location: center
				}, function(results, status) {
					var addrStatement = status === google.maps.GeocoderStatus.OK
						? (results[0].formatted_address.replace(/日本,\s*/, '') + ' の周辺に')
						: '';
						
					me.showMessage('飲食店検索', addrStatement + '飲食店検索の結果が多すぎるため, 一部の結果を地図に表示できませんでした。');
				});
			}
			callback();
		});
	}
};

Controller.prototype.showProgress = function(percent, added) {
	var me = this,
		vertices = me.calculation.vertices.getArray(),
		region = _.collect(vertices, 'endLocation'),
		origin = me.calculation.origin,
		marker, range,
		iconOptions = {
			scale: 4,
			fillColor: '#fff',
			strokeColor: me.objectManager.getPgColor(),
			fillOpacity: 1,
			path: google.maps.SymbolPath.CIRCLE,
			strokeWeight: 2,
			strokeOpacity: 1
		};
	
	me.objectManager.clearObjects('result');
	me.setStatus('計算中... ' + percent + '%');
	me.progressBar.update(percent);
	
	if (vertices.length >= 3) {
		me.objectManager.drawArea(percent > 50? region: region.concat([ origin ]));
	}
	
	me.drawRoute(added);
	
	if (vertices.length >= 2) {
		range = GeoUtil.lngToMeter(GeoUtil.distance(vertices[vertices.length - 2].endLocation, added.endLocation), origin.lat());
		me.showGNaviData(added.endLocation, range);
	}
	
	me.progress = percent;
	me.footprint.setAngle(90 - GeoUtil.calcAngle(origin, added.endLocation) * 360 / 2 / Math.PI);
	
	marker = me.objectManager.showObject(new google.maps.Marker({
		position: added.endLocation,
		icon: iconOptions,
		zIndex: 300,
		optimized: false
	}));
	
	google.maps.event.addListener(me.map, 'maptypeid_changed', function() {
		if (marker.getMap()) { marker.setIcon(iconOptions); }
	});
};

Controller.prototype.isCalculating = function() { return this.calculation && this.calculation.isRunning; };

Controller.prototype.showStartLocation = function(latLng, address) {
	var me = this,
		balloonTpl = _.template('<div class="balloon-content">出発地点<p class="address">{{address}}</p></div>');
	
	me.footprint = new Footprint(me.objectManager, latLng);
	
	me.objectManager.showObject(new google.maps.InfoWindow({
		position: latLng,
		content: balloonTpl({
			address: address
		}),
		marker: me.footprint.getMarker()
	}));
};

Controller.prototype.askIfCancel = function(onCancel) {
	var me = this;
	
	onCancel = onCancel || function() {};

	if (me.isCalculating()) {
		me.calculation.pause();
		me.showMessage('確認', '実行中の計算を中止しまか？', {
			'はい': function() {
				me.footprint.stop();
				me.calculation.stop();
				me.progressBar.finalize();
				// me.objectManager.clearObjects();
				me.setStatus('中止しました');
				$('#control-recalculate').css('display', 'inline');
				$('#control-stop').css('display', 'none');
				onCancel();
			},
			'いいえ': function() {
				me.calculation.resume();
			}
		});
	}
};

Controller.prototype.calcByAddress = function(address) {
	var me = this,
		time = $('#control-time').val(),
		mode = $('#control-travelmode').val();
	
	me.geoCoder.geocode({
		address: address
	}, function(results, status) {
		var latLng;
		
		if (status === google.maps.GeocoderStatus.OK) {
			latLng = results[0].geometry.location;
			
			me.initCalc(latLng, results[0].formatted_address.replace(/日本,\s*/, ''), time, mode);
		} else {
			me.showMessage.apply(me, status === google.maps.GeocoderStatus.ZERO_RESULTS
				? [ '場所がみつかりません...', 'キーワード ' + address + ' に該当する結果が見つかりませんでした。場所がわかっている場合は、その地点で地図を右クリックして計算を開始します。' ]
				: [ 'エラー', '検索でエラーが発生しました。' + status ]);
		}
	});
};

Controller.prototype.calcByLatLng = function(latLng, initial) {
	var me = this;
	
	me.geoCoder.geocode({
		location: latLng
	}, function(results, status) {
		var addr;
		
		if (status === google.maps.GeocoderStatus.OK) {
			addr = results[0].formatted_address.replace(/日本,\s*/, '');
			
			$('#control-search').val(addr);
			me.initCalc(latLng, addr, $('#control-time').val(), $('#control-travelmode').val(), initial);
		}
	});
};

Controller.prototype.onInput = function(ev) {
	var me = this,
		query = $('#control-search').val();
	
	if (ev.type === 'change' || ev.keyCode === 13) {
		// 入力完了
		$(ev.target).blur();
		if (me.isCalculating()) {
			me.askIfCancel(function() {
				window.setTimeout(function() { me.calcByAddress(query); }, 500);
			});
		} else {
			me.calcByAddress(query);
		}
	}
	
	if (query.length > 0) {
		$('#control-recalculate').removeAttr('disabled');
	} else {
		$('#control-recalculate').attr('disabled', 'disabled');
	}
};

Controller.prototype.isMessageShown = function() {
	return $('#messagebox:visible').length === 1;
};

Controller.prototype.showMessage = function(title, message, buttonConfig) {
	var me = this,
		$box = $('#messagebox'),
		$footer = $box.children('.footer');
	
	buttonConfig = buttonConfig || {
		'OK': function($msg) { $msg.hide(); }
	};
	
	$box.children('p').text(message);
	$box.children('h3').text(title || '確認');
	$footer.children('input').remove();
	_.each(buttonConfig, function(callback, label) {
		$footer.append(
			$('<input />')
				.attr({ 'class': 'btn large', type: 'button', value: label })
				.click(function() {
					$box.hide('fast');
					$('#mask').hide();
					callback($box);
				})
		);
	});
	me.showModal($box.css({
		left: ($(window).width() - $box.width()) / 2,
		top: ($(window).height() - $box.height()) / 3
	}), 'fast');
	window.setTimeout(function() {
		$footer.find('input:first').focus();
	}, 100);
};

Controller.prototype.clearContextMenu = function() {
	$('#contextmenu').hide();
	this.objectManager.clearObjects('rclick');
};

Controller.prototype.initDefault = function() {
	$('#control-search').val('スカイツリー');
	this.initMap(new google.maps.LatLng(35.7095751, 139.8101957));
};

Controller.prototype.handleRightClick = function(ev) {
	var me = this,
		$menu = $('#contextmenu'),
		$menuCalc = $menu.find('li[operation=calc]'),
		$menuShow = $menu.find('li[operation=show-googlemap]'),
		url = _.template('https://www.google.co.jp/maps?q={{lat}},{{lng}}')({
			lat: Math.round(ev.latLng.lat() * 1000) / 1000,
			lng: Math.round(ev.latLng.lng() * 1000) / 1000
		});
		
	me.objectManager.clearObjects('rclick');
	me.objectManager.showObject(new google.maps.Marker({ position: ev.latLng }), 'rclick');
	
	$menuCalc.text(_.template($menuCalc.attr('tpl'))({
		mode: $('#control-travelmode option:selected').text(),
		time: $('#control-time').val()
	})).one('click', function() {
		$menu.hide();
		me.objectManager.clearObjects('rclick');
		if (me.isCalculating()) {
			me.askIfCancel(function() {
				window.setTimeout(function() { me.calcByLatLng(ev.latLng); }, 500);
			});
		} else {
			me.calcByLatLng(ev.latLng);
		}
	});
	
	$menuShow.html('<a href="' + url + '" target="_blank" >' + $menuShow.attr('tpl') + '</a>');
	
	$menu.css({
		left: ev.pixel.x + 10,
		top: ev.pixel.y + 30
	}).attr({
		lat: ev.latLng.lat(),
		lng: ev.latLng.lng()
	}).show();
};

Controller.prototype.toggle_config = function() {
	var me = this,
		$panel = $('#config-panel');
	
	me.showModal($panel.css({
		left: ($(window).width() - $panel.width()) / 2,
		maxHeight: $(window).height() - 120
	}), 'fast');
};

Controller.prototype.save_config = function() {
	$('#config-panel').hide('fast');
	$('#mask').hide();
};

Controller.prototype.initMap = function(center) {
	var me = this,
		mapOptions = {
			zoom: 14,
			scaleControl: true,
			center: center
		},
		$map = $('#map-canvas');
	
	me.map = new google.maps.Map($map[0], mapOptions);
	me.objectManager = new ObjectManager(me.map);
	
	google.maps.event.addListener(me.map, 'dragstart', function() { me.clearContextMenu(); });
	
	google.maps.event.addListener(me.map, 'mousedown', function(ev) {
		me.longPressStart = ev.pixel;
		window.setTimeout(function() {
			if (me.longPressStart) {
				me.longPressStart = null;
				me.handleRightClick(ev);
			}
		}, 500);
	});
	google.maps.event.addListener(me.map, 'dragstart', function() { me.longPressStart = null; });
	google.maps.event.addListener(me.map, 'mouseup', function() { me.longPressStart = null; });
	
	google.maps.event.addListener(me.map, 'rightclick', function(ev) { me.handleRightClick(ev); });
	
	$('input[name=dev]').on('change', function(ev) {
		var show = $(ev.target).val() === 'on';
		
		_.each(me.objectManager.mapObjects, function(o) {
			if (o[1] === 'debug') {
				o[0].setMap(show? me.map: null);
			}
		});
	});
	
	$map.height(Math.max(Math.max(360, $map.width() * 0.6)));
	
	me.calcByLatLng(center, true);
};

window.Controller = Controller;

})(window, document, $, _, google, bspline, GeoUtil, CalculationService, GNaviService, ObjectManager);
