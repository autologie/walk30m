import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, IndexRedirect, browserHistory } from 'react-router';
import App from './components/app/index.jsx';
import Map from './components/map';
import Tools from './components/tools';
import Indicator from './components/indicator';
import ReleaseNote from './components/release-note';
import About from './components/about';
import MessageForm from './components/message-form';

document.addEventListener('DOMContentLoaded', () => {
  render((
    <Router history={browserHistory}>
      <Route path="/" component={App}>
        <IndexRedirect to="/home" />
        <Route path="/about" component={About} />
        <Route path="/release-note" component={ReleaseNote} />
        <Route path="/message-form" component={MessageForm} />
        <Route path="/home" component={Map}>
          <Route path="/home/calculations/new" component={Indicator} />
          <Route path="/home/calculations/:id" component={Indicator} />
          <IndexRoute component={Tools} />
        </Route>
      </Route>
    </Router>
  ), document.getElementById('app-root'));
});
