import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './index.css';
import commonStyles from '../common.css';
import * as Helper from '../../utils/TextHelper';
import toKML from 'tokml';
import CalcGeoJson from '../../domain/CalcGeoJson';

export default class CalculationList extends Component {

  renderTableRows(calculations) {
    return calculations.map((calc) => {
      return (
        <tr key={calc.id}>
          <td><Link to={`/home/calculations/${calc.id}`}>表示</Link></td>
          <td>{calc.startAt.toISOString()}</td>
          <td>{calc.settings.origin.address}</td>
          <td>{Helper.getTravelModeText(calc)}</td>
          <td>{Helper.getTimeText(calc)}</td>
          <td>{Helper.getStatusText(calc)}</td>
        </tr>
      );
    })
  }

  render() {
    const {calculations} = this.props;
    const items = calculations.length > 0
      ? this.renderTableRows(calculations)
      : (<tr><td colSpan="6">まだ計算履歴がありません</td></tr>);
    const geoJson = CalcGeoJson.collection(calculations);
    const kmlUrl = `data:text/xml;charset=UTF-8,${encodeURIComponent(toKML(geoJson))}`;
    const jsonUrl = `data:application/json;charset=UTF-8,${encodeURIComponent(JSON.stringify(geoJson))}`;

    return (
      <section className={`${commonStyles.staticContent} ${styles.history}`}>
        <div className={styles.header}>
          <h2>計算履歴</h2>
          <div className={styles.actions}>
            <a action download={`walk30m-${+new Date()}.kml`} href={kmlUrl} target="_blank">一括ダウンロード（KML）</a>
            <a action download={`walk30m-${+new Date()}.geojson`} href={jsonUrl} target="_blank">一括ダウンロード（GeoJSON）</a>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th></th>
              <th>実行日時</th>
              <th>開始地点</th>
              <th>交通手段</th>
              <th>時間</th>
              <th>ステータス</th>
            </tr>
          </thead>
          <tbody>
            {items}
          </tbody>
        </table>
      </section>
    );
  }
}
