import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import store from './store';

import injectTapEventPlugin from 'react-tap-event-plugin';
import Main from './main';

// Inject SCSS. Main @import other dependancies
import '../www/styles/main.scss';

// Needed for onClick
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

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

  /* init - you can init any event */
  throttle('resize', 'optimizedResize');
})();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}

render(
  <Provider store={store}>
    <Main />
  </Provider>,
  document.getElementById('app')
);
