/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BrowserRouter, useNavigate, useLocation, Route, Navigate, Routes, Outlet, useSearchParams, useMatches } from "react-router-dom";

import { useTheme } from "../theme";

import { Workbox } from "workbox-window";

import { SERVER_LOAD, SERVER_LOADED } from '../constants';

import { createBrowserHistory } from "history";
const history = createBrowserHistory();
import axios from "axios";
import moment from "moment";

import encryption from "../encryption";

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

import IconButton from '@mui/material/IconButton';
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";

import AppActions from "../actions/AppActions";
import ServerActions from "../actions/ServerActions";
import TransactionActions from "../actions/TransactionActions";
import useRouteTitle from "../hooks/useRouteTitle";

// Component for router
import Navigation from "./Navigation";

import SyncButton from "./accounts/SyncButton";
import AccountSelector from "./accounts/AccountSelector";
import CurrencySelector from "./currency/CurrencySelector";
import UserButton from "./settings/UserButton";
import SnackbarsManager from "./snackbars/SnackbarsManager";

import "./Layout.scss";

let serviceWorkerRegistration;

export default function Layout(props) {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const path = useSelector((state) => state.app.url);

  const titleObject = useRouteTitle();
  const theme = useTheme();
  const navbar = useSelector((state) => state.state.navbar);

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

  const modal = useSelector((state) => state.state.modal);
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
    if (modal) {
      toggleModal(modal);
    } else {
      toggleModal();
    }
  }, [modal]);

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
    if (titleObject.title) {
      dispatch(AppActions.setNavBar(titleObject.title, titleObject.back));
    }
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

  //
  const transactions = useSelector((state) => state.transactions);

  useEffect(() => {
    // TODO: Remove ? Looks like a bad fix.
    // REFRESH transaction if needed
    if (transactions === null && account) {
      dispatch({
        type: SERVER_LOAD,
      });
      dispatch(TransactionActions.refresh()).then(() => {
        dispatch({
          type: SERVER_LOADED,
        });
      });
    }
  }, [])

  //
  // Handle cipher   update for security
  //
  const cipher = useSelector((state) => (state.user ? state.user.cipher : ""));
  useEffect(() => {
    if (cipher) {
      encryption.key(cipher);
    }
  }, [cipher]);

  // An other weird piece of code

  //
  // Handle Axios configuration and listenners
  //
  const baseURL = useSelector((state) => (state.server ? state.server.url : ""));

  axios.defaults.baseURL = baseURL;
  axios.defaults.timeout = 50000; // Default timeout for every request
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error && error.response && error.response.status === 503) {
        dispatch(ServerActions.maintenance());
      }
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    // On every url update from redux, we update axios default baseURL
    axios.defaults.baseURL = baseURL;
  }, [baseURL]);

  //
  // Deal with VISIBILITY events to show WElcome back and update if needed
  //

  const lastSync = useSelector((state) => state.server.last_sync);
  const lastSeen = useSelector((state) => state.app.last_seen);
  const autoSync = useSelector((state) =>
    Boolean(
      state &&
        state.account &&
        state.account.preferences &&
        state.account.preferences.autoSync
    )
  );

  useEffect(() => {

    moment.updateLocale("en", { week: {
      dow: 1, // First day of week is Monday
    }});

    // Using Page visibility API
    // https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
    var hidden, visibilityChange;
    if (typeof document.hidden !== "undefined") {
      // Opera 12.10 and Firefox 18 and later support
      hidden = "hidden";
      visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
      hidden = "msHidden";
      visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
      hidden = "webkitHidden";
      visibilityChange = "webkitvisibilitychange";
    }

    function handleVisibilityChange() {
      if (!document[hidden]) {
        const minutes = moment().diff(moment(lastSync), "minutes");
        if (autoSync && lastSync && minutes >= 60) {
          dispatch(ServerActions.sync());
        }
        const minutes_last_seen = moment().diff(moment(lastSeen), "minutes");
        if (minutes_last_seen > 60 * 24 * 2) {
          dispatch(AppActions.snackbar("Welcome back 👋"));
          dispatch(AppActions.lastSeen());
        } else if (minutes_last_seen >= 1) {
          dispatch(AppActions.lastSeen());
        }

      }
    }
    document.addEventListener(visibilityChange, handleVisibilityChange, false);
    handleVisibilityChange();

    return () => {
      document.removeEventListener(visibilityChange, handleVisibilityChange);
    };
  }, [lastSync, lastSeen]);


  //
  // Handle redirect and URL Listenner
  //

  let serviceWorkerIgnoreUpdate = false;

  useEffect(() => {

    //
    // Handle listenner to notify serviceworker onupdatefound event with a snackbar
    //

    // Connect with workbox to display snackbar when update is available.
    if (process.env.NODE_ENV != "development" && "serviceWorker" in navigator) {
      const workbox = new Workbox("/service-worker.js");
      workbox.addEventListener("waiting", (event) => {
        workbox.addEventListener("controlling", (event) => {
          AppActions.reload();
        });

        dispatch(
          AppActions.cacheDidUpdate(() => {
            workbox.messageSW({ type: "SKIP_WAITING" });
          })
        );
      });
      workbox
        .register()
        .then((registration) => {
          if (registration.installing) {
            serviceWorkerIgnoreUpdate = true;
          }
          serviceWorkerRegistration = registration;
          serviceWorkerRegistration.onupdatefound = (event) => {
            if (!serviceWorkerIgnoreUpdate) {
              serviceWorkerRegistration
                .unregister()
                .then((_) => {
                  dispatch(
                    AppActions.cacheDidUpdate(() => {
                      AppActions.reload();
                    })
                  );
                })
                .catch((registrationError) => {
                  console.log("SW registration failed: ", registrationError);
                });
            } else {
              serviceWorkerIgnoreUpdate = false;
            }
          };
          window.onerror = function () {
            console.error("Unregister serviceworker");
            serviceWorkerRegistration.unregister();
          };
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    }
  }, []);

  const [title1, setTitle1] = useState(navbar.title);
  const [title2, setTitle2] = useState();
  const [back1, setBack1] = useState();
  const [back2, setBack2] = useState();
  const [next1, setNext1] = useState();
  const [next2, setNext2] = useState();
  const [displayTitle1, setDisplayTitle1] = useState(true);

  useEffect(() => {
    // If ROUTE object has no title, we skip updating navbar.
    // This is to allow user to override this message easily with dynamic value.
    if (navbar && navbar.title) {
      if ((displayTitle1 && navbar.title != title1) || (!displayTitle1 && navbar.title != title2)) {
        if (displayTitle1) {
          setTitle2(navbar.title);
          setBack2(navbar.back);
          setNext2(navbar.next);
        } else {
          setTitle1(navbar.title);
          setBack1(navbar.back);
          setNext1(navbar.next);
        }
        setDisplayTitle1(!displayTitle1);
      }
    }
  }, [navbar])

  return (
    <div id="appContainer">
      <div id="safeAreaInsetTop"></div>

      <div id="container_header" className="showMobile" style={{ boxShadow: theme.shadows[3] }}>
        <div className="wrapper">
          <div className="actions"></div>
          <div className={'title' + (displayTitle1 ? ' showTitle1' : ' showTitle2')}>
            <div className={(!!back1 || !!next1 ? ' hasBackButton' : ' ')}>
              { !!back1 && <IconButton
                onClick={() => {
                  navigate(back1);
                }}
                size="large">
                <KeyboardArrowLeft style={{ color: "white" }} />
              </IconButton> }
              { !!next1 && <IconButton
                onClick={() => {
                  navigate(next1);
                }}
                size="large">
                <KeyboardArrowRight style={{ color: "white" }} />
              </IconButton> }
              <span>{ title1 }</span>
            </div>
            <div className={(!!back2 || !!next2 ? ' hasBackButton' : ' ')}>
              { !!back2 && <IconButton
                onClick={() => {
                  navigate(back2);
                }}
                size="large">
                <KeyboardArrowLeft style={{ color: "white" }} />
              </IconButton> }
              { !!next2 && <IconButton
                onClick={() => {
                  navigate(next2);
                }}
                size="large">
                <KeyboardArrowRight style={{ color: "white" }} />
              </IconButton> }
              <span>{ title2 }</span>
            </div>
          </div>
          { hasAccount && <div className="menu"><UserButton color="white" /></div>}
        </div>
      </div>

      <div id="container">
        { hasAccount && <>
          <aside className="navigation">
            <Navigation />
          </aside>
        </>}

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
                />
            </>)}
            <Divider orientation="vertical" className="showDesktop"/>
            <UserButton />
          </Stack>}

          <main style={{ position: "relative", flexGrow: 1 }}>

            <div className={"modalContent " + (isModalOpen ? "open" : "")}>
              <Card square className="modalContentCard">
                { modalComponent }
              </Card>
            </div>

            <div className="layout_wrapper">
              <Outlet />
            </div>

            <SnackbarsManager />
          </main>
        </div>
      </div>
    </div>
  );
}