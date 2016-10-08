import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './index.css';
import commonStyles from '../common.css';
import MenuIcon from '../../icons/MenuIcon';

export const menuList = [
  {path: '/home', label: 'HOME'},
  {path: '/calculation-list', label: '計算履歴'},
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
        className={`${currentMenuPath === item.path ? styles.active : null} ${commonStyles.menuItem}`}
        key={item.path}
      >
        <Link className={commonStyles.menuItemLink} to={item.path}>{item.label}</Link>
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
      ><MenuIcon mode={menuShown ? 'hide' : 'show'} /></button>
    ) : null;

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
