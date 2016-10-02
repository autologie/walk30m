import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { Link } from 'react-router';
import styles from './detail.css';
import ProgressBar from '../progress-bar';
import Detail from './advanced';
import * as Helper from '../../utils/TextHelper';

export default class CalculationDetail extends Component {
  componentWillMount() {
    if (!this.props.calculation) {
      this.props.onCalculationNotFound();
    }
  }

  componentWillUpdate(newProps) {
    if (!newProps.calculation) {
      this.props.onCalculationNotFound();
    }
  }

  render() {
    const {
      calculation,
      onClickAbortButton,
      onClickCalculationDetailToggleButton,
      onClickCalculationDeleteButton,
      showCalculationDetail,
    } = this.props;

    if (!calculation) return null;

    const settings = (calculation || {}).settings || {};
    const {address, lat, lng} = settings.origin || {};
    const inProgress = calculation.isInProgress;
    const progressBar = inProgress
      ? <ProgressBar value={calculation.progress} />
      : null;
    const tryAnotherButton = !inProgress ? <Link to="/home">別の条件で調べる</Link> : null;
    const cancelButton = inProgress ? <button action type="button" onClick={onClickAbortButton}>キャンセル</button> : null;
    const detailPanel = showCalculationDetail
      ? <Detail item={calculation} onClickDeleteButton={onClickCalculationDeleteButton} />
      : null;

    return (
      <section className={styles.detail}>
        {tryAnotherButton}
        <label
          className={`${styles.status} ${styles[calculation.status]}`}>
            ステータス: {Helper.getStatusText(calculation)}
        </label>
        <label>{address}から</label>
        <label>{Helper.getTravelModeText(settings)}</label>
        <label>{Helper.getTimeText(settings)}圏内の範囲</label>
        {cancelButton}
        <button type="button" onClick={onClickCalculationDetailToggleButton}>詳細</button>
        {progressBar}
        {detailPanel}
      </section>
    );
  }
}
