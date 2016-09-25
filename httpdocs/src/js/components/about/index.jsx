import React, { Component } from 'react';
import styles from './index.css';
import commonStyles from '../common.css';

export default class About extends Component {

  render() {
    return (
      <section className={`${commonStyles.staticContent} ${styles.about}`}>
        <h2>このサービスについて</h2>
        <p>walk30mは、ある場所から指定した時間内に車や徒歩で移動できるエリアを調べることができるサービスです。</p>
        <h3>つかいかた</h3>
        <p>出発地点と移動時間を入力して調べるボタンを押すだけです。</p>
        <p>ボタンを押すと地図が表示され、計算結果が地図に表示されていきます。数十秒〜1分程度で完了します。</p>
        <p>完了後に表示されたエリアをクリックすると、結果の詳細が閲覧できます。</p>
        <p>また、詳細設定の画面から、計算についてのいくつかのより詳細な設定を行うことができます。</p>
        <h3>つかいみち</h3>
        <ul>
          <li>散歩やドライブの行き先を考えるのに使います。</li>
          <li>部屋探しの参考にします。</li>
          <li>その他なんでも。</li>
        </ul>
        <h3>制約・既知の問題</h3>
        <ul>
          <li>海沿い、川沿い、山間部などで計算が完了しなかったり、時間がかかる場合があります。</li>
          <li>徒歩圏内は歩道を含まないルートにもとづいて計算されている場合があります。</li>
        </ul>
        <h3>データ・素材など</h3>
        <p>お世話になっております。</p>
        <ul>
          <li>ルート計算 <a href="https://developers.google.com/maps/documentation/javascript/directions" target="_blank">google maps javascript api v3 directions service</a></li>
          <li>ポリゴンのスプライン補間 <a href="http://numericjs.com/" target="_blank">numeric javascript</a> by sébastien loisel</li>
        </ul>
      </section>
    );
  }
}
