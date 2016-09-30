import React, { Component } from 'react';
import AppHeader from '../app-header';
import Tools from '../tools';
import Map from '../map';
import ReleaseNote from '../release-note';
import About from '../about';
import MessageForm from '../message-form';
import Notification from '../notification';
import styles from './index.css';
import Settings from '../../domain/Settings';
import recommendItems from 'json!../../../resources/recommends.json';
import Calculation from '../../calculation';
import {
  haneldChangeSettings,
  handleClickRecommendItem,
  handleClickShowAdvancedSettingsButton,
  handleClickMenuButton,
  handleClickInitializeAdvancedSettingsButton,
  handleClickExecuteButton,
  handleClickAbortButton,
  handleClickRecommendToggleButton,
  handleClickCalculationsToggleButton,
  handleClickCalculationDeleteButton,
  handleChangeSettings,
  handleChangeInquiryMessage,
  handleClickSubmitInquiryMessageButton,
  handleMapBoundsChange,
} from '../../actions';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: 'entrance',
      calculations: [],
      menuShown: true,
      mapVersion: +new Date(),
      dataVersion: +new Date(),
      mapCenter: {
        lat: 35.6618349,
        lng: 139.722119,
      },
      mapZoom: 13,
      mySettings: new Settings(null, 'WALKING', 30 * 60),
      advancedSettingsShown: false,
      inquiryMessage: '',
      notification: null,
      calculationsShown: false,
      recommendShown: true,
      recommendItems,
    };

    document.addEventListener('click', (ev) => {
      if (this.state.status !== 'entrance') {
        this.setState({menuShown: false});
      }
    });
  }

  componentWillUpdate(nextProps, nextState) {
    const prevRoute = this.props.location.pathname.split('/')[1];
    const nextRoute = nextProps.location.pathname.split('/')[1];

    if (this.state.status === 'entrance' && nextState.status !== 'entrance') {
      this.setState({menuShown: false});
    }
    if (prevRoute !== nextRoute) {
      if (nextRoute !== 'home') {
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

  componentWillMount() {
    const serialized = window.localStorage.getItem('walk30m-data');

    if (!serialized) return;

    const data = JSON.parse(serialized);
    const status = this.isAtHome() ? data.status : 'entrance';

    this.setState(Object.assign(data, {
      mySettings: new Settings(data.mySettings),
      calculations: data.calculations
        .map(calc => Calculation.deserialize(calc))
        .filter(calc => calc.isCompleted),
      status,
      menuShown: status === 'entrance',
      notification: null,
      recommendItems: this.state.recommendItems,
    }));
  }

  componentDidUpdate() {
    window.localStorage.setItem('walk30m-data', JSON.stringify(this.state));
  }

  isAtHome() {
    return this.props.location.pathname.split('/')[1] === 'home';
  }

  render() {
    const cls = this.isAtHome() ? 'fixedHeight' : null;
    const children = React.Children.map(this.props.children, (child) => {
      return React.cloneElement(child, {
        settings: this.state.mySettings,
        calculationsShown: this.state.calculationsShown,
        recommendShown: this.state.recommendShown,
        recommendItems: this.state.recommendItems,
        advancedSettingsShown: this.state.advancedSettingsShown,
        mapVersion: this.state.mapVersion,
        dataVersion: this.state.dataVersion,
        mapCenter: this.state.mapCenter,
        mapZoom: this.state.mapZoom,
        menuShown: this.state.menuShown,
        inquiryMessage: this.state.inquiryMessage,
        calculations: this.state.calculations,
        onChangeSettings: (prop, value) => handleChangeSettings(this, prop, value),
        onChangeInquiryMessage: (message) => handleChangeInquiryMessage(this, message),
        onMapBoundsChange: (center, zoom) => handleMapBoundsChange(this, center, zoom),
        onClickShowAdvancedSettingsButton: () => handleClickShowAdvancedSettingsButton(this),
        onClickRecommendItem: (item) => handleClickRecommendItem(this, item),
        onClickInitializeAdvancedSettingsButton: () => handleClickInitializeAdvancedSettingsButton(this),
        onClickExecuteButton: () => handleClickExecuteButton(this),
        onClickAbortButton: () => handleClickAbortButton(this),
        onClickRecommendToggleButton: () => handleClickRecommendToggleButton(this),
        onClickCalculationsToggleButton: () => handleClickCalculationsToggleButton(this),
        onClickCalculationDeleteButton: (item) => handleClickCalculationDeleteButton(this, item),
        onClickSubmitInquiryMessageButton: () => handleClickSubmitInquiryMessageButton(this),
      });
    });

    return (
      <div className={`${styles[this.state.status]} ${styles.app} ${styles[cls]}`}>
        <AppHeader
          debug={this.state.calculations}
          status={this.state.status}
          menuShown={this.state.menuShown}
          onClickMenu={() => handleClickMenuButton(this)}
        />
        <div className={styles.main}>{children}</div>
        <Notification content={this.state.notification} />
      </div>
    );
  }
}
