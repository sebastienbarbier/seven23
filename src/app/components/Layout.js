/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BrowserRouter, useNavigate, useLocation, Route, Navigate, Routes, Outlet, useSearchParams, useMatches } from "react-router-dom";

import { createBrowserHistory } from "history";
const history = createBrowserHistory();

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

import AppActions from "../actions/AppActions";
import useRouteTitle from "../hooks/useRouteTitle";

// Component for router
import Navigation from "./Navigation";

import SyncButton from "./accounts/SyncButton";
import AccountSelector from "./accounts/AccountSelector";
import CurrencySelector from "./currency/CurrencySelector";
import UserButton from "./settings/UserButton";
import SnackbarsManager from "./snackbars/SnackbarsManager";

import "./Layout.scss";

export default function Layout(props) {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const path = useSelector((state) => state.app.url);

  const title = useRouteTitle();

  // hasAccount is used to define some basic behaviour if user need to create an account
  // Current selected account to show/hide some elements if account.isLocal
  const account = useSelector((state) => state.account);
  const hasAccount = useSelector(
    (state) => (state.accounts.remote.length + state.accounts.local.length) >= 1
  );
  const hasMoreThanOneAccount = useSelector(
    (state) => (state.accounts.remote.length + state.accounts.local.length) > 1
  );
  // Disable some UI element if app is syncing
  const isSyncing = useSelector(
    (state) => state.state.isSyncing || state.state.isLoading
  );


  //
  // Modal logic
  //
  const [modalComponent, setModalComponent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = (component) => {
    if (component) {
      setModalComponent(component);
      setIsModalOpen(true);
    } else {
      setTimeout(() => {
        setModalComponent(null);
      }, 200);
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
     toggleModal();
    }
  }, [location]);

  //
  // Update Redux URL to adjust history and category color
  //
  useEffect(() => {
    dispatch(AppActions.navigate(location.pathname));
  }, [location]);

  // Redirect
  const nbAccount = useSelector(
    (state) => state.accounts.remote.length + state.accounts.local.length
  );

  // Set server on start
  const [queryParameters] = useSearchParams()

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

    if (queryParameters.get('server')) {
      if (!server.isLogged) {
        dispatch(ServerActions.connect(queryParameters.get('server')));
      }
    }

    // Listen to history events to catch all navigation including browser navigation buttons
    const removeListener = history.listen((location) => {
      dispatch(AppActions.navigate(location.pathname));
    });

    return () => {
      removeListener();
    };

  }, []);

  return (
    <div id="appContainer">
      <div id="safeAreaInsetTop"></div>
      <div id="container">
        { hasAccount && <aside className="navigation">
          <Navigation />
        </aside>}

        <div id="content">
          { hasAccount && <Stack id="toolbar" className="hideMobile" direction="row" spacing={0.5}>
            {hasAccount && (<>
              {!account.isLocal && (<>
                <SyncButton className="showDesktop" />
                <Divider className="showDesktop"></Divider>
              </>)}
                { hasMoreThanOneAccount && (<AccountSelector
                  disabled={isSyncing}
                  className="showDesktop"
                />) }
                <CurrencySelector
                  disabled={isSyncing}
                  display="code"
                  className="showDesktop"
                  onModal={toggleModal}
                />
            </>)}
            <Divider orientation="vertical" className="showDesktop"/>
            <UserButton onModal={toggleModal} />
          </Stack>}
          <main style={{ position: "relative", flexGrow: 1 }}>

            { hasAccount && <div className={"modalContent " + (isModalOpen ? "open" : "")}>
              <Card square className="modalContentCard">
                { modalComponent }
              </Card>
            </div>}

            <Outlet />

            <SnackbarsManager />
          </main>
        </div>
      </div>
    </div>
  );
}