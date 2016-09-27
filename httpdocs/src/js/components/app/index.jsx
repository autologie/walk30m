import _ from 'lodash';
import React, { Component } from 'react';
import request from 'superagent';
import AppHeader from '../app-header';
import Tools from '../tools';
import Map from '../map';
import ReleaseNote from '../release-note';
import About from '../about';
import MessageForm from '../message-form';
import styles from './index.css';
import Settings from '../../domain/Settings';
import recommendItems from 'json!../../../resources/recommends.json';
import CalculationService from '../../CalculationService';
import { PUBLIC_API_URL_BASE } from '../../config';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: 'entrance',
      menuShown: true,
      mapCenter: {
        lat: 35.6618349,
        lng: 139.722119,
      },
      mapZoom: 13,
      mySettings: new Settings(null, 'WALKING', 30 * 60),
      advancedSettingsShown: false,
      inquiryMessage: '',
      notification: null,
      recommendShown: true,
      recommendItems,
    };
    this.handleChangeSettings = this.handleChangeSettings.bind(this);
    this.handleClickRecommendItem = this.handleClickRecommendItem.bind(this);
    this.handleClickShowAdvancedSettingsButton = this.handleClickShowAdvancedSettingsButton.bind(this);
    this.handleClickMenuButton = this.handleClickMenuButton.bind(this);
    this.handleClickInitializeAdvancedSettingsButton = this.handleClickInitializeAdvancedSettingsButton.bind(this);
    this.handleClickExecuteButton = this.handleClickExecuteButton.bind(this);
    this.handleClickRecommendToggleButton = this.handleClickRecommendToggleButton.bind(this);
    this.handleChangeInquiryMessage = this.handleChangeInquiryMessage.bind(this);
    this.handleClickSubmitInquiryMessageButton = this.handleClickSubmitInquiryMessageButton.bind(this);
  }

  handleChangeSettings(property, value) {
    return this.setState(prev => {
      switch (property) {
        case 'origin':
          return {
            mySettings: prev.mySettings.withOrigin(value),
            mapCenter: _.pick(value, 'lat', 'lng'),
          };
        case 'travelMode':
          return {mySettings: prev.mySettings.withTravelMode(value)};
        case 'time':
          return {mySettings: prev.mySettings.withTime(value)};
        case 'preference':
          return {mySettings: prev.mySettings.withPreference(value)};
        case 'avoidTolls':
          return {mySettings: prev.mySettings.withAvoidTolls(value)};
        case 'avoidHighways':
          return {mySettings: prev.mySettings.withAvoidHighways(value)};
        case 'avoidFerries':
          return {mySettings: prev.mySettings.withAvoidFerries(value)};
      }
    });
  }

  handleClickRecommendItem(item) {
    const {origin, travelMode, time} = item.params || {};

    this.setState(prev => ({
      mySettings: prev.mySettings
        .withOrigin(origin)
        .withTravelMode(travelMode)
        .withTime(time),
      mapCenter: _.pick(origin, 'lat', 'lng'),
      mapZoom: 13,
    }));
  }

  handleClickShowAdvancedSettingsButton() {
    this.setState(prev => ({
      advancedSettingsShown: !prev.advancedSettingsShown,
      status: prev.advancedSettingsShown === false ? 'normal' : 'entrance',
      menuShown: prev.advancedSettingsShown,
    }));
  }

  handleClickMenuButton() {
    this.setState(prev => ({menuShown: !prev.menuShown}));
  }

  handleClickInitializeAdvancedSettingsButton() {
    this.setState(prev => ({
      mySettings: prev.mySettings.withDefaultAdvancedSettings(),
    }));
  }

  handleClickExecuteButton() {
    this.setState({
      status: 'normal',
      advancedSettingsShown: false,
      recommendShown: false,
    }, () => {
      new CalculationService().start(Object.assign({
        origin: new google.maps.LatLng(
          this.state.mySettings.lat,
          this.state.mySettings.lng,
        ),
      }, this.state.mySettings));
    });
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.state.status === 'entrance' && nextState.status !== 'entrance') {
      this.setState({menuShown: false});
    }
    if (this.props.location.pathname !== nextProps.location.pathname) {
      if (nextProps.location.pathname.split('/')[1]) {
        // HOME以外に移動
        this.setState({menuShown: true, status: 'entrance'});
      } else {
        // HOMEに移動
        this.setState({
          menuShown: nextState.advancedSettingsShown ? false : true,
          status: nextState.advancedSettingsShown ? 'normal' : 'entrance',
        });
      }
    }
  }

  handleClickRecommendToggleButton() {
    this.setState(prev => ({recommendShown: !prev.recommendShown}));
  }

  handleChangeInquiryMessage(inquiryMessage) {
    this.setState({inquiryMessage});
  }

  handleClickSubmitInquiryMessageButton() {
    request
      .post(`${PUBLIC_API_URL_BASE}/messages`)
      .set('Content-Type': 'application/json; charset=UTF-8')
      .send({
        message: `${uuid}, ${message}`,
        url: window.location.href,
      }).end((err, data) => {
        if (err) {
          this.notify('E', err);
        } else {
          this.setState({inquiryMessage: ''});
          this.notify('I', '送信しました');
        }
      });
  }

  notify(level, message) {
    this.setState({notification: {level, message}});
    setTimeout(() => this.setState({notification: null}), 3000);
  }

  render() {
    const cls = this.props.location.pathname.split('/')[1] ? null : 'fixedHeight';
    const children = React.Children.map(this.props.children, (child) => {
      return React.cloneElement(child, {
        settings: this.state.mySettings,
        recommendShown: this.state.recommendShown,
        recommendItems: this.state.recommendItems,
        advancedSettingsShown: this.state.advancedSettingsShown,
        mapCenter: this.state.mapCenter,
        mapZoom: this.state.mapZoom,
        menuShown: this.state.menuShown,
        inquiryMessage: this.state.inquiryMessage,
        onChangeSettings: this.handleChangeSettings,
        onClickShowAdvancedSettingsButton: this.handleClickShowAdvancedSettingsButton,
        onClickRecommendItem: this.handleClickRecommendItem,
        onClickInitializeAdvancedSettingsButton: this.handleClickInitializeAdvancedSettingsButton,
        onClickExecuteButton: this.handleClickExecuteButton,
        onClickRecommendToggleButton: this.handleClickRecommendToggleButton,
        onChangeInquiryMessage: this.handleChangeInquiryMessage,
        onClickSubmitInquiryMessageButton: this.handleClickSubmitInquiryMessageButton,
      });
    });

    return (
      <div className={`${styles[this.state.status]} ${styles.app} ${styles[cls]}`}>
        <AppHeader
          status={this.state.status}
          menuShown={this.state.menuShown}
          onClickMenuButton={this.handleClickMenuButton}
        />
        <div className={styles.main}>{children}</div>
      </div>
    );
  }
}
