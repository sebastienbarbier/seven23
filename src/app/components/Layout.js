/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation, Outlet } from "react-router-dom";

import AppActions from "../actions/AppActions";

export default function Layout(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const path = useSelector((state) => state.app.url);

  const nbAccount = useSelector(
    (state) => state.accounts.remote.length + state.accounts.local.length
  );

  useEffect(() => {
    dispatch(AppActions.navigate(location.pathname));
  }, [location]);

  useEffect(() => {
    // Redirect on load based on redux stored path, except creation phase 
    if (
      nbAccount >= 1 &&
      !window.location.pathname.startsWith("/resetpassword") &&
      !window.location.pathname.startsWith("/settings/subscription") &&
      !window.location.pathname.startsWith("/reset") &&
      !window.location.pathname.startsWith("/logout")
    ) {
      navigate(path);
    }

  }, []);

  return <div>
    <Outlet />
  </div>;
}