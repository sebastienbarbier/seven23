/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React from "react";

import ScrollListenner from './ScrollListenner';

import "./LayoutFullWidth.scss";

export default function LayoutFullWidth(props) {
  return (
    <ScrollListenner className={`${props.className} layoutFullWidth`}>
      { props.children }
    </ScrollListenner>
  );
}