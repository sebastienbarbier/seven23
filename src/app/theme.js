import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { createMuiTheme } from "@material-ui/core/styles";

import { darktheme } from "./themes/dark";
import { lighttheme } from "./themes/light"; // eslint-disable-line no-unused-vars

const useTheme = () => {
  const theme = useSelector(state =>
    state.user ? state.user.theme || "light" : "light"
  );
  const url = useSelector(state => (state.app ? state.app.url : "/"));

  const [muiTheme, setMuiTheme] = useState(lighttheme);
  // Update colors based on theme or url
  useEffect(() => {
    const themeObject = createMuiTheme(
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
    } else if (url.startsWith("/analytics")) {
      themeObject.palette.primary = themeObject.palette.report.primary;
      themeObject.palette.primary.main = themeObject.palette.report.main;
    } else if (url.startsWith("/settings")) {
      themeObject.palette.primary = themeObject.palette.settings.primary;
      themeObject.palette.primary.main = themeObject.palette.settings.main;
    } else {
      themeObject.palette.primary = themeObject.palette.default.primary;
      themeObject.palette.primary.main = themeObject.palette.default.main;
    }

    setMuiTheme(themeObject);

    // Edit CSS variables
    const css = document.documentElement.style;
    css.setProperty("--primary-color", themeObject.palette.primary.main);
    css.setProperty("--loading-color", themeObject.palette.divider);
    css.setProperty(
      "--background-color",
      themeObject.palette.background.default
    );
    css.setProperty("--divider-color", themeObject.palette.divider);
    css.setProperty("--text-color", themeObject.palette.text.primary);
    css.setProperty("--paper-color", themeObject.palette.background.paper);
    css.setProperty("--cardheader-color", themeObject.palette.cardheader);

    css.setProperty("--number-green-color", themeObject.palette.numbers.green);
    css.setProperty("--number-red-color", themeObject.palette.numbers.red);
    css.setProperty("--number-blue-color", themeObject.palette.numbers.blue);
  }, [theme, url]);

  return createMuiTheme(muiTheme);
};

export { useTheme };
