import ReactDOM from 'react-dom';
import './index.css';
import App from './app';
import React from 'react';
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

Object.assign(viteEnv, import.meta.env);
TimeAgo.addDefaultLocale(en);

ReactDOM.render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>,
  document.getElementById('root')
);
