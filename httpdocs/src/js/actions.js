import _ from 'lodash';
import request from 'superagent';
import ja from './locale_ja';
import Walk30mUtils from './Walk30mUtils';
import { PUBLIC_API_URL_BASE } from './config';
import Calculation from './calculation';

function notify(view, level, message, persist = false) {
  view.setState({notification: {level, message}});
  if (!persist) {
    setTimeout(() => view.setState({notification: null}), 3000);
  }
}

export function handleChangeSettings(view, property, value) {
  return view.setState(prev => {
    switch (property) {
      case 'origin':
        return {
          mySettings: prev.mySettings.withOrigin(value),
          mapCenter: _.pick(value, 'lat', 'lng'),
        };
      case 'travelMode':
        return {mySettings: prev.mySettings.withTravelMode(value)};
      case 'time':
        return {mySettings: prev.mySettings.withTime(value)};
      case 'preference':
        return {mySettings: prev.mySettings.withPreference(value)};
      case 'avoidTolls':
        return {mySettings: prev.mySettings.withAvoidTolls(value)};
      case 'avoidHighways':
        return {mySettings: prev.mySettings.withAvoidHighways(value)};
      case 'avoidFerries':
        return {mySettings: prev.mySettings.withAvoidFerries(value)};
    }
  });
}

export function handleClickRecommendItem(view, item) {
  const {origin, travelMode, time} = item.params || {};

  view.setState(prev => ({
    mySettings: prev.mySettings
      .withOrigin(origin)
      .withTravelMode(travelMode)
      .withTime(time),
    mapCenter: _.pick(origin, 'lat', 'lng'),
    mapZoom: 16,
  }));
}

export function handleClickShowAdvancedSettingsButton(view) {
  view.setState(prev => ({
    advancedSettingsShown: !prev.advancedSettingsShown,
    status: prev.advancedSettingsShown === false ? 'normal' : 'entrance',
    menuShown: prev.advancedSettingsShown,
  }));
}

export function handleClickMenuButton(view) {
  view.setState({menuShown: true});
}

export function handleClickInitializeAdvancedSettingsButton(view) {
  view.setState(prev => ({
    mySettings: prev.mySettings.withDefaultAdvancedSettings(),
  }), () => {
    notify(view, 'I', '詳細設定を初期化しました。');
  });
}

export function handleClickExecuteButton(view) {
  view.setState({
    status: 'normal',
    advancedSettingsShown: false,
    recommendShown: false,
  }, () => {
    const settings = view.state.mySettings;
    const summary = Walk30mUtils.createSummary(settings);
    const description = _.template(ja.summaryTpl)(Object.assign({}, summary, {
      originAddress: settings.origin.address,
      travelModeExpr: ja.travelModes[settings.travelMode],
    }));
    const calc = new Calculation(settings);

    notify(view, 'I', `${description}を計算しています...`, true);

    calc.on('progress', () => view.forceUpdate());
    calc.on('complete', () => view.forceUpdate());
    calc.on('abort', () => view.forceUpdate());
    view.setState({calculations: view.state.calculations.concat([calc])});

    calc.start();
  });
}

export function handleClickRecommendToggleButton(view) {
  view.setState(prev => ({recommendShown: !prev.recommendShown}));
}

export function handleChangeInquiryMessage(view, inquiryMessage) {
  view.setState({inquiryMessage});
}

export function handleClickSubmitInquiryMessageButton(view) {
  request
    .post(`${PUBLIC_API_URL_BASE}/messages`)
    .set('Content-Type': 'application/json; charset=UTF-8')
    .send({
      message: view.state.inquiryMessage,
    }).end((err, data) => {
      if (err) {
        notify(view, 'E', err && err.message);
      } else {
        view.setState({inquiryMessage: ''});
        notify(view, 'I', '送信しました');
      }
    });
}

