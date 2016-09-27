import React, { Component } from 'react';
import { releases } from 'json!yaml!../../../resources/releases.yml';
import styles from './index.css';
import commonStyles from '../common.css';

export default () => {
  const releaseNotes = releases
    .map(r => Object.assign({}, r, {date: new Date(r.date)}))
    .map(({date, summary}) => (
      <dl key={+date}>
        <dt>{date.getFullYear()}.{date.getMonth() + 1}.{date.getDate()}</dt>
        <dd dangerouslySetInnerHTML={{__html: summary}}></dd>
      </dl>
    ));

  return (
    <section className={`${commonStyles.staticContent} ${styles.releaseNote}`}>
      <h2>リリース履歴</h2>
      {releaseNotes}
    </section>
  );
}
