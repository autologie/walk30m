import React, { Component } from 'react';
import Recommends from '../recommends';
import Tools from '../tools';

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
  }

  componentWillUpdate(props) {
    const {lat, lng} = props.mapCenter || {};

    this.map.setCenter(new google.maps.LatLng(lat, lng));
    this.map.setZoom(props.mapZoom);
  }

  render() {
    const {
      settings,
      onChangeSettings,
      recommendItems,
      onClickRecommendItem,
      advancedSettingsShown,
      onClickShowAdvancedSettingsButton,
      onClickInitializeAdvancedSettingsButton,
    } = this.props;

    return (
      <section style={{height: '100%'}}>
        <Tools
          settings={settings}
          onChange={onChangeSettings}
          advancedShown={advancedSettingsShown}
          onClickShowAdvancedButton={onClickShowAdvancedSettingsButton}
          onClickInitializeAdvancedSettingsButton={onClickInitializeAdvancedSettingsButton}
        />
        <div ref="mapWrapper" style={{height: '100%'}}></div>
        <Recommends
          items = {recommendItems}
          onClickItem={onClickRecommendItem}
        />
      </section>
    );
  }
}
