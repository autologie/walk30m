(function(window, _, google, GeoUtil) {
'use strict';

_.templateSettings = {
	interpolate: /\{\{(\w+?)\}\}/g
};

var keyId = '32c3fd1332b08fdab92fe41be8388e9d';

var shopTpl = _.template([
	'<div class="balloon-content gnavi">',
		'<span class="category">{{category}}</span>',
		'<h4><a href="{{url}}" target="_blank">{{name}}</a></h4>',
		'<p>{{image}}</p>',
		'<p><b>営業日・営業時間</b>: {{opentime}}</p>',
		'<p><b>休日</b>: {{holiday}}</p>',
		'<p><b>TEL</b>: {{tel}}</p>',
		'<a href="http://www.gnavi.co.jp/" target="_blank">',
			'<img src="http://apicache.gnavi.co.jp/image/rest/b/api_155_20.gif" width="155" height="20" border="0" alt="グルメ情報検索サイト　ぐるなび">',
		'</a>',
	'</div>'
].join(''));

function GNaviService() {}

GNaviService.prototype = new google.maps.MVCObject();

GNaviService.prototype.meterToRangeCode = function(meter) {
	return meter > 3000? 5: meter > 2000? 4: meter > 1000? 3: meter > 500? 2: 1;
};

GNaviService.prototype.getCategories = function(callback) {
	var me = this,
		urlTpl = _.template([
			'http://api.gnavi.co.jp/master/CategoryLargeSearchAPI/20150630/',
			'?keyid={{keyid}}',
			'&format=json'
		].join('')),
		cbKey = +new Date();
	
	GNaviService['jsonpcb_' + cbKey] = callback;
	
	$.ajax({
		dataType: 'jsonp',
		jsonpCallback: 'GNaviService.jsonpcb_' + cbKey,
		url: urlTpl({ keyid: keyId })
	});
	
};

GNaviService.prototype.getRestaurants = function(center, category, range, callback) {
	var me = this,
		urlTpl = _.template([
			'http://api.gnavi.co.jp/RestSearchAPI/20150630/',
			'?keyid={{keyid}}',
			'&input_coordinates_mode=2',
			'&category_l={{category}}',
			'&range={{range}}',
			'&latitude={{lat}}',
			'&longitude={{lng}}',
			'&coordinates_mode=2',
			'&hit_per_page={{hitPerPage}}',
			'&format=json'
		].join('')),
		cbKey = +new Date();
	
	GNaviService['jsonpcb_' + cbKey] = callback;
	
	$.ajax({
		dataType: 'jsonp',
		jsonpCallback: 'GNaviService.jsonpcb_' + cbKey,
		url: urlTpl({
			keyid: keyId,
			category: category,
			range: me.meterToRangeCode(range),
			lat: center.lat(),
			lng: center.lng(),
			hitPerPage: 200
		})
	});
};

GNaviService.getIconUrl = function(category) {
	var images = {
			RSFST03000: 'fish52_contour',	// すし・魚料理・シーフード
			RSFST06000: 'turkey9_contour',	// 焼き鳥・肉料理・串料理
			RSFST09000: 'drink24_contour',	// 居酒屋
			RSFST10000: 'cocktail7_contour',// ダイニングバー・バー・ビアホール
			RSFST18000: 'hot51_contour',	// カフェ
			RSFST20000: 'burger4_contour',	// ファミレス・ファーストフード
			RSFST21000: 'glass4_contour'	// お酒
		};
	
	return 'resources/images/food/' + (images.hasOwnProperty(category)? images[category]: 'cutlery6_contour') + '.png';
};

GNaviService.createInfoWindowContent = function(r) {
	return shopTpl({
		url: r.url,
		name: r.name,
		category: r.category,
		opentime: r.opentime,
		tel: r.tel,
		image: typeof r.image_url.shop_image1 === 'string'
			? '<img width="150" src="' + r.image_url.shop_image1 + '" />'
				+ '<br/><span class="provide-info">提供：ぐるなび</span>'
			: '',
		holiday: typeof r.holiday === 'string'? r.holiday: ''
	});
};

window.GNaviService = GNaviService;

}(window, _, google, GeoUtil));
