import React, { Component } from 'react';
import Recommends from '../recommends';
import Tools from '../tools';
import ObjectManager from '../../ObjectManager';
import ResultVisualizer from '../../ResultVisualizer';
import locale from '../../locale_ja';
import styles from './index.css';

export default class Map extends Component {
  componentDidMount() {
    const {mapCenter, mapZoom} = this.props;
    const el = this.refs.mapWrapper;
    const map = new google.maps.Map(el, {
      center: new google.maps.LatLng(mapCenter.lat, mapCenter.lng),
      zoom: mapZoom,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER,
      },
      streetViewControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER,
      },
    });

    this.map = map;
    this.objectManager = new ObjectManager(map);
    this.resultVisualizer = new ResultVisualizer({
      getMessage: (key) => locale[key],
    }, map, this.objectManager);
  }

  componentWillUpdate(props) {
    const {lat, lng} = props.mapCenter || {};

    this.map.setCenter(new google.maps.LatLng(lat, lng));
    this.map.setZoom(props.mapZoom);
  }

  render() {
    const {
      settings,
      recommendItems,
      recommendShown,
      advancedSettingsShown,
      onClickRecommendItem,
      onChangeSettings,
      onClickShowAdvancedSettingsButton,
      onClickInitializeAdvancedSettingsButton,
      onClickExecuteButton,
      onClickRecommendToggleButton,
    } = this.props;

    return (
      <section className={styles.map}>
        <Tools
          settings={settings}
          advancedShown={advancedSettingsShown}
          onChange={onChangeSettings}
          onClickShowAdvancedButton={onClickShowAdvancedSettingsButton}
          onClickInitializeAdvancedSettingsButton={onClickInitializeAdvancedSettingsButton}
          onClickExecuteButton={onClickExecuteButton}
        />
        <div ref="mapWrapper" className={styles.mapWrapper}>aaa</div>
        <Recommends
          items={recommendItems}
          shown={recommendShown}
          onClickItem={onClickRecommendItem}
          onClickToggleButton={onClickRecommendToggleButton}
        />
      </section>
    );
  }
}
