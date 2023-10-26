/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import LinearProgress from "@mui/material/LinearProgress";

import Typography from "@mui/material/Typography";

import "./ModalLayoutComponent.scss";

export default function ModalLayoutComponent(props) {

  const hasAccount = useSelector(
    (state) => (state.accounts.remote.length + state.accounts.local.length) >= 1
  );

  return (
    <div className="modalLayoutComponent">
      <header className={!hasAccount ? `showTablet` : ''}>
        <h2>{ props.title }</h2>
      </header>
      { props.isLoading && <LinearProgress /> }
      <div className="content">
        { props.content }
      </div>
      <footer>
        { props.footer }
      </footer>
    </div>
  );
}