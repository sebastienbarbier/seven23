/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React from "react";
import { Link, useNavigate, useLocation, useOutlet } from "react-router-dom";

import ScrollListenner from './ScrollListenner';

import "./LayoutSideListPanel.scss";

export default function LayoutSideListPanel(props) {

  const outlet = useOutlet();

  return (
    <div className={`${props.className || ''} layoutSideListPanel layout`}>
      <div className="layout_two_columns">
        <ScrollListenner className={`${outlet ? 'hideMobile' : ''} sidePanel`}>
          { props.sidePanel }
        </ScrollListenner>

        { outlet && <ScrollListenner className="outlet">
          { outlet }
        </ScrollListenner> }

        { props.children }
      </div>
    </div>
  );
}