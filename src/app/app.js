import React from 'react';
import {render} from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Routes from './routes';

import '../www/main.scss';

import axios from 'axios';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

//if (localStorage.getItem('server') === null) {
// localStorage.setItem('server', 'http://localhost:8000');
localStorage.setItem('server', 'https://django723e.herokuapp.com');
// }
// define default baseURL
axios.defaults.baseURL = localStorage.getItem('server');
// axios.defaults.timeout = 5000;

// Render the main app react component into the app div.
// For more details see: https://facebook.github.io/react/docs/top-level-api.html#react.render
render(
  <Routes/>,
  document.getElementById('app')
);
