/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import AppActions from "../actions/AppActions";

export default function Reset(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for (let registration of registrations) {
        registration.unregister();
      }
    });
  }

  dispatch(AppActions.reset());
  navigate("/dashboard");

  return <div />;
}