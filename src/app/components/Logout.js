/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from "react";
import { useDispatch } from "react-redux";

import { useRouter } from "../router";
import UserActions from "../actions/UserActions";

export default function Logout(props) {
  const dispatch = useDispatch();
  const { history } = useRouter();

  dispatch(UserActions.logout());
  history.push("/");

  return <div />;
}
