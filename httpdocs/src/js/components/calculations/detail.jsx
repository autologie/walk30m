import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { Link } from 'react-router';
import styles from './detail.css';
import commonStyles from '../common.css';
import ProgressBar from '../progress-bar';
import Detail from './advanced';
import * as Helper from '../../utils/TextHelper';
import ExpandIcon from '../../icons/Expand';
import BackIcon from '../../icons/Back';

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
      onClickCalculationRetryButton,
      onClickToggleCalculationRoutesButton,
      showCalculationDetail,
    } = this.props;

    if (!calculation) return null;

    const settings = (calculation || {}).settings || {};
    const {address, lat, lng} = settings.origin || {};
    const inProgress = calculation.isInProgress;
    const progressBar = inProgress
      ? <ProgressBar value={calculation.progress} />
      : null;
    const cancelButton = inProgress ? <button action type="button" onClick={onClickAbortButton}>キャンセル</button> : null;
    const detailPanel = showCalculationDetail
      ? <Detail
          item={calculation}
          onClickDeleteButton={onClickCalculationDeleteButton}
          onClickRetryButton={onClickCalculationRetryButton}
          onClickToggleRoutesButton={onClickToggleCalculationRoutesButton}
        />
      : null;

    return (
      <section className={styles.detail}>
        <button
          className={`${commonStyles.toolButton} ${commonStyles.left}`}
          type="button"
        >
          <Link to="/home"><BackIcon /></Link>
        </button>
        <label
          className={`${styles.status} ${styles[calculation.status]}`}>
            ステータス: {Helper.getStatusText(calculation)}
        </label>
        <label>{address}から</label>
        <label>{Helper.getTravelModeText(settings)}</label>
        <label>{Helper.getTimeText(settings)}圏内の範囲</label>
        {cancelButton}
        <button
          className={`${commonStyles.toolButton} ${commonStyles.right}`}
          type="button"
          onClick={onClickCalculationDetailToggleButton}>
          <ExpandIcon mode={showCalculationDetail ? 'collapse' : 'expand'} />
        </button>
        {progressBar}
        {detailPanel}
      </section>
    );
  }
}
