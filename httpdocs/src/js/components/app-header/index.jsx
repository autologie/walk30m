import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './index.css';

export const menuList = [
  {path: '/home', label: 'HOME'},
  {path: '/about', label: 'このサービスについて'},
  {path: '/release-note', label: 'リリース履歴'},
  {path: '/message-form', label: 'お問い合わせ'},
];

export default class AppHeader extends Component {
  render() {
    const {status, menuShown, onClickMenu, debug} = this.props;
    const currentMenuPath = window.location.pathname.split('/').slice(0, 2).join('/');
    const menuElements = menuList.map(item => (
      <li
        className={currentMenuPath === item.path ? styles.active : null}
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
        className={styles.menuButton}
        onClick={onClickMenu}
        type="button"
        style={{pointerEvents: menuShown ? 'none' : 'auto'}}
      >{menuShown ? '閉じる' : '出す'}</button>
    ) : null;

    // <pre style={{maxHeight: '100px', overflow: 'scroll'}} className={styles.socialButtons}>{JSON.stringify(debug, null, '\t')}</pre>
    return (
      <section className={`${styles[status]} ${styles.appHeader}`}>
        <div className={styles.description}>
          <h1><Link className={styles.titleText} to="/">30分でどこまでいける？</Link></h1>
          <p>指定した時間内に車や徒歩で移動できるエリアを調べます。</p>
        </div>
        {menu}
        {menuButton}
      </section>
    );
  }
}
