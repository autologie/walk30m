import React, { Component } from 'react';
import styles from './index.css';

export default class AdvancedTools extends Component {
  render() {
    const {
      settings,
      onClickInitializeButton,
      onChange,
    } = this.props;

    return (
      <div className={styles.advanced}>
        <div className={styles.header}>
          <h2>詳細設定</h2>
          <button
            onClick={onClickInitializeButton}
            action
            type="button"
            disabled={settings.hasDefaultAdvancedSettings}
          >初期値に戻す</button>
        </div>
        <div className={styles.toolItem}>
          <h3>優先項目</h3>
          <ul>
            <li>
              <label>
                <input
                  type="radio"
                  value="SPEED"
                  checked={settings.preference === 'SPEED'}
                  onChange={(ev) => onChange('preference', 'SPEED')}
                />
                計算の速さを優先
              </label>
            </li>
            <li>
              <label>
                <input
                  type="radio"
                  value="BALANCE"
                  checked={settings.preference === 'BALANCE'}
                  onChange={(ev) => onChange('preference', 'BALANCE')}
                />
                バランス（既定値）
              </label>
            </li>
            <li>
              <label>
                <input
                  type="radio"
                  value="PRECISION"
                  checked={settings.preference === 'PRECISION'}
                  onChange={(ev) => onChange('preference', 'PRECISION')}
                />
                正確さを優先
              </label>
            </li>
          </ul>
        </div>
        <div className={styles.toolItem}>
          <h3>ルート検索設定</h3>
          <ul>
            <li>
              <label>
                <input
                  type="checkbox"
                  checked={settings.avoidTolls !== true}
                  onChange={(ev) => onChange('avoidTolls', !settings.avoidTolls)}
                />
                車での移動で有料道路を使用する
              </label>
            </li>
            <li>
              <label>
                <input
                  type="checkbox"
                  checked={settings.avoidHighways !== true}
                  onChange={(ev) => onChange('avoidHighways', !settings.avoidHighways)}
                />
                車での移動で高速道路を使用する
              </label>
            </li>
            <li>
              <label>
                <input
                  type="checkbox"
                  checked={settings.avoidFerries !== true}
                  onChange={(ev) => onChange('avoidFerries', !settings.avoidFerries)}
                />
                車や徒歩での移動でフェリーを含む区間を利用する
              </label>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}
