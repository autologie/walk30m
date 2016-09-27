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
import {
  haneldChangeSettings,
  handleClickRecommendItem,
  handleClickShowAdvancedSettingsButton,
  handleClickMenuButton,
  handleClickInitializeAdvancedSettingsButton,
  handleClickExecuteButton,
  handleClickRecommendToggleButton,
  handleChangeSettings,
  handleChangeInquiryMessage,
  handleClickSubmitInquiryMessageButton,
} from '../../actions';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: 'entrance',
      calculations: [],
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

    document.addEventListener('click', (ev) => {
      if (this.state.status !== 'entrance') {
        this.setState({menuShown: false});
      }
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
        calculations: this.state.calculations,
        onChangeSettings: (prop, value) => handleChangeSettings(this, prop, value),
        onChangeInquiryMessage: (message) => handleChangeInquiryMessage(this, message),
        onClickShowAdvancedSettingsButton: () => handleClickShowAdvancedSettingsButton(this),
        onClickRecommendItem: (item) => handleClickRecommendItem(this, item),
        onClickInitializeAdvancedSettingsButton: () => handleClickInitializeAdvancedSettingsButton(this),
        onClickExecuteButton: () => handleClickExecuteButton(this),
        onClickRecommendToggleButton: () => handleClickRecommendToggleButton(this),
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
