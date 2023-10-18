import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { createTheme } from '@mui/material/styles';

import { darktheme } from "./themes/dark";
import { lighttheme } from "./themes/light";

import { colorLuminance } from './utils/colorLuminance';

const useTheme = () => {
  const theme = useSelector((state) =>
    state.user ? state.app.theme || "light" : "light"
  );
  const url = useSelector((state) =>
    state.app && state.app.url ? state.app.url : "/"
  );

  const [muiTheme, setMuiTheme] = useState(() => lighttheme);
  // Update colors based on theme or url
  useEffect(() => {
    const themeObject = createTheme(
      theme === "dark" ? darktheme : lighttheme
    );

    // Default colors are the dashboard one
    let palette = themeObject.palette.dashboard;

    // Override each colors based on url
    if (url.startsWith("/dashboard")) {
      // Do nothing because default color is dashboard
    } else if (url.startsWith("/transactions")) {
      palette = themeObject.palette.transactions;
    } else if (url.startsWith("/categories")) {
      palette = themeObject.palette.categories;
    } else if (url.startsWith("/changes")) {
      palette = themeObject.palette.changes;
    } else if (url.startsWith("/report")) {
      palette = themeObject.palette.report;
    } else if (url.startsWith("/settings")) {
      palette = themeObject.palette.settings;
    } else if (url.startsWith("/search")) {
      palette = themeObject.palette.search;
    } else if (url.startsWith("/convertor")) {
      palette = themeObject.palette.convertor;
    } else if (url.startsWith("/nomadlist")) {
      palette = themeObject.palette.nomadlist;
    } else {
      palette = themeObject.palette.default;
    }

    themeObject.palette.primary = palette.primary;
    themeObject.palette.primary.main = palette.main;

    setMuiTheme(themeObject);

    // Update safari header styling with primary main color
    const darkMainColor = colorLuminance(themeObject.palette.primary.main, -0.2);

    // Update meta theme-color for safar
    document.getElementsByName('theme-color').forEach(tag => tag.content = `${darkMainColor}`);

    // Edit CSS variables to allow in CSS use
    const properties = {
      "--primary-color": themeObject.palette.primary.main,
      "--primary-color-background": darkMainColor,
      "--loading-color": themeObject.palette.divider,
      "--background-color": themeObject.palette.background.default,
      "--background-transparent": themeObject.palette.transparent.default,
      "--divider-color": themeObject.palette.divider,
      "--text-color": themeObject.palette.text.primary,
      "--paper-color": themeObject.palette.background.paper,
      "--paper-transparent": themeObject.palette.transparent.paper,
      "--cardheader-color": themeObject.palette.cardheader,
      "--number-green-color": themeObject.palette.numbers.green,
      "--number-red-color": themeObject.palette.numbers.red,
      "--number-blue-color": themeObject.palette.numbers.blue,
    };

    Object.keys(properties).forEach((key) => 
      document.documentElement.style.setProperty(key, properties[key]));

  }, [theme, url]);

  return useMemo(() => createTheme(muiTheme), [muiTheme]);
};

export { useTheme };