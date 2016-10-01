import _ from 'lodash';
import React, { Component } from 'react';
import Recommends from '../recommends';
import Calculations from '../calculations';
import Tools from '../tools';
import styles from './index.css';

export default class Map extends Component {
  componentDidMount() {
    const {mapCenter, mapZoom, onMapBoundsChange} = this.props;
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

    google.maps.event.addListener(map, 'idle', () => {
      onMapBoundsChange(map.getCenter().toJSON(), map.getZoom());
    });

    this.map = map;

    this.updateMap();
    this.updateData();
  }

  componentDidUpdate({calculations, mapVersion, dataVersion}) {
    console.log(calculations);
    if (this.props.mapVersion !== mapVersion) this.updateMap()
    if (this.props.dataVersion !== dataVersion) this.updateData();
  }

  updateMap() {
    const {lat, lng} = this.props.mapCenter || {};

    this.map.setCenter(new google.maps.LatLng(lat, lng));
    this.map.setZoom(this.props.mapZoom);
  }

  updateData() {
    class FeatureCollection {
      constructor(features) {
        this.type = 'FeatureCollection';
        this.features = features;
      }
    }

    const calcs = this.props.calculations.filter(calc => !calc.isAborted);
    const newCalcs = _.flatten(calcs.map(calc => {
      return calc.vertices.map((vertex, vid) => ({
        id: `calculation-${calc.id}-vertex-${vid}`,
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: [vertex.lng, vertex.lat]
        },
      }));
    }));

    this.map.data.toGeoJson(oldGeoJson => {
      const oldCalcs = oldGeoJson.features;
      const added = _.differenceBy(newCalcs, oldCalcs, calc => calc.id);
      const deleted = _.differenceBy(oldCalcs, newCalcs, calc => calc.id);

      // add
      this.map.data.addGeoJson(new FeatureCollection(added));

      // delete
      deleted.forEach(calc => {
        const feature = this.map.data.getFeatureById(calc.id);

        if (feature) {
          this.map.data.remove(feature);
        }
      });
    });
  }

  render() {
    const {
      settings,
      recommendItems,
      recommendShown,
      calculations,
      calculationsShown,
      advancedSettingsShown,
      onClickRecommendItem,
      onChangeSettings,
      onClickShowAdvancedSettingsButton,
      onClickInitializeAdvancedSettingsButton,
      onClickExecuteButton,
      onClickRecommendToggleButton,
      onClickCalculationsToggleButton,
      onClickCalculationDeleteButton,
    } = this.props;
    const children = React.Children.map(this.props.children, child => React.cloneElement(child, this.props));

    return (
      <section className={styles.map}>
        {children}
        <div ref="mapWrapper" className={styles.mapWrapper}>aaa</div>
        <Calculations
          items={calculations}
          shown={calculationsShown}
          onClickToggleButton={onClickCalculationsToggleButton}
          onClickDeleteButton={onClickCalculationDeleteButton}
        />
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
