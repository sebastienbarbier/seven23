/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React from "react";
import { Link, useNavigate, useLocation, useOutlet } from "react-router-dom";

import Box from "@mui/material/Box";

import ScrollListenner from './ScrollListenner';

import "./LayoutSideListPanel.scss";

export default function LayoutSideListPanel(props) {

  // props.transparentRightPanel will hide the outlet background effect.

  const outlet = useOutlet();

  return (
    <div className={`${props.className || ''} layoutSideListPanel layout`}>
      <div className="layout_two_columns">
        <Box className={`${outlet ? 'hideMobile' : ''} sidePanel`}>

          { props.children }

          <ScrollListenner disableAutoScrollTop className="scrollListenner">
            { props.sidePanel }
          </ScrollListenner>
        </Box>

        { outlet && <>
          <Box className={`outlet ${props.transparentRightPanel && 'transparentRightPanel'}`}>
            <ScrollListenner className="scrollListenner">
              { outlet }
            </ScrollListenner>
          </Box>
        </>}
      </div>
    </div>
  );
}