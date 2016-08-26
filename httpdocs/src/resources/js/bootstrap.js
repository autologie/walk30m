require([
	'window',
	'jQuery',
	'underscore',
	'./dev/Application.js',
	'./dev/locale_ja.js'
], function(window, $, _, Application, locale) {
	_.templateSettings = {
		interpolate: /\{\{(.+?)\}\}/g
	};

	$(function() {
		new Application($(window.document));
	});
});

