import React, { Component } from 'react';
import styles from './index.css';
import * as Helper from '../../../utils/TextHelper';

export default class CalculationDetail extends Component {
  render() {
    const {
      item,
      onClickDeleteButton,
      onClickRetryButton,
    } = this.props;
    const {origin, travelMode, time} = item.settings;
    const timeTook = item.isInProgress
      ? ((+new Date() - +item.startAt) / 1000) / item.progress
      : (+item.endAt - +item.startAt) / 1000
      const progress = item.isInProgress ? `（${Math.round(item.progress * 10000) / 100}%）` : '';

    return (
      <div className={styles.advanced}>
        <div className={styles.header}>
          <h2>計算の詳細</h2>
        </div>
        <div className={styles.body}>
          <div className={styles.toolItems}>
            <div className={styles.toolItem}>
              <h3>メタ情報</h3>
              <dl>
                <dt>ID</dt>
                <dd>{item.id}</dd>
              </dl>
              <dl>
                <dt>実行日時</dt>
                <dd>{item.startAt.toISOString()}</dd>
              </dl>
              <dl>
                <dt>計算の所要時間</dt>
                <dd>{Helper.getTimeText(timeTook)}{item.isInProgress ? '（予測）' : ''}</dd>
              </dl>
              <dl>
                <dt>ステータス</dt>
                <dd>{Helper.getStatusText(item)}{progress}</dd>
              </dl>
            </div>
            <div className={styles.toolItem}>
              <h3>設定</h3>
              <dl>
                <dt>出発地点</dt>
                <dd>{origin.address}（経度: {origin.lng}, 緯度: {origin.lat}）</dd>
              </dl>
              <dl>
                <dt>交通手段</dt>
                <dd>{Helper.getTravelModeText(item)}</dd>
              </dl>
              <dl>
                <dt>時間</dt>
                <dd>{Helper.getTimeText(item)}</dd>
              </dl>
            </div>
            <div className={styles.toolItem}>
              <h3>詳細設定</h3>
              <dl>
                <dt>優先項目</dt>
                <dd>{Helper.getPreferenceText(item)}</dd>
              </dl>
              <dl>
                <dt>有料道路</dt>
                <dd>{Helper.getAvoidTollsText(item)}</dd>
              </dl>
              <dl>
                <dt>高速道路</dt>
                <dd>{Helper.getAvoidHighwaysText(item)}</dd>
              </dl>
              <dl>
                <dt>フェリー</dt>
                <dd>{Helper.getAvoidFerriesText(item)}</dd>
              </dl>
            </div>
          </div>
          <div className={styles.actions}>
            <button action type="button" disabled={item.isInProgress}>問題点を報告する</button>
            <button action type="button" disabled={item.isInProgress || item.isAborted}>KMLダウンロード</button>
            <button action type="button" disabled={item.isInProgress || item.isAborted}>GeoJsonダウンロード</button>
            <button action type="button" onClick={() => onClickDeleteButton(item)} disabled={item.isInProgress}>削除</button>
            <button action type="button" onClick={() => onClickRetryButton(item)} disabled={item.isInProgress}>再計算</button>
          </div>
        </div>
      </div>
    );
  }
}
