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

import AppActions from "./actions/AppActions";

// register Swiper custom elements. should be done only once
// and it registers Swiper custom elements globally.
import { register } from 'swiper/element/bundle';
register();

/**
 * Main component is our root component which handle most loading events
 * Only load once, and should in theory never unmount.
 *
 * PUT AS LITTLE LOGIC IN THIS VIEW,
 * changes will trigger repaint and unsync RouterProvider
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

      workbox.addEventListener("installed", (event) => {
        // isUpdate means a new SW has been created from a newest version
        if (event.isUpdate === true) {
          dispatch(
            AppActions.cacheDidUpdate(() => {
              AppActions.reload();
            })
          );
        }
      });

      workbox.register();
    }
  }, []);

  // Hide splashscreen with a CSS animation
  setTimeout(() => {
    document.getElementById("splashscreen").classList.add("hide");
  }, 100);

  return (
    <ThemeProvider theme={theme}>
      <RouterProvider router={createBrowserRouter(routes)} />
    </ThemeProvider>
  );
};