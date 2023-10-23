/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import Card from '@mui/material/Card';

import "./LayoutFullWidth.scss";

export default function LayoutFullWidth(props) {
  return (
    <div className={`${props.className} layoutFullWidth`}>
      { props.children }
    </div>
  );
}