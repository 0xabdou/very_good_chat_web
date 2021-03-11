import ReactDOM from 'react-dom';
import './index.css';
import App from './app';
import React from 'react';

process.env = import.meta.env as NodeJS.ProcessEnv;

ReactDOM.render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>,
  document.getElementById('root')
);
