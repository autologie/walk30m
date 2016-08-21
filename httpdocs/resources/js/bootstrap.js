require([
	'resources/js/dev/Application.js'
], function(Application) {
	_.templateSettings = {
		interpolate: /\{\{(.+?)\}\}/g
	};

	$(function() {
		new Application($(document));
	});
});

