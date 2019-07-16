/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useState } from "react";
import { useDispatch } from "react-redux";

import Dashboard from "./Dashboard";

import AppActions from "../actions/AppActions";

export default function ResetPassword(props) {
  const dispatch = useDispatch();

  dispatch(AppActions.popup("resetPassword"));

  return <Dashboard loadingOnly />;
}
