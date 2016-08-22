/*

// for RequireJS

require.config({
	shim: {
		window: { init: function() { return window; } },
		jQuery: { init: function() { return window.$; } },
		underscore: { init: function() { return window._; } },
		google: { init: function() { return window.google; } },
		numeric: { init: function() { return window.numeric; } }
	}
});

*/

require([
	'window',
	'jQuery',
	'underscore',
	'resources/js/dev/Application.js'
], function(window, $, _, Application) {
	_.templateSettings = {
		interpolate: /\{\{(.+?)\}\}/g
	};

	$(function() {
		new Application($(window.document));
	});
});

