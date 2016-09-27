import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './index.css';

const menuList = [
  {path: '/', label: 'HOME'},
  {path: '/about', label: 'このサービスについて'},
  {path: '/release-note', label: 'リリース履歴'},
  {path: '/message-form', label: 'お問い合わせ'},
];

export default class AppHeader extends Component {
  render() {
    const {status, menuShown, onClickMenuButton} = this.props;
    const menuElements = menuList.map(item => (
      <li
        className={window.location.pathname === item.path ? styles.active : null}
        key={item.path}
      >
        <Link to={item.path}>{item.label}</Link>
      </li>
    ));
    const menu = menuShown ? (
      <ul className={styles.menu}>{menuElements}</ul>
    ) : null;
    const menuButton = status !== 'entrance' ? (
      <button
        onClick={onClickMenuButton}
        className={styles.menuButton}
        type="button"
      >{menuShown ? '閉じる' : '出す'}</button>
    ) : null;

    return (
      <section className={`${styles[status]} ${styles.appHeader}`}>
        <div className={styles.description}>
          <h1><Link className={styles.titleText} to="/">30分でどこまでいける？</Link></h1>
          <p>指定した時間内に車や徒歩で移動できるエリアを調べます。</p>
        </div>
        <div className={styles.socialButtons}></div>
        {menu}
        {menuButton}
      </section>
    );
  }
}
