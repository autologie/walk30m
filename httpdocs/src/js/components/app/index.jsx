import React, { Component } from 'react';
import AppHeader from '../app-header';
import Tools from '../tools';
import Map from '../map';
import ReleaseNote from '../release-note';
import About from '../about';
import MessageForm from '../message-form';
import styles from './index.css';

export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      status: 'entrance',
    };
  }

  render() {
    const cls = this.props.location.pathname.split('/')[1] ? null : 'fixedHeight';

    return (
      <div className={`${styles[this.state.status]} ${styles.app} ${styles[cls]}`}>
        <AppHeader status={this.state.status}/>
        <div className={styles.main}>{this.props.children}</div>
      </div>
    );
  }
}
