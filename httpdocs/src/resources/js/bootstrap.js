require([
	'window',
	'jQuery',
	'lodash',
	'./Application.js',
	'./locale_ja.js'
], function(window, $, _, Application, locale) {
	_.templateSettings = {
		interpolate: /\{\{(.+?)\}\}/g
	};

	$(function() {
		new Application($(window.document));
	});
});

