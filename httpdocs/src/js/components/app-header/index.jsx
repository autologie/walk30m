import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './index.css';

export default class AppHeader extends Component {

  constructor(props) {
    super(props);
    this.handleClickMenuButton = this.handleClickMenuButton.bind(this);
    this.state = {
      menuShown: this.props.status === 'entrance'
    };
  }

  handleClickMenuButton() {
    this.setState(prev => ({menuShown: !prev.menuShown}));
  }

  render() {
    const menu = this.state.menuShown ? (
      <ul className={styles.menu}>
        <li><Link to="/">HOME</Link></li>
        <li><Link to="/about">このサービスについて</Link></li>
        <li><Link to="/release-note">リリース履歴</Link></li>
        <li><Link to="/message-form">お問い合わせ</Link></li>
      </ul>
    ) : null;
    const menuButton = this.props.status !== 'entrance' ? (
      <button
        onClick={this.handleClickMenuButton}
        className={styles.menuButton}
        type="button"
      >{this.state.menuShown ? '閉じる' : '出す'}</button>
    ) : null;

    return (
      <section className={`${styles[this.props.status]} ${styles.appHeader}`}>
        <h1>30分でどこまでいける？</h1>
        <p>指定した時間内に車や徒歩で移動できるエリアを調べます。</p>
        {menu}
        {menuButton}
      </section>
    );
  }
}
