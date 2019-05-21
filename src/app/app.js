import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { store, persistor } from './store';

import Main from './main';

// Inject SCSS, @import other dependancies
import '../www/styles/index.scss';

// // Integrate SENTRY to catch and report errors
// import * as Sentry from '@sentry/browser';
// Sentry.init({
//   dsn: 'https://62f1d8f5dbe4475593b35e76de57be78@sentry.io/1464277'
// });

// Cutsom event on resize using requestAnimationFrame
// https://developer.mozilla.org/en-US/docs/Web/Events/resize
(function() {
  var throttle = function(type, name, obj) {
    obj = obj || window;
    var running = false;
    var func = function() {
      if (running) {
        return;
      }
      running = true;
      requestAnimationFrame(function() {
        obj.dispatchEvent(new CustomEvent(name));
        running = false;
      });
    };
    obj.addEventListener(type, func);
  };

  throttle('resize', 'optimizedResize');
})();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      // console.log('SW registered: ', registration);
    }).catch(registrationError => {
      // console.log('SW registration failed: ', registrationError);
    });
  });
}

render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <Main />
    </PersistGate>
  </Provider>,
  document.getElementById('app')
);