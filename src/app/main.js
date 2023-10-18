/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";


import { Workbox } from "workbox-window";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import routes from './routes';

import { ThemeProvider } from '@mui/material/styles';
import { useTheme } from "./theme";

import ErrorBoundary from "./components/errors/ErrorBoundary";
import BugReport from "./components/errors/BugReport";
import AppActions from "./actions/AppActions";

// register Swiper custom elements. should be done only once
// and it registers Swiper custom elements globally.
import { register } from 'swiper/element/bundle';
register();


let serviceWorkerRegistration;
let serviceWorkerIgnoreUpdate = false;


/**
 * Main component is our root component which handle most loading events
 * Only load once, and should in theory never unmount.
 */
export const Main = () => {
  // Load theme to inject in MuiThemeProvider
  const theme = useTheme();
  const dispatch = useDispatch();
  //
  // Handle listenner to notify serviceworker onupdatefound event with a snackbar
  //
  useEffect(() => {

    // Connect with workbox to display snackbar when update is available.
    if (process.env.NODE_ENV != "development" && "serviceWorker" in navigator) {
      const workbox = new Workbox("/service-worker.js");
      workbox.addEventListener("waiting", (event) => {
        workbox.addEventListener("controlling", (event) => {
          AppActions.reload();
        });

        dispatch(
          AppActions.cacheDidUpdate(() => {
            workbox.messageSW({ type: "SKIP_WAITING" });
          })
        );
      });
      workbox
        .register()
        .then((registration) => {
          if (registration.installing) {
            serviceWorkerIgnoreUpdate = true;
          }
          serviceWorkerRegistration = registration;
          serviceWorkerRegistration.onupdatefound = (event) => {
            if (!serviceWorkerIgnoreUpdate) {
              serviceWorkerRegistration
                .unregister()
                .then((_) => {
                  dispatch(
                    AppActions.cacheDidUpdate(() => {
                      AppActions.reload();
                    })
                  );
                })
                .catch((registrationError) => {
                  console.log("SW registration failed: ", registrationError);
                });
            } else {
              serviceWorkerIgnoreUpdate = false;
            }
          };
          window.onerror = function () {
            console.error("Unregister serviceworker");
            serviceWorkerRegistration.unregister();
          };
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    }
  }, []);


  // Hide splashscreen with a CSS animation
  setTimeout(() => {
    document.getElementById("splashscreen").classList.add("hide");
  }, 400);
  //
  // PUT AS LITTLE LOGIC IN THIS VIEW, changes will trigger repaint and unsync RouterProvider
  //
  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary fallback={<BugReport />}>
        <RouterProvider router={createBrowserRouter(routes)} />
      </ErrorBoundary>
    </ThemeProvider>
  );
};