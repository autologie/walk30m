import React, { Component } from 'react';
import AdvancedTools from './advanced';
import styles from './index.css';
import commonStyles from '../common.css';
import ExpandIcon from '../../icons/Expand.jsx';
import SelModeList from './selection-modes';

const timeOptions = [
  {value: 5 * 60, label: '5分'},
  {value: 10 * 60, label: '10分'},
  {value: 15 * 60, label: '15分'},
  {value: 20 * 60, label: '20分'},
  {value: 30 * 60, label: '30分'},
  {value: 40 * 60, label: '40分'},
  {value: 50 * 60, label: '50分'},
  {value: 60 * 60, label: '60分'},
  {value: 70 * 60, label: '70分'},
  {value: 80 * 60, label: '80分'},
  {value: 90 * 60, label: '90分'},
  {value: 100 * 60, label: '100分'},
  {value: 110 * 60, label: '110分'},
  {value: 120 * 60, label: '120分'},
  {value: 150 * 60, label: '150分'},
  {value: 3 * 60 * 60, label: '3時間'},
  {value: 4 * 60 * 60, label: '4時間'},
  {value: 5 * 60 * 60, label: '5時間'},
  {value: 6 * 60 * 60, label: '6時間'},
];

export default class Tools extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSelModeListOpen: false,
    };
    this.handleFocusAddressForm = this.handleFocusAddressForm.bind(this);
    this.handleClickSelMode = this.handleClickSelMode.bind(this);
    this.handleClickDocument = this.handleClickDocument.bind(this);
  }

  componentDidMount() {
    document.addEventListener('click', this.handleClickDocument);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickDocument);
  }

  handleClickDocument(ev) {
    if (ev.target !== this.refs.addressForm) {
      this.setState({isSelModeListOpen: false});
    }
  }

  handleFocusAddressForm() {
    this.setState({isSelModeListOpen: true});
  }

  handleClickSelMode(ev, value, args) {
    ev.preventDefault();

    this.refs.addressForm.blur();
    this.props.onClickSelMode(value, args);
  }

  render() {
    const {
      settings,
      onChangeSettings,
      advancedSettingsShown,
      geocoderResults,
      onClickShowAdvancedSettingsButton,
      onClickInitializeAdvancedSettingsButton,
      onClickExecuteButton,
      onClickScrollToTopButton,
    } = this.props;
    const {address, lat, lng} = settings.origin || {};
    const advanced = advancedSettingsShown ? (<AdvancedTools
      settings={settings}
      onChange={onChangeSettings}
      onClickInitializeButton={onClickInitializeAdvancedSettingsButton}
      onClickScrollToTopButton={onClickScrollToTopButton}
    />) : null;
    const timeOptionElements = timeOptions.map(opt => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ));
    const selModeList = this.state.isSelModeListOpen ? (
      <SelModeList
        className={`modalMenu ${styles.selModes}`}
        onClickSelMode={(ev, value, args) => this.handleClickSelMode(ev, value, args)}
        geocoderResults={geocoderResults}
      />
    ) : null;

    return (
      <section className={styles.tools}>
        <div className={styles.basic}>
          <div className={`${styles.toolItem} ${styles.addressForm}`}>
            <label>
              <input
                ref="addressForm"
                type="text"
                value={address}
                onFocus={this.handleFocusAddressForm}
                onChange={(ev) => onChangeSettings('origin', {address: ev.target.value})}
              />
              {selModeList}
              から
            </label>
          </div>
          <div className={`${styles.toolItem} ${styles.travelMode}`}>
            <label>
              <input
                type="radio"
                value="WALKING"
                checked={settings.travelMode === 'WALKING'}
                onChange={(ev) => onChangeSettings('travelMode', 'WALKING')}
              />
              歩いて
            </label>
            <label>
              <input
                type="radio"
                value="DRIVING"
                checked={settings.travelMode === 'DRIVING'}
                onChange={(ev) => onChangeSettings('travelMode', 'DRIVING')}
              />
              車で
            </label>
          </div>
          <div className={styles.toolItem}>
            <label>
              <select
                value={settings.time}
                onChange={(ev) => onChangeSettings('time', ev.target.value)}
              >
                {timeOptionElements}
              </select>
              圏内の範囲を
            </label>
          </div>
          <button
            action
            type="button"
            onClick={onClickExecuteButton}
            disabled={!settings.isValid}
          >調べる</button>
          <button
            className={`${commonStyles.toolButton} ${commonStyles.right}`}
            onClick={onClickShowAdvancedSettingsButton}
            type="button"
          ><ExpandIcon mode={advancedSettingsShown ? 'collapse' : 'expand'} /></button>
        </div>
        {advanced}
      </section>
    );
  }
}
