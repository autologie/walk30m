import React, { Component } from 'react';
import styles from './index.css';
import Arrow from '../../icons/Arrow.jsx';

export default class Recommends extends Component {
  render() {
    const {items, onClickItem, shown, onClickToggleButton} = this.props;
    const elements = shown ? items.map((item, idx) => (
      <li
        key={idx}
        onClick={() => onClickItem(item)}
        style={{backgroundImage: `url(${item.image})`}}
      >
        <h3>{item.title}</h3>
      </li>
    )) : null;
    const buttonMessage = shown ? <Arrow direction="down"/> : 'おすすめスポット';

    return (
      <section className={`${styles.recommends} ${styles[shown ? 'open' : 'closed']}`}>
        <ul>
          <button
            className={styles.toggleButton}
            onClick={onClickToggleButton}
            type="button"
            role="close">
            {buttonMessage}
          </button>
          {elements}
        </ul>
      </section>
    );
  }
}
