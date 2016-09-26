import React, { Component } from 'react';
import styles from './index.css';

export default class Recommends extends Component {
  render() {
    const {items, onClickItem, shown, onClickToggleButton} = this.props;
    const elements = items.map((item, idx) => (
      <li
        key={idx}
        onClick={() => onClickItem(item)}
        style={{backgroundImage: `url(${item.image})`}}
      >
        <h3>{item.title}</h3>
      </li>
    ));
    const body = shown ? (<ul>{elements}</ul>) : null;
    const buttonMessage = shown ? '閉じる' : 'おすすめスポット';

    return (
      <section className={styles.recommends}>
        <button onClick={onClickToggleButton} type="button" role="close">{buttonMessage}</button>
        {body}
      </section>
    );
  }
}
