import ReactDOM from 'react-dom';
import './index.css';
import App from './app';
import React from 'react';


Object.assign(viteEnv, import.meta.env);

ReactDOM.render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>,
  document.getElementById('root')
);
