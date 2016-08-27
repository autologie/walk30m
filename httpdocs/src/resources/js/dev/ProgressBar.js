'use strict';

define([
	'underscore'
], function(_) {
	function ProgressBar($el) {
		var me = this;

		me.$el = $el;
		me.currentProgress = 0;
		$el.append('<div class="progress"><div class="inner"></div></div>');
	}

	ProgressBar.prototype.finalize = _.debounce(function() {
		var me = this;

		me.currentProgress = 0;
		me.$el.fadeOut(undefined, function() {
			me.$el.find('.progress').css({ width: 0 });
		});
	}, 1000);

	ProgressBar.prototype.update = _.throttle(function(percent) {
		var $el = this.$el,
			me = this;

		if ($el.is(':visible')) {
			if (percent < me.currentProgress) {
				return;
			}

			$el.find('.progress').animate({ width: percent + '%' }, 1000, function() {
				if (percent === 100) {
					me.finalize();	
				}
			});
			me.currentProgress = percent;

		} else {
			$el.fadeIn(undefined, function() { me.update(percent); });
		}
	}, 1000);

	return ProgressBar;
});

