import Settings from './domain/Settings';
import Calculation from './domain/Calculation';
import recommendItems from 'json!../resources/recommends.json';
import { isMobile, save, load } from './utils/BrowserUtil';
import { STORAGE_KEY } from './constants';

const defaultState = {
  status: isMobile() ? 'normal' : 'entrance',
  calculations: [],
  menuShown: true,
  routesShown: null,
  mapVersion: +new Date(),
  dataVersion: +new Date(),
  mapCenter: {
    lat: 35.6618349,
    lng: 139.722119,
  },
  mapZoom: 13,
  mySettings: new Settings(null, 'WALKING', 30 * 60),
  inquiryMessage: '',
  calculationsShown: false,
  recommendShown: true,
};

class StateProvider {
  getInitialState() {
    const data = load(STORAGE_KEY) || {};
    const calculations = (data.calculations || [])
      .map(calc => Calculation.deserialize(calc));

    return Object.assign({}, defaultState, data, {
      mySettings: new Settings(data.mySettings),
      calculations,
      menuShown: data.status === 'entrance',
      advancedSettingsShown: false,
      showCalculationDetail: false,
      notification: null,
      recommendItems,
      geocoderResults: [],
    });
  }

  save(state) {
    save(STORAGE_KEY, Object.assign({}, state, {
      calculations: state.calculations.map(calc => calc.serialize()),
    }));
  }
}

export default new StateProvider;
