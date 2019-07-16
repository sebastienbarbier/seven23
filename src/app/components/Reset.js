/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "../router";

import AppActions from "../actions/AppActions";

export default function Reset(props) {
  const dispatch = useDispatch();
  const { history } = useRouter();

  dispatch(AppActions.reset());
  history.push("/dashboard");

  return <div />;
}
