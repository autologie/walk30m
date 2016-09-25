import React, { Component } from 'react';
import styles from './index.css';

export default class Recommends extends Component {

  render() {
    const items = [
      {
        title: 'JR金沢駅から歩いて30分',
        image: 'http://www.kanazawa-kankoukyoukai.or.jp/com/img/movphoto/photolib/02shisetsu/low/003_n.jpg',
      },
      {
        title: 'JR函館駅から歩いて20分',
        image: 'http://www.hakobura.jp/photo_library/img/The_night_view_from_Mt_Hakodate-1-10MB.jpg',
      },
      {
        title: '雷門から歩いて10分',
        image: 'http://www.tokyo-date.net/machi_asakusa/images/37.jpg',
      },
      {
        title: '小樽運河から歩いて20分',
        image: 'http://photo.hokkaido-blog.com/photo-l/01/otaruunga.jpg',
      },
    ];
    const elements = items.map((item, idx) => (
      <li key={idx} style={({backgroundImage: `url(${item.image})`})}>
        <h3>{item.title}</h3>
      </li>
    ));

    return (
      <section className={styles.recommends}>
        <button type="button" role="close">閉じる</button>
        <ul>{elements}</ul>
      </section>
    );
  }
}
