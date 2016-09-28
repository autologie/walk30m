import React, { Component } from 'react';
import styles from './index.css';

export default class ProgressBar extends Component {
  render() {
    return (
      <div className={styles.progressBar}>
        <div className={styles.progress} style={{width: `${this.props.value * 100}%`}}></div>
      </div>
    );
  }
}
