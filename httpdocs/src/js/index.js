import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, IndexRedirect, browserHistory } from 'react-router';
import App from './components/app/index.jsx';
import Map from './components/map';
import Tools from './components/tools';
import CalculationDetail from './components/calculations/detail';
import ReleaseNote from './components/release-note';
import About from './components/about';
import CalculationList from './components/calculation-list';
import MessageForm from './components/message-form';
import { STORAGE_KEY } from './constants';

document.addEventListener('DOMContentLoaded', () => {

  window.onerror = (message, source, lineno, colno, error) => {
    console.log(message, source, lineno, colno, error);

    if (window.confirm([
        'エラーが発生しました。',
        'ブラウザに保存したwalk30mのデータを消去すると改善することがあります。',
        'データをクリアしてページを開き直しますか？',
      ].join(''))) {
      window.localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  render((
    <Router history={browserHistory}>
      <Route path="/" location="hash" component={App}>
        <IndexRedirect to="/home" />
        <Route path="/calculation-list" component={CalculationList} />
        <Route path="/about" component={About} />
        <Route path="/release-note" component={ReleaseNote} />
        <Route path="/message-form" component={MessageForm} />
        <Route path="/home" component={Map}>
          <Route path="/home/calculations/:id" component={CalculationDetail} />
          <IndexRoute component={Tools} />
        </Route>
      </Route>
    </Router>
  ), document.getElementById('app-root'));
});
