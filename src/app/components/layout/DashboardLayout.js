/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React from "react";

import Box from "@mui/material/Box";
import ScrollListenner from './ScrollListenner';

import "./DashboardLayout.scss";

export default function DashboardLayout(props) {
  return (
    <Box className={`${props.className || ''} dashboardLayout`}>
      <ScrollListenner className="dashboardScroll">
        { props.children }
      </ScrollListenner>
    </Box>
  );
}