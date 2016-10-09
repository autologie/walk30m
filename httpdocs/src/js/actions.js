import _ from 'lodash';
import request from 'superagent';
import {browserHistory} from 'react-router';
import ja from './locale_ja';
import Walk30mUtils from './Walk30mUtils';
import { PUBLIC_API_URL_BASE } from './config';
import Calculation from './domain/Calculation';
import CalculationService from './domain/CalculationService';
import routeProvider from './domain/RouteProvider';
import geocoderProvider from './domain/GeocoderProvider';
import geolocationProvider from './domain/GeolocationProvider';
import CalcGeoJson from './domain/CalcGeoJson';
import toKML from 'tokml';

function getCalculationId(view) {
  return view.props.location.pathname.split('/')[3] || null;
}

export function notify(view, level, message, timeout = 3000) {
  view.setState({notification: {level, message}});
  if (timeout > 0) {
    setTimeout(() => view.setState({notification: null}), timeout);
  }
}

export function handleChangeSettings(view, property, value) {
  return view.setState(prev => {
    switch (property) {
      case 'origin':
        geocoderProvider.geocode(value.address)
          .then(results => view.setState({geocoderResults: results.slice(0, 3)}))
          .catch(results => view.setState({geocoderResults: []}));
        return {
          mySettings: prev.mySettings.withOrigin(value),
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

  browserHistory.push('/home');

  view.setState(prev => ({
    mySettings: prev.mySettings
      .withOrigin(origin)
      .withTravelMode(travelMode)
      .withTime(time),
    mapVersion: +new Date(),
    mapCenter: _.pick(origin, 'lat', 'lng'),
    mapZoom: item.mapZoom,
  }));
}

export function handleClickShowAdvancedSettingsButton(view) {
  view.setState(prev => ({
    advancedSettingsShown: !prev.advancedSettingsShown,
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

    notify(view, 'I', '計算を開始しました。');

    view.bindCalculation(calc);
    browserHistory.push(`/home/calculations/${calc.id}`);

    calc.start(new CalculationService(routeProvider));
  });
}

export function handleClickRecommendToggleButton(view) {
  view.setState(prev => ({
    recommendShown: !prev.recommendShown,
    calculationsShown: prev.recommendShown ? prev.calculationsShown : false,
  }));
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

export function handleClickAbortButton(view) {
  view.state.calculations
    .filter(calc => calc.isInProgress)
    .map(calc => calc.abort());
}

export function handleMapBoundsChange(view, mapCenter, mapZoom) {
  view.setState({mapVersion: +new Date(), mapZoom, mapCenter});
}

export function handleClickCalculationsToggleButton(view) {
  view.setState(prev => ({
    calculationsShown: !prev.calculationsShown,
    recommendShown: prev.calculationsShown ? prev.recommendShown : false,
  }));
}

export function handleClickCalculationDeleteButton(view, clicked) {
  const newCalculations = view.state.calculations.filter(calc => calc !== clicked);

  browserHistory.push('/home');
  view.setState({
    calculations: newCalculations,
    dataVersion: +new Date(),
    calculationsShown: newCalculations.length > 0,
  }, () => {
    notify(view, 'I', '計算結果を削除しました');
  });
}

export function handleClickCalculation(view, clicked) {
  const center = _.pick(clicked.settings.origin, 'lat', 'lng');
  const mapState = (bounds => {
    const r = bounds && (bounds.ne.lng - bounds.sw.lng);

    if (bounds && r > 0) {
      return {
        mapCenter: {lat: center.lat - (r * 0.2), lng: center.lng},
        mapZoom: 1 + Math.ceil(Math.log(r / 180) / Math.log(1 / 2)),
      };
    } else {
      return {
        mapCenter: {lat: center.lat, lng: center.lng},
      };
    }
  })(clicked.bounds);

  view.setState(prev => Object.assign(mapState, {
    routesShown: prev.routesShown && getCalculationId(view),
    mapVersion: +new Date(),
  }));
  browserHistory.push(`/home/calculations/${clicked.id}`);
}

export function handleCalculationNotFound(view) {
  const calculationId = getCalculationId(view);

  notify(view, 'W', `計算 ${calculationId} は削除されたか、参照する権限がありません。`);
  browserHistory.push('/home');
}

export function handleClickCalculationDetailToggleButton(view) {
  view.setState(prev => ({
    showCalculationDetail: !prev.showCalculationDetail,
  }));
}

export function handleClickCalculationRetryButton(view, item) {
  browserHistory.push('/home');
  view.setState({
    advancedSettingsShown: true,
    showCalculationDetail: false,
    mySettings: item.settings,
  });
}

export function handleClickToggleCalculationRoutesButton(view, item) {
  view.setState(prev => ({
    routesShown: prev.routesShown ? null : item.id,
    mapVersion: +new Date(),
  }));
}

export function handleClickScrollToTopButton(view) {
  window.scrollTo(0, 0);
  view.setState({
    advancedSettingsShown: false,
    showCalculationDetail: false,
  });
}

export function handleClickSelMode(view, mode, values) {
  switch (mode) {
    case 'geocoder':
      return view.setState(prev => ({
        mySettings: prev.mySettings.withOrigin(values),
        mapCenter: _.pick(values, 'lat', 'lng'),
        mapVersion: +new Date(),
      }));
    case 'geolocation':
      return geolocationProvider.getCurrentLocation()
        .then(values => view.setState(prev => ({
          mySettings: prev.mySettings.withOrigin(values),
          mapCenter: _.pick(values, 'lat', 'lng'),
          mapZoom: 15,
          mapVersion: +new Date(),
        })))
        .catch((err) => notify(view, 'E', err.message));
  }
}
