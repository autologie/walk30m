import React, { Component } from 'react';
import styles from './index.css';

export default class Recommends extends Component {

  constructor(prop) {
    super(prop);
    this.handleClickCloseButton = this.handleClickCloseButton.bind(this);
    this.state = {
      closed: false,
    };
  }

  handleClickCloseButton() {
    this.setState(prev => ({closed: !prev.closed}));
  }

  render() {
    console.log(this.props);
    const {items, onClickItem} = this.props;
    const elements = items.map((item, idx) => (
      <li
        key={idx}
        onClick={() => onClickItem(item)}
        style={({backgroundImage: `url(${item.image})`})}
      >
        <h3>{item.title}</h3>
      </li>
    ));
    const body = this.state.closed ? null : (<ul>{elements}</ul>);
    const buttonMessage = this.state.closed ? 'おすすめスポット' : '閉じる';

    return (
      <section className={styles.recommends}>
        <button onClick={this.handleClickCloseButton} type="button" role="close">{buttonMessage}</button>
        {body}
      </section>
    );
  }
}
