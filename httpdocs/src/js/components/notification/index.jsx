import React, { Component } from 'react';
import styles from './index.css';

export default class Notification extends Component {

  render() {
    const {level, message} = this.props.content || {};

    return (
      <p className={`${message ? styles.shown : styles.hidden} ${styles.notification} ${styles[level]}`}>{message}</p>
    );
  }
}
