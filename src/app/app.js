import React from "react";
import { createRoot } from 'react-dom/client';
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import * as Sentry from "@sentry/browser";

import { StyledEngineProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'

import { store, persistor } from "./store";
import { Main } from "./main";

// Inject SCSS, @import other dependancies
import "../www/styles/index.scss";

import package_json from "../../package.json";
const VERSION = package_json.version;

// Integrate SENTRY to catch and report errors
if (process.env.SENTRY_DSN && process.env.BUILD_DATE != undefined) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    release: `seven23@${VERSION}-build.${process.env.GIT_COMMIT}`
  });
}

if (process.env.NODE_ENV == "development") {
  document.title = "Seven23 - localhost";
} else if (process.env.IS_DEVELOP) {
  document.title = "Seven23 - next";
}

if (process.env.BUILD_DATE != undefined) {
  console.log(`seven23@${VERSION}-build.${process.env.GIT_COMMIT}`);
  console.log(`Build date: ${process.env.BUILD_DATE}`);
} else {
  console.log(`seven23@${VERSION}-dev`);
}

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

  throttle("resize", "optimizedResize");
})();

const container = document.getElementById('app');
const root = createRoot(container);

// Set background for html and body to black so when iPhone
// rotate we don't see primary color. Looks better.
setTimeout(() => {
  document.documentElement.style.setProperty('--html-background-color', 'black');

  // If for some reason app crash, we change background to white.
  window.onerror = function(err){
    document.documentElement.style.setProperty('--html-background-color', 'white');
  };
}, 1000);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <StyledEngineProvider injectFirst>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <Main />
          </LocalizationProvider>
        </StyledEngineProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

// expose store when run in Cypress
if (window.Cypress) {
  window.appStore = store;
}