import React, { Component } from 'react';
import styles from './index.css';

export default class AdvancedTools extends Component {
  constructor(props) {
    super(props);
    this.handleClickInitializeButton = this.handleClickInitializeButton.bind(this);
  }

  handleClickInitializeButton() {
    // TODO
  }

  render() {
    return (
      <div className={styles.advanced}>
        <div className={styles.header}>
          <h2>詳細設定</h2>
          <button
            onClick={this.handleClickInitializeButton}
            action
            type="button"
          >初期値に戻す</button>
        </div>
        <div className={styles.toolItem}>
          <h3>優先項目</h3>
          <ul>
            <li>
              <label>
                <input type="radio" name="preference" value="SPEED" />
                計算の速さを優先
              </label>
            </li>
            <li>
              <label>
                <input type="radio" name="preference" value="BALANCE" />
                バランス（既定値）
              </label>
            </li>
            <li>
              <label>
                <input type="radio" name="preference" value="PRECISION" />
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
                <input type="checkbox" name="option_highways" />
                車での移動で有料道路を使用する
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox" name="option_tolls" />
                車での移動で高速道路を使用する
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox" name="option_ferries" />
                車や徒歩での移動でフェリーを含む区間を利用する
              </label>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}
