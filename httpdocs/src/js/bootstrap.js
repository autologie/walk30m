/* eslint-disable import/no-extraneous-dependencies,import/no-unresolved */
import './ga';
import './fb';
import window from 'window';
import $ from 'jquery';
import React from 'react';
import { render } from 'react-dom';
import Application from './Application';
import ReleaseNote from './components/release-note/index.jsx';

$(() => {
  new Application($(window.document));
  render(React.createElement(ReleaseNote), document.getElementById('release-note'));
});

