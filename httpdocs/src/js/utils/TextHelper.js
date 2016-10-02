import _ from 'lodash';
import Settings from '../domain/Settings';
import Calculation from '../domain/Calculation';

const statusText = {
  completed: '完了',
  aborted: '中止',
  inProgress: '実行中',
  unknown: '不明',
};
const travelModeText = {
  WALKING: '歩いて',
  DRIVING: '車で',
};
const preferenceText = {
  SPEED: '計算の速さ',
  BALANCE: 'バランス',
  PRECISION: '正確さ',
};

function getAvoidText(avoid) {
  return avoid ? '使用しない' : '使用する';
}

function getSettings(obj) {
  return  obj instanceof Settings
    ? obj
    : obj instanceof Calculation
      ? obj.settings
      : null;
}

export function getTravelModeText(obj) {
  return travelModeText[getSettings(obj).travelMode];
}

export function getPreferenceText(obj) {
  return preferenceText[getSettings(obj).preference];
}

export function getStatusText(calculation) {
  return statusText[calculation.status];
}

export function getAvoidTollsText(obj) {
  return getAvoidText(getSettings(obj).avoidTolls);
}

export function getAvoidHighwaysText(obj) {
  return getAvoidText(getSettings(obj).avoidHighways);
}

export function getAvoidFerriesText(obj) {
  return getAvoidText(getSettings(obj).avoidFerries);
}

export function getTimeText(obj) {
  const time = _.isNumber(obj) ? obj : (getSettings(obj) || {}).time;
  const hourComponent = Math.floor(time / 60 / 60);
  const hourText = hourComponent > 0 ? `${hourComponent}時間` : '';
  const minuteComponent = Math.floor(time / 60 - hourComponent * 60);
  const minuteText = minuteComponent > 0 ? `${minuteComponent}分` : '';
  const secondComponent = Math.floor(time - (hourComponent * 60 + minuteComponent) * 60);
  const secondText = secondComponent > 0 ? `${secondComponent}秒` : '';

  return `${hourText}${minuteText}${secondText}`;
}
