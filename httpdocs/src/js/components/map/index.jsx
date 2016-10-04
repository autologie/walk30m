import _ from 'lodash';
import React, { Component } from 'react';
import Recommends from '../recommends';
import Calculations from '../calculations';
import Tools from '../tools';
import styles from './index.css';
import CalcGeoJson from '../../domain/CalcGeoJson';

export default class Map extends Component {
  componentDidMount() {
    const {mapCenter, mapZoom, onMapBoundsChange, onClickCalculation} = this.props;
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

    map.data.setStyle((feature) => {
      if (feature.getId().match(/route/)) return {visible: false};
      if (feature.getId().match(/vertex/)) return {visible: false};
      return {};
    });

    google.maps.event.addListener(map.data, 'click', ({feature}) => {
      onClickCalculation(feature.getProperty('calculation'));
    });

    this.map = map;

    this.updateMap();
    this.updateData();

    // for debugging
    window.gmap = map;
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
    console.log('updating map data...');

    const mapData = this.map.data;
    const calcs = this.props.calculations.filter(calc => !calc.isAborted);
    const [newFeatures, toUpdate]  = _.reduce(calcs, ([features, polygons], calc) => {
      const {origin, vertexArray, polygon, routes} = new CalcGeoJson(calc);

      return [
        features.concat([origin]).concat(vertexArray).concat(polygon ? [polygon] : []).concat(routes),
        polygons.concat(polygon && calc.isInProgress ? [polygon] : []),
      ];
    }, [[], []]);

    mapData.toGeoJson(({features}) => {
      const getId = _.property('id');
      const toAdd = _.differenceBy(newFeatures, features, getId).concat(toUpdate);
      const toRemove = _.differenceBy(features, newFeatures, getId).concat(toUpdate);

      console.log(toUpdate, toRemove, toAdd);

      // delete
      toRemove.forEach((feature) => {
        const found = mapData.getFeatureById(feature.id);

        found && mapData.remove(found);
      });

      // add
      mapData.addGeoJson({type: 'FeatureCollection', features: toAdd});
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
      onClickCalculation,
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
          onClickCalculation={onClickCalculation}
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
