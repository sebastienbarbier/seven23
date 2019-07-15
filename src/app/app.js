import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { store, persistor } from "./store";

import { Main } from "./main";

// Inject SCSS, @import other dependancies
import "../www/styles/index.scss";
import * as Sentry from "@sentry/browser";

// Integrate SENTRY to catch and report errors
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    release: "seven23@1.0.0-build." + process.env.TRAVIS_COMMIT
  });
}

if (process.env.NODE_ENV == "development") {
  document.title = "Seven23 - localhost";
}

if (process.env.BUILD_DATE != undefined) {
  console.log("seven23@1.0.0-build." + process.env.TRAVIS_COMMIT);
  console.log("Build date:", process.env.BUILD_DATE);
}

// Hide splashscreen with a CSS animation
document.getElementById("splashscreen").classList.add("hide");

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

render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <Main />
    </PersistGate>
  </Provider>,
  document.getElementById("app")
);
