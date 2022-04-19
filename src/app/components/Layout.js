/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation, Outlet } from "react-router-dom";

import AppActions from "../actions/AppActions";

export default function Layout(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    dispatch(AppActions.navigate(location.pathname));
  }, [location]);

  return <div>
    <Outlet />
  </div>;
}