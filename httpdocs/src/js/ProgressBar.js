import _ from 'lodash';

export default class ProgressBar {
  constructor($el) {
    this.$el = $el;
    this.currentProgress = 0;
    $el.append('<div class="progress"><div class="inner"></div></div>');

    this.finalize = _.debounce(() => this.doFinalize(), 1000);
    this.update = _.throttle((percent) => this.doUpdate(percent), 1000);
  }

  doFinalize() {
    this.currentProgress = 0;
    this.$el.fadeOut(undefined, () => this.$el.find('.progress').css({ width: 0 }));
  }

  doUpdate(percent) {
    const $el = this.$el;

    if ($el.is(':visible')) {
      if (percent < this.currentProgress) {
        return;
      }

      $el.find('.progress').animate({ width: `${percent}%` }, 1000, () => {
        if (percent === 100) {
          this.finalize();
        }
      });
      this.currentProgress = percent;
    } else {
      $el.fadeIn(undefined, () => this.update(percent));
    }
  }
}

