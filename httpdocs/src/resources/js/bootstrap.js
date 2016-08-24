require([
	'window',
	'jQuery',
	'underscore',
	'./dev/Application.js'
], function(window, $, _, Application) {
	_.templateSettings = {
		interpolate: /\{\{(.+?)\}\}/g
	};

	$(function() {
		new Application($(window.document));
	});
});

