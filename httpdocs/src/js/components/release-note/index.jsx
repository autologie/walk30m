import React, { Component } from 'react';
import { releases } from 'json!yaml!../../../releases.yml';

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
    <div>
      <h3>リリース履歴</h3>
      {releaseNotes}
    </div>
  );
}
