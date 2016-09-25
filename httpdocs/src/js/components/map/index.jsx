import React, { Component } from 'react';
import Recommends from '../recommends';
import Tools from '../tools';

export default class Map extends Component {
  componentDidMount() {
    const el = this.refs.mapWrapper;
    const map = new google.maps.Map(el, {
      center: new google.maps.LatLng(36, 140),
      zoom: 13,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER,
      },
      streetViewControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER,
      },
    });

    map.addListener('tileloaded', () => window.console.log('google map: tile loaded.'));
  }

  render() {
    return (
      <section style={{height: '100%'}}>
        <Tools />
        <div ref="mapWrapper" style={{height: '100%'}}></div>
        <Recommends />
      </section>
    );
  }
}
