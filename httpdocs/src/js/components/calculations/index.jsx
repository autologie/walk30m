import _ from 'lodash';
import { browserHistory } from 'react-router';
import React, { Component } from 'react';
import styles from './index.css';
import * as Helper from '../../utils/TextHelper';
import CloseCircle from '../../icons/CloseCircle';

export default class Calculations extends Component {
  render() {
    const {items, shown, onClickToggleButton, onClickDeleteButton, onClickCalculation} = this.props;
    const elements = items.map((item, idx) => {
      return (
        <li
          key={idx}
          onClick={() => onClickCalculation(item)}
        >
          <h3>{item.settings.origin.address}</h3>
          <p>ステータス: {Helper.getStatusText(item)}</p>
          <button
            action
            className={styles.deleteButton}
            onClick={() => onClickDeleteButton(item)}
            type="button"
          ><CloseCircle /></button>
        </li>
      );
    });
    const body = shown ? (<ul>{elements}</ul>) : null;
    const buttonMessage = shown ? '閉じる' : `計算結果の履歴（${items.length}）`;
    const button = items.length > 0 ? (
      <button onClick={this.props.onClickToggleButton} type="button" role="close">
        {buttonMessage}
      </button>) : null;

    return (
      <section className={styles.calculations}>
        {button}
        {body}
      </section>
    );
  }
}
