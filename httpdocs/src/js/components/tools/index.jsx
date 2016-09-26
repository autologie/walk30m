import React, { Component } from 'react';
import AdvancedTools from './advanced';
import styles from './index.css';

const timeOptions = [
  {value: 5 * 60, label: '5分'},
  {value: 10 * 60, label: '10分'},
  {value: 15 * 60, label: '15分'},
  {value: 20 * 60, label: '20分'},
  {value: 30 * 60, label: '30分'},
  {value: 40 * 60, label: '40分'},
  {value: 50 * 60, label: '50分'},
  {value: 60 * 60, label: '60分'},
  {value: 70 * 60, label: '70分'},
  {value: 80 * 60, label: '80分'},
  {value: 90 * 60, label: '90分'},
  {value: 100 * 60, label: '100分'},
  {value: 110 * 60, label: '110分'},
  {value: 120 * 60, label: '120分'},
  {value: 150 * 60, label: '150分'},
  {value: 3 * 60 * 60, label: '3時間'},
  {value: 4 * 60 * 60, label: '4時間'},
  {value: 5 * 60 * 60, label: '5時間'},
  {value: 6 * 60 * 60, label: '6時間'},
];

export default class Tools extends Component {
  render() {
    const {
      settings,
      onChange,
      advancedShown,
      onClickShowAdvancedButton,
      onClickInitializeAdvancedSettingsButton,
    } = this.props;
    const {address, lat, lng} = settings.origin || {};
    const advanced = advancedShown ? (<AdvancedTools
      settings={settings}
      onChange={onChange}
      onClickInitializeButton={onClickInitializeAdvancedSettingsButton}
    />) : null;
    const timeOptionElements = timeOptions.map(opt => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ));

    return (
      <section className={styles.tools}>
        <div className={styles.basic}>
          <div className={styles.toolItem}>
            <label>
              <input
                type="text"
                value={address}
                onChange={(ev) => onChange('origin', {address: ev.target.value})}
              />
              から
            </label>
          </div>
          <div className={`${styles.toolItem} ${styles.travelMode}`}>
            <label>
              <input
                type="radio"
                value="WALKING"
                checked={settings.travelMode === 'WALKING'}
                onChange={(ev) => onChange('travelMode', 'WALKING')}
              />
              歩いて
            </label>
            <label>
              <input
                type="radio"
                value="DRIVING"
                checked={settings.travelMode === 'DRIVING'}
                onChange={(ev) => onChange('travelMode', 'DRIVING')}
              />
              車で
            </label>
          </div>
          <div className={styles.toolItem}>
            <label>
              <select
                value={settings.time}
                onChange={(ev) => onChange('time', ev.target.value)}
              >
                {timeOptionElements}
              </select>
              圏内の範囲を
            </label>
          </div>
          <button
            action
            type="button"
            disabled={!settings.isValid}
          >調べる</button>
          <button
            onClick={onClickShowAdvancedButton}
            type="button"
            role="open-advanced"
          >詳細設定</button>
          <ul className={styles.methods}>
            <li>現在地</li>
            <li>地図上で場所を指定</li>
            <li>音声で入力</li>
          </ul>
        </div>
        {advanced}
      </section>
    );
  }
}
