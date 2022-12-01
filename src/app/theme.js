import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { createTheme } from "@mui/material/styles";

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
    themeObject.palette.primary = themeObject.palette.dashboard.primary;
    themeObject.palette.primary.main = themeObject.palette.dashboard.main;
    // Override each colors based on url
    if (url.startsWith("/dashboard")) {
      // Do nothing because default color is dashboard
    } else if (url.startsWith("/transactions")) {
      themeObject.palette.primary = themeObject.palette.transactions.primary;
      themeObject.palette.primary.main = themeObject.palette.transactions.main;
    } else if (url.startsWith("/categories")) {
      themeObject.palette.primary = themeObject.palette.categories.primary;
      themeObject.palette.primary.main = themeObject.palette.categories.main;
    } else if (url.startsWith("/changes")) {
      themeObject.palette.primary = themeObject.palette.changes.primary;
      themeObject.palette.primary.main = themeObject.palette.changes.main;
    } else if (url.startsWith("/report")) {
      themeObject.palette.primary = themeObject.palette.report.primary;
      themeObject.palette.primary.main = themeObject.palette.report.main;
    } else if (url.startsWith("/settings")) {
      themeObject.palette.primary = themeObject.palette.settings.primary;
      themeObject.palette.primary.main = themeObject.palette.settings.main;
    } else if (url.startsWith("/search")) {
      themeObject.palette.primary = themeObject.palette.search.primary;
      themeObject.palette.primary.main = themeObject.palette.search.main;
    } else if (url.startsWith("/convertor")) {
      themeObject.palette.primary = themeObject.palette.convertor.primary;
      themeObject.palette.primary.main = themeObject.palette.convertor.main;
    } else if (url.startsWith("/nomadlist")) {
      themeObject.palette.primary = themeObject.palette.nomadlist.primary;
      themeObject.palette.primary.main = themeObject.palette.nomadlist.main;
    } else {
      themeObject.palette.primary = themeObject.palette.default.primary;
      themeObject.palette.primary.main = themeObject.palette.default.main;
    }


    const darkMainColor = colorLuminance(themeObject.palette.primary.main, -0.2);
    // Update safari header styling with primary main color
    document.getElementsByName('theme-color').forEach(tag => tag.content = `${darkMainColor}`);

    setMuiTheme(themeObject);

    // Edit CSS variables
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