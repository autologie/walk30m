import React, { Component } from 'react';
import AdvancedTools from './advanced';
import styles from './index.css';

export default class Tools extends Component {
  constructor(props) {
    super(props);
    this.state = {
      advancedPanelShown: false,
    };
    this.handleClickShowAdvancedButton = this.handleClickShowAdvancedButton.bind(this);
  }

  handleClickShowAdvancedButton() {
    this.setState(prev => ({advancedPanelShown: !prev.advancedPanelShown}));
  }

  render() {
    const advanced = this.state.advancedPanelShown ? (<AdvancedTools />) : null;

    return (
      <section className={styles.tools}>
        <div className={styles.basic}>
          <div className={styles.toolItem}>
            <label>
              <input type="text" name="location" value="" />
              から
            </label>
          </div>
          <div className={`${styles.toolItem} ${styles.travelMode}`}>
            <label>
              <input type="radio" name="travelMode" value="WALKING" />
              歩いて
            </label>
            <label>
              <input type="radio" name="travelMode" value="DRIVING" />
              車で
            </label>
          </div>
          <div className={styles.toolItem}>
            <label>
              <select name="travelTime">
                <option>5分</option>
                <option>10分</option>
                <option>15分</option>
                <option>20分</option>
                <option>30分</option>
                <option>40分</option>
                <option>50分</option>
                <option>60分</option>
                <option>70分</option>
                <option>80分</option>
                <option>90分</option>
                <option>100分</option>
                <option>110分</option>
                <option>120分</option>
                <option>150分</option>
                <option>3時間</option>
                <option>4時間</option>
                <option>5時間</option>
                <option>6時間</option>
              </select>
              圏内の範囲を
            </label>
          </div>
          <button action type="button">調べる</button>
          <button
            onClick={this.handleClickShowAdvancedButton}
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
