define([
	'lodash'
], function(_) {
	function AdvancedSettingsController($el) {
		var me = this;

		me.$el = $el;
		me.$prefs = $el.find('input[name=preference]');
		me.$optTolls = $el.find('#option_tolls');
		me.$optHighways = $el.find('#option_highways');
		me.$optFerries = $el.find('#option_ferries');
		me.$initializeBtn = $el.find('.btn[role=initialize]');
		me.defaultSettings = {
			preference: me.$prefs.filter(':checked').val(),
			tolls: me.$optTolls.is(':checked'),
			highways: me.$optHighways.is(':checked'),
			ferries: me.$optFerries.is(':checked')
		};

		me.$initializeBtn.click(_.bind(me.initialize, me));
	}

	AdvancedSettingsController.prototype.initialize = function() {
		var me = this,
			radios = {
				'$optTolls': me.defaultSettings.tolls,
				'$optHighways': me.defaultSettings.highways,
				'$optFerries': me.defaultSettings.ferries
			},
			p;

		me.$prefs.removeProp('checked');
		me.$prefs.filter('[value=' + me.defaultSettings.preference + ']').prop('checked', 'checked');
		for (p in radios) {
			if (radios.hasOwnProperty(p)) {
				if (radios[p]) {
					me[p].prop('checked', 'checked');
				} else {
					me[p].removeAttr('checked');
				}
			}
		}
	};

	AdvancedSettingsController.prototype.applyValues = function(values) {
		var me = this;

		me.$optFerries.prop('checked', !values.avoidFerries);
		me.$optHighways.prop('checked', !values.avoidHighways);
		me.$optTolls.prop('checked', !values.avoidTolls);
		me.$prefs.prop('checked', false);
		me.$prefs.filter('[value=' + values.preference + ']').prop('checked', true);
	};

	AdvancedSettingsController.prototype.getValues = function() {
		var me = this;

		return {
			avoidFerries: !me.$optFerries.is(':checked'),
			avoidHighways: !me.$optHighways.is(':checked'),
			avoidTolls: !me.$optTolls.is(':checked'),
			preference: me.$prefs.filter(':checked').val()
		};
	};

	return AdvancedSettingsController;
});

