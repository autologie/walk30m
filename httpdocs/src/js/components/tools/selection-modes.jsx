import React, { Component } from 'react';
import commonStyles from '../common.css';

export default class SelModeList extends Component {
  render() {
    const { className, geocoderResults, onClickSelMode } = this.props;
    const geocoderResultsEl = geocoderResults.map((result, idx) => {
      return (
        <li key={`geocoder-${idx}`} className={commonStyles.menuItem}>
          <a className={commonStyles.menuItemLink} onClick={(ev) => onClickSelMode(ev, 'geocoder', result)}>{result.address}</a>
        </li>
      );
    });
    const geoLocationEl = window.navigator.geolocation ? (
      <li key="geolocation" className={commonStyles.menuItem}>
        <a className={commonStyles.menuItemLink} onClick={(ev) => onClickSelMode(ev, 'geolocation')}>現在地</a>
      </li>
    ) : null;

    return (
      <ul className={className}>
        {geocoderResultsEl}
        {geoLocationEl}
        <li key="map" className={commonStyles.menuItem}>
          <a className={commonStyles.menuItemLink} onClick={(ev) => onClickSelMode(ev, 'map')}>地図上で場所を指定</a>
        </li>
        <li key="voice" className={commonStyles.menuItem}>
          <a className={commonStyles.menuItemLink} onClick={(ev) => onClickSelMode(ev, 'voice')}>音声で入力</a>
        </li>
      </ul>
    );
  }
}
