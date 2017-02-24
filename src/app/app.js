import React from 'react';
import { render } from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Routes from './routes';

// Inject SCSS. Main @import other dependancies
import '../www/main.scss';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

render(
  <Routes/>,
  document.getElementById('app')
);
