import React, { Component } from 'react';
import Recommends from '../recommends';
import Tools from '../tools';
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
  }

  componentWillUpdate(props) {
    const {lat, lng} = props.mapCenter || {};

    this.map.setCenter(new google.maps.LatLng(lat, lng));
    this.map.setZoom(props.mapZoom);

    if (props.calculations.length > 0) {
      console.log(this.map.data.addGeoJson({
        type: 'FeatureCollection',
        features: props.calculations[0].vertices.map(vertex => ({
          id: Math.random().toString(),
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: [vertex.lng, vertex.lat]
          },
        })),
      }));
    }
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
    const children = React.Children.map(this.props.children, child => React.cloneElement(child, this.props));
    console.log(children)

    return (
      <section className={styles.map}>
        {children}
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
