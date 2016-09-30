import React, { Component } from 'react';
import styles from './index.css';

export default class Calculations extends Component {
  render() {
    const {items, shown, onClickToggleButton, onClickDeleteButton} = this.props;
    const elements = items.map((item, idx) => {
      return (
        <li key={idx}>
          <h3>{item.settings.origin.address}</h3>
          <button
            action
            className={styles.deleteButton}
            onClick={() => onClickDeleteButton(item)}
            type="button"
          >
            X
          </button>
        </li>
      );
    });
    const body = shown ? (<ul>{elements}</ul>) : null;
    const buttonMessage = shown ? '閉じる' : '計算結果の履歴';
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
