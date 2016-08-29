import _ from "lodash";

class AdvancedSettingsController {

  constructor($el) {
    this.$el = $el;
    this.$prefs = $el.find('input[name=preference]');
    this.$optTolls = $el.find('#option_tolls');
    this.$optHighways = $el.find('#option_highways');
    this.$optFerries = $el.find('#option_ferries');
    this.$initializeBtn = $el.find('.btn[role=initialize]');
    this.defaultSettings = {
      preference: this.$prefs.filter(':checked').val(),
      tolls: this.$optTolls.is(':checked'),
      highways: this.$optHighways.is(':checked'),
      ferries: this.$optFerries.is(':checked')
    };

    this.$initializeBtn.click(_.bind(this.initialize, this));
  }

  initialize() {
    var radios = {
        '$optTolls': this.defaultSettings.tolls,
        '$optHighways': this.defaultSettings.highways,
        '$optFerries': this.defaultSettings.ferries
      },
      p;

    this.$prefs.removeProp('checked');
    this.$prefs.filter('[value=' + this.defaultSettings.preference + ']').prop('checked', 'checked');
    for (p in radios) {
      if (radios.hasOwnProperty(p)) {
        if (radios[p]) {
          this[p].prop('checked', 'checked');
        } else {
          this[p].removeAttr('checked');
        }
      }
    }
  }

  applyValues(values) {
    this.$optFerries.prop('checked', !values.avoidFerries);
    this.$optHighways.prop('checked', !values.avoidHighways);
    this.$optTolls.prop('checked', !values.avoidTolls);
    this.$prefs.prop('checked', false);
    this.$prefs.filter('[value=' + values.preference + ']').prop('checked', true);
  }

  getValues() {
    return {
      avoidFerries: !this.$optFerries.is(':checked'),
      avoidHighways: !this.$optHighways.is(':checked'),
      avoidTolls: !this.$optTolls.is(':checked'),
      preference: this.$prefs.filter(':checked').val()
    };
  }
}

module.exports = AdvancedSettingsController;

