import React, { Component } from 'react';
import styles from './index.css';
import commonStyles from '../common.css';

export default class MessageForm extends Component {

  render() {
    return (
      <section className={`${commonStyles.staticContent} ${styles.messageForm}`}>
        <h2>お問い合わせフォーム</h2>
        <textarea rows="4"></textarea>
        <p>ご意見・ご感想などがあればお願いしますｍ(_ _)ｍ<br/>
          返信が必要な方は本文中にメールアドレスを記載してください</p>
        <button action type="button">送信する</button>
      </section>
    );
  }
}
