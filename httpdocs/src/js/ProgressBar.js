import _ from "lodash";

function ProgressBar($el) {
  const me = this;

  me.$el = $el;
  me.currentProgress = 0;
  $el.append('<div class="progress"><div class="inner"></div></div>');
}

ProgressBar.prototype.finalize = _.debounce(function() {
  const me = this;

  me.currentProgress = 0;
  me.$el.fadeOut(undefined, () => {
    me.$el.find(".progress").css({ width: 0 });
  });
}, 1000);

ProgressBar.prototype.update = _.throttle(function(percent) {
  let $el = this.$el,
    me = this;

  if ($el.is(":visible")) {
    if (percent < me.currentProgress) {
      return;
    }

    $el.find(".progress").animate({ width: `${percent}%` }, 1000, () => {
      if (percent === 100) {
        me.finalize();
      }
    });
    me.currentProgress = percent;
  } else {
    $el.fadeIn(undefined, () => {
      me.update(percent);
    });
  }
}, 1000);

export default ProgressBar;
