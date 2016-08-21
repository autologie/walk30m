$(function() {
	'use strict';

	_.templateSettings = {
		interpolate: /\{\{(.+?)\}\}/g
	};
	
	var map, infoWindow, chart;
	var urlTpl = _.template('/admin.html?lat={{lat}}&lng={{lng}}&zoom={{zoom}}');
	
	function toggleControls(visible) {
		var isHidden = !$('#controls').is(':visible'),
			isChanging = !_.isBoolean(visible) || visible === isHidden;

		if (!isChanging) return;

		$('#toggle-controls').fadeToggle(100);
		$('#controls').fadeToggle(100);
	}

	function toggleStats(visible) {
		var isHidden = !$('#stats').is(':visible'),
			isChanging = !_.isBoolean(visible) || visible === isHidden,
			afterToggle = isHidden? function() {
				var duration = getInputDuration();

				updateStats(duration.from, duration.to);
			}: _.noop;
		
		if (!isChanging) return;

		$('#toggle-stats').fadeToggle(100);
		$('#stats').fadeToggle(100, afterToggle);
		
		if (!isHidden && chart) {
			chart.destroy();
		}
	}

	function moveMapTo(bounds, pushState) {
		var center = map.getCenter();

		map.fitBounds(bounds);

		if (pushState !== false) {
//			window.history.pushState(bounds, undefined, urlTpl({ lat: center.lat(), lng: center.lng(), zoom: map.getZoom() }));
		}
	}

	function updateStats(from, to) {
		var $container = $('#stats'),
			$canvas = $container.find('canvas'),
			titleTpl = _.template('{{from}} ~ {{to}}');

		if (chart) {
			chart.destroy();
		}

		$container.find('h3').text(titleTpl({
			from: from? from.toDateString(): '',
			to: (to || new Date()).toDateString()
		}));
		$canvas.css({ width: ($container.width()) + 'px' });
		$.get('/api/statistics', {
			from: from && from.toISOString(),
			to: to && to.toISOString()
		}).done(function(data) {
			chart = new Chart($canvas.get(0).getContext('2d')).Bar({
				labels: _.keys(data).map(function(dateExpr) {
					var date = new Date(dateExpr);

					return (date.getMonth() + 1) + '/' + date.getDate();
				}),
				datasets: [
					{
						data: _.values(data),
						label: 'Execution',
						fillColor: 'rgba(220, 100, 100, 0.5)',
						strokeColor: 'rgba(220, 100, 100, 1)'
					}
				]
			}, {
				scaleLineColor: 'rgba(255, 255, 255, 0.1)',
				scaleGridLineColor: 'rgba(255, 255, 255, 0.1)',
				scaleFontColor: 'rgba(255, 255, 255, 0.7)'
			});
		}).fail(function(error) {
			alert(error);
		});
	}

	window.reproduce = function(uuid) {
		var current = map.data.getFeatureById('reproduction');
		
		if (current) {
			map.data.remove(current);
		}

		if (infoWindow) {
			infoWindow.close();
		}

		$.get('/api/execution_log/' + uuid).done(function(data) {
			var bounds = new google.maps.LatLngBounds(
				new google.maps.LatLng(data.origin_latitude - 0.001, data.origin_longitude - 0.001),
				new google.maps.LatLng(data.origin_latitude + 0.001, data.origin_longitude + 0.001)
			);

			_.each(data.extra_info, function(coord) {
				var c = _.values(coord);

				bounds = bounds.extend(new google.maps.LatLng(c[0], c[1]));
			});

			try {
				map.data.addGeoJson({
					id: 'reproduction',
					type: 'Feature',
					geometry: {
						type: 'Polygon',
						coordinates: [
							data.extra_info.map(function(coord) {
								return _.values(coord).reverse()
							}).concat([
								_.values(data.extra_info[0]).reverse()
							])
						]
					}
				});
				moveMapTo(bounds);
			} catch(e) {
				window.alert('Failed: ' + e);
			}
		});
	};

	window.showInfoWindow = function(uuid) {
		map.data.forEach(function(f) {
			if (f.getId() === uuid) {
				showDetailBalloon(f);
				return false;
			}
		});
	};

	function applyFilter(from, to) {
		if (infoWindow) {
			infoWindow.close();
		}

		$.get('/api/execution_log', _.omit({
			from: from && from.toISOString(),
			to: to && to.toISOString()
		}, function(k) { return !k; })).done(function(data) {
			if (data.length > 0) {
				toggleControls(false);
				showMarkersAsync(data);
			} else {
				alert('No data found');
			}
		}).fail(function(err) {
			alert(err);
		});
	}

	function showMarkers(data) {
		var bounds = map.getBounds();

		map.data.forEach(function(feature) {
			map.data.remove(feature);
		});
		_.each(data, function(log) {
			bounds = bounds.extend(new google.maps.LatLng(log.origin_latitude, log.origin_longitude));
		});
		map.data.addGeoJson({
			type: "FeatureCollection",
			features: data.map(function(log) {
				return {
					id: log.uuid,
					type: "Feature",
					properties: log,
					geometry: {
						type: "Point",
						coordinates: [ log.origin_longitude, log.origin_latitude ]
					}
				};
			})
		});
		moveMapTo(bounds);
	}

	function showMarkersAsync(data) {
		map.data.forEach(function(feature) {
			map.data.remove(feature);
		});
		if (data.length === 0) return;
		if (data.length > 30) {
			showMarkers(data);
			return;
		}

		var first = data[0];
		var sw = new google.maps.LatLng(first.origin_latitude - 0.01, first.origin_longitude - 0.01);
		var ne = new google.maps.LatLng(first.origin_latitude + 0.01, first.origin_longitude + 0.01);
		var bounds = new google.maps.LatLngBounds(sw, ne);
		
		_.each(data, function(log) {
			bounds = bounds.extend(new google.maps.LatLng(log.origin_latitude, log.origin_longitude));
		});

		map.fitBounds(bounds);
		showMarkersIter(data, bounds, 100);
	}

	function showMarkersIter(data, bounds, delay) {
		var toShow = data.pop();

		if (toShow) {
			map.data.addGeoJson({
				id: toShow.uuid,
				type: 'Feature',
				properties: toShow,
				geometry: {
					type: 'Point',
					coordinates: [ toShow.origin_longitude, toShow.origin_latitude ]
				}
			});
			_.delay(function() {
				showMarkersIter(data, bounds.extend(new google.maps.LatLng(toShow.origin_latitude, toShow.origin_longitude)), delay);
			}, delay);
		}
	}
	
	function updateMap() {
		var duration = getInputDuration();

		applyFilter(duration.from, duration.to);
		if ($('#stats:visible').length > 0) {
			updateStats(duration.from, duration.to);
		}
	}

	function showDetailBalloon(feature) {
		feature.toGeoJson(function(geoJson) {
			var c = geoJson.geometry.coordinates;
			var propertiesToShow = _.omit(geoJson.properties, 'origin_latitude', 'origin_longitude', 'uuid', 'avoid_ferries', 'serial_no', 'status');
			var propertyList = _.keys(propertiesToShow).map(function(key) {
				var value = geoJson.properties[key];
				var valueExpr = key === 'travel_time_sec'
					? (value / 60) + 'min.'
					: (key === 'start_datetime' || key === 'complete_datetime') && value
						? new Date(value).toLocaleString()
						: value;

				return '<strong>' + key + '</strong>: ' + valueExpr;
			});
			var showBtn = geoJson.properties.status === 'complete'
				? '<br><input class="btn btn-primary btn-sm" type="button" onclick="reproduce(\'' + geoJson.id + '\');" value="Show Result" />'
				: '';

			infoWindow.setContent(propertyList.join('<br>') + showBtn);
			infoWindow.setPosition(new google.maps.LatLng(c[1], c[0]));
			infoWindow.setOptions({ maxWidth: 300 });
			infoWindow.open(map);
		});
	}

	function showSelectionWindow(features) {
		var selectionBtnTpl = _.template('<input class="btn btn-primary btn-sm" type="button" onclick="showInfoWindow(\'{{uuid}}\');" value="{{travelMode}}({{travelTime}}min.)" {{disabled}}/>');

		infoWindow.setContent(features.map(function(f) {
			return selectionBtnTpl({
					uuid: f.getId(),
					travelMode: f.getProperty('travel_mode'),
					travelTime: f.getProperty('travel_time_sec') / 60,
					disabled: f.getProperty('status') === 'complete'? '': 'disabled'
				});
		}).join(''));
		infoWindow.setPosition(features[0].getGeometry().get());
		infoWindow.setOptions({ maxWidth: 360 });
		infoWindow.open(map);
	}

	function getInputDuration() {
		var checked = $('#controls input[name=duration]:checked').val();
		var aDay = 24 * 60 * 60 * 1000;

		switch(checked) {
			case 'last24':
				return { from: new Date(+new Date() - aDay) };
			case 'last7':
				return { from: new Date(+new Date() - 7 * aDay) };
			case 'last30':
				return { from: new Date(+new Date() - 30 * aDay) };
			case 'duration':
				var from = $('#from').datepicker('getDate');
				var to = $('#to').datepicker('getDate');

				return {
					from: from,
					to: to? new Date(+to + aDay): null
				};
			default:
				return {};
		}
	}

	$( "#from" ).datepicker({
		defaultDate: "+1w",
		changeMonth: true,
		onClose: function( selectedDate ) {
			var $to = $( "#to" );
			
			$to.datepicker( "option", "minDate", selectedDate );
			if (selectedDate && !$to.datepicker('getDate')) {
				$to.datepicker('setDate', selectedDate);
			}
		}
	});
	$( "#to" ).datepicker({
		defaultDate: "+1w",
		changeMonth: true,
		onClose: function( selectedDate ) {
			$( "#from" ).datepicker( "option", "maxDate", selectedDate );
		}
	});
	$('#filter').click(updateMap);
	$('#from,#to').focus(function() {
		$('#duration').attr('checked', 'checked');
	});

	map = new google.maps.Map($('#map-canvas')[0], {
		center: new google.maps.LatLng(37, 137),
		zoom: 5,
		mapTypeControl: false,
		zoomControl: false,
		streetViewControl: false,
		mapTypeId: 'Monotone'
	});
	map.mapTypes.set('Monotone', new google.maps.StyledMapType([
		{              
				featureType: 'all',
				stylers: [
					{saturation: -100},
					{gamma: 0.50}
				]
		}
	], { name: 'Monotone' }));

	infoWindow = new google.maps.InfoWindow({
		pixelOffset: new google.maps.Size(0, -28),
		maxWidth: Math.min($(window).width() - 160, 300)
	});

	map.data.setStyle(function(f) {
		return _.defaults(f.getProperty('status') !== 'complete'
			? { zIndex: 10, icon: { strokeWeight: 0, fillOpacity: 0.8, fillColor: '#c44', scale: 5, path: google.maps.SymbolPath.CIRCLE } }
			: { zIndex: 100 }, {
				title: new Date(f.getProperty('start_datetime')).toLocaleString(),
				fillColor: '#c44',
				strokeColor: '#c44'
			});
	});

	google.maps.event.addListener(map, 'dragstart', function() {
		toggleStats(false);
		toggleControls(false);
	});

	google.maps.event.addListener(map.data, 'click', function(event) {
		var overlapped = [],
			clickedLocation;

		if (event.feature.getId() === 'reproduction') {
			return;
		}

		clickedLocation = event.feature.getGeometry().get();
		map.data.forEach(function(f) {
			if (f.getId() !== 'reproduction'
				&& clickedLocation.equals(f.getGeometry().get())) {
				overlapped.push(f);
			}
		});
		
		if (overlapped.length > 1) {
			showSelectionWindow(overlapped);
		} else {
			showDetailBalloon(event.feature);
		}
	});

	$(window).on('popstate', function(ev) {
		if (!ev.originEvent.state) {
			return;
		}

		moveMapTo(ev.originEvent.state, false);
	});

	$('#toggle-stats').click(toggleStats);
	$('#toggle-controls').click(toggleControls);
	$('#stats .w30m-close').click(toggleStats);
	$('#stats canvas').height(Math.min(300, $(window).height() / 3));

	updateMap();
});

