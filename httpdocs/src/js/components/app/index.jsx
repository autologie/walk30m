import _ from 'lodash';
import React, { Component } from 'react';
import AppHeader from '../app-header';
import Tools from '../tools';
import Map from '../map';
import ReleaseNote from '../release-note';
import About from '../about';
import MessageForm from '../message-form';
import styles from './index.css';
import Settings from '../../domain/Settings';
import CalculationService from '../../CalculationService';

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
      recommendShown: true,
      recommendItems: [
        {
          title: '札幌市街から車で60分',
          image: 'http://www.welcome.city.sapporo.jp/sightseeing.photolibrary/img/c011-068-preview.jpg',
          params: {
            origin: {
              address: '〒060-0042 Hokkaido Prefecture, Sapporo, Odorinishi, 1丁目-12丁目',
              lat: 43.0599007,
              lng: 141.3455438,
            },
            travelMode: 'DRIVING',
            time: 60 * 60,
            avoidTolls: false,
            avoidHighways: false,
            avoidFerries: false,
          },
        },
        {
          title: '東京駅から歩いて10分',
          image: 'http://www.tokyo-date.net/etc_tokyo_st/images/71.jpg',
          params: {
            origin: {
              address: '〒100-0005 丁目, 1 Chome Marunouchi, Chiyoda, Tokyo 100-0005',
              lat: 35.681298,
              lng: 139.7640582,
            },
            travelMode: 'WALKING',
            time: 10 * 60,
            avoidTolls: false,
            avoidHighways: false,
            avoidFerries: false,
          },
        },
        {
          title: 'JR金沢駅から歩いて30分',
          image: 'http://www.kanazawa-kankoukyoukai.or.jp/com/img/movphoto/photolib/02shisetsu/low/003_n.jpg',
          params: {
            origin: {
              address: '〒920-0858 Ishikawa Prefecture, 木ノ新保町1番1号',
              lat: 36.5780574,
              lng: 136.6464709,
            },
            travelMode: 'WALKING',
            time: 30 * 60,
            avoidTolls: false,
            avoidHighways: false,
            avoidFerries: false,
          },
        },
        {
          title: 'JR函館駅から歩いて20分',
          image: 'http://www.hakobura.jp/photo_library/img/The_night_view_from_Mt_Hakodate-1-10MB.jpg',
          params: {
            origin: {
              address: '〒040-0063 Hokkaidō, Hakodate-shi, Wakamatsuchō, 12',
              lat: 41.77378,
              lng: 140.7242853,
            },
            travelMode: 'WALKING',
            time: 20 * 60,
            avoidTolls: false,
            avoidHighways: false,
            avoidFerries: false,
          },
        },
        {
          title: '雷門から歩いて10分',
          image: 'http://www.tokyo-date.net/machi_asakusa/images/37.jpg',
        },
        {
          title: '小樽運河から歩いて20分',
          image: 'http://photo.hokkaido-blog.com/photo-l/01/otaruunga.jpg',
        },
      ],
    };
    this.handleChangeSettings = this.handleChangeSettings.bind(this);
    this.handleClickRecommendItem = this.handleClickRecommendItem.bind(this);
    this.handleClickShowAdvancedSettingsButton = this.handleClickShowAdvancedSettingsButton.bind(this);
    this.handleClickMenuButton = this.handleClickMenuButton.bind(this);
    this.handleClickInitializeAdvancedSettingsButton = this.handleClickInitializeAdvancedSettingsButton.bind(this);
    this.handleClickExecuteButton = this.handleClickExecuteButton.bind(this);
    this.handleClickRecommendToggleButton = this.handleClickRecommendToggleButton.bind(this);
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
      status: prev.advancedSettingsShown === false ? 'normal' : prev.status,
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
        onChangeSettings: this.handleChangeSettings,
        onClickShowAdvancedSettingsButton: this.handleClickShowAdvancedSettingsButton,
        onClickRecommendItem: this.handleClickRecommendItem,
        onClickInitializeAdvancedSettingsButton: this.handleClickInitializeAdvancedSettingsButton,
        onClickExecuteButton: this.handleClickExecuteButton,
        onClickRecommendToggleButton: this.handleClickRecommendToggleButton,
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
