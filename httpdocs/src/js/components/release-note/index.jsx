import React, { Component } from 'react';
import { releases } from 'json!yaml!../../../releases.yml';

export default (props) => {
  const releaseNotes = releases.map(release => {
    const date = new Date(release.date);

    return (
      <dl key={+date}>
        <dt>{date.getFullYear()}.{date.getMonth() + 1}.{date.getDate()}</dt>
        <dd dangerouslySetInnerHTML={{__html: release.summary}}></dd>
      </dl>
    );
  });

  return (
    <div>
      <h3>リリース履歴</h3>
      {releaseNotes}
    </div>
  );
}
