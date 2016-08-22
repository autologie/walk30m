define([
], function() {
	function ProgressBar($el) {
		this.$el = $el;
		$el.append('<div class="progress"><div class="inner"></div></div>');
	}

	ProgressBar.prototype.finalize = _.debounce(function() {
		var me = this;

		me.$el.fadeOut(undefined, function() {
			me.$el.find('.progress').css({ width: 0 });
		});
	}, 1000);

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

	return ProgressBar;
});

