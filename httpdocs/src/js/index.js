import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import App from './components/app/index.jsx';
import Map from './components/map';
import ReleaseNote from './components/release-note';
import About from './components/about';
import MessageForm from './components/message-form';

document.addEventListener('DOMContentLoaded', () => {
  render((
    <Router history={browserHistory}>
      <Route path="/" component={App}>
        <Route path="/about" component={About} />
        <Route path="/release-note" component={ReleaseNote} />
        <Route path="/message-form" component={MessageForm} />
        <IndexRoute component={Map} />
      </Route>
    </Router>
  ), document.getElementById('app-root'));
});
