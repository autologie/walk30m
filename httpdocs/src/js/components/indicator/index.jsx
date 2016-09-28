import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './index.css';
import {timeOptions} from '../tools';
import ProgressBar from '../progress-bar';

export default class Indicator extends Component {
  render() {
    const {settings, onClickAbortButton, calculations} = this.props;
    const {address, lat, lng} = settings.origin || {};
    const timeExpr = (timeOptions.find(opt => opt.value === settings.time) || {}).label;
    const inProgress = calculations.find(calc => calc.isInProgress);
    const progressBar = inProgress
      ? <ProgressBar value={inProgress.progress} />
      : null;
    const button = inProgress
      ? <button action type="button" onClick={onClickAbortButton}>キャンセル</button>
      : <Link action to="/home">別の条件で調べる</Link>;

    return (
      <section className={styles.indicator}>
        <label>{address}から</label>
        <label>{settings.travelMode === 'WALKING' ? '歩いて' : '車で'}</label>
        <label>{timeExpr}圏内の範囲を{inProgress ? '調べています。' : '調べました。'}</label>
        {button}
        {progressBar}
      </section>
    );
  }
}
