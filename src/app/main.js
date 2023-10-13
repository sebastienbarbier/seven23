/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React from "react";

import { RouterProvider, createBrowserRouter } from "react-router-dom";
import routes from './routes';

import { ThemeProvider } from '@mui/material/styles';
import { useTheme } from "./theme";

import ErrorBoundary from "./components/errors/ErrorBoundary";
import BugReport from "./components/errors/BugReport";

// register Swiper custom elements. should be done only once
// and it registers Swiper custom elements globally.
import { register } from 'swiper/element/bundle';
register();

/**
 * Main component is our root component which handle most loading events
 * Only load once, and should in theory never unmount.
 */
export const Main = () => {
  // Load theme to inject in MuiThemeProvider
  const theme = useTheme();

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