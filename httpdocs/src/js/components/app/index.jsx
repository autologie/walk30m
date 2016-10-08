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
import Calculation from '../../domain/Calculation';
import CalculationService from '../../domain/CalculationService';
import routeProvider from '../../domain/RouteProvider';
import { browserHistory } from 'react-router';
import * as actions from '../../actions';
import stateProvider from '../../StateProvider';
import { isMobile } from '../../utils/BrowserUtil';

export default class App extends Component {
  constructor(props) {
    super(props);

    document.addEventListener('click', () => {
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
        this.setState({menuShown: false, status: 'normal'});
      } else {
        // HOMEに移動
        this.setState({
          menuShown: nextState.status === 'entrance',
        });
      }
    }
  }

  bindCalculation(calc) {
    calc.on('progress', () => this.setState({dataVersion: +new Date()}));
    calc.on('complete', () => {
      this.setState({dataVersion: +new Date()});
      actions.notify(this, 'I', '完了しました。');
    });
    calc.on('abort', () => {
      this.setState({dataVersion: +new Date()});
      actions.notify(this, 'I', '計算をキャンセルしました。');
    });
    this.setState({
      dataVersion: +new Date(),
      calculations: this.state.calculations.concat([calc]),
    });
  }

  componentWillMount() {
    const data = stateProvider.getInitialState();
    const inProgressCalc = data.calculations.find(calc => calc.isInProgress);

    this.setState(data, () => {
      if (inProgressCalc) {
        this.bindCalculation(inProgressCalc);
        inProgressCalc.resume(new CalculationService(routeProvider));
        browserHistory.push(`/home/calculations/${inProgressCalc.id}`)
      }
    });
  }

  componentDidUpdate() {
    stateProvider.save(this.state);
  }

  isAtHome() {
    return this.props.location.pathname.split('/')[1] === 'home';
  }

  shouldFixHeight() {
    const panelShown = this.state.advancedSettingsShown || this.state.showCalculationDetail;

    return this.isAtHome() && !(isMobile() && panelShown);
  }

  render() {
    const cls = this.shouldFixHeight() ? 'fixedHeight' : null;
    const children = React.Children.map(this.props.children, (child) => {
      return React.cloneElement(child, {
        settings: this.state.mySettings,
        routesShown: this.state.routesShown,
        calculationsShown: this.state.calculationsShown,
        recommendShown: this.state.recommendShown,
        recommendItems: this.state.recommendItems,
        advancedSettingsShown: this.state.advancedSettingsShown,
        mapVersion: this.state.mapVersion,
        dataVersion: this.state.dataVersion,
        mapCenter: this.state.mapCenter,
        mapZoom: this.state.mapZoom,
        menuShown: this.state.menuShown,
        showCalculationDetail: this.state.showCalculationDetail,
        inquiryMessage: this.state.inquiryMessage,
        calculations: this.state.calculations,
        calculation: this.state.calculations.find(calc => {
          return this.props.location.pathname.split('/')[3] === calc.id;
        }),
        geocoderResults: this.state.geocoderResults,
        onChangeSettings: (prop, value) => actions.handleChangeSettings(this, prop, value),
        onChangeInquiryMessage: (message) => actions.handleChangeInquiryMessage(this, message),
        onMapBoundsChange: (center, zoom) => actions.handleMapBoundsChange(this, center, zoom),
        onClickShowAdvancedSettingsButton: () => actions.handleClickShowAdvancedSettingsButton(this),
        onClickRecommendItem: (item) => actions.handleClickRecommendItem(this, item),
        onClickInitializeAdvancedSettingsButton: () => actions.handleClickInitializeAdvancedSettingsButton(this),
        onClickExecuteButton: () => actions.handleClickExecuteButton(this),
        onClickAbortButton: () => actions.handleClickAbortButton(this),
        onClickRecommendToggleButton: () => actions.handleClickRecommendToggleButton(this),
        onClickCalculation: (item) => actions.handleClickCalculation(this, item),
        onClickCalculationsToggleButton: () => actions.handleClickCalculationsToggleButton(this),
        onClickCalculationDeleteButton: (item) => actions.handleClickCalculationDeleteButton(this, item),
        onClickCalculationRetryButton: (item) => actions.handleClickCalculationRetryButton(this, item),
        onClickCalculationDetailToggleButton: () => actions.handleClickCalculationDetailToggleButton(this),
        onClickToggleCalculationRoutesButton: (item) => actions.handleClickToggleCalculationRoutesButton(this, item),
        onClickSubmitInquiryMessageButton: () => actions.handleClickSubmitInquiryMessageButton(this),
        onClickDownloadAllButton: (dataType) => actions.handleClickDownloadAllButton(this, dataType),
        onCalculationNotFound: () => actions.handleCalculationNotFound(this),
        onClickScrollToTopButton: () => actions.handleClickScrollToTopButton(this),
        onClickSelMode: (mode, values) => actions.handleClickSelMode(this, mode, values),
      });
    });

    return (
      <div className={`${styles[this.state.status]} ${styles.app} ${styles[cls]}`}>
        <AppHeader
          status={this.state.status}
          menuShown={this.state.menuShown}
          onClickMenu={() => actions.handleClickMenuButton(this)}
        />
        <div className={styles.main}>{children}</div>
        <Notification content={this.state.notification} />
      </div>
    );
  }
}
