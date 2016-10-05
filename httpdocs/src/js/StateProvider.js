import Settings from './domain/Settings';
import Calculation from './domain/Calculation';
import recommendItems from 'json!../resources/recommends.json';
import { isMobile, save, load } from './utils/BrowserUtil';

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
    const data = load('walk30m-data') || {};
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
    });
  }

  save(state) {
    save('walk30m-data', state);
  }
}

export default new StateProvider;
