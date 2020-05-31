/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Route, Redirect, Switch } from "react-router-dom";
import { HookedBrowserRouter } from "./router";
import moment from "moment";

import axios from "axios";
import encryption from "./encryption";

import { MuiThemeProvider } from "@material-ui/core/styles"; // v1.x
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";

import SyncButton from "./components/accounts/SyncButton";
import AccountSelector from "./components/accounts/AccountSelector";
import CurrencySelector from "./components/currency/CurrencySelector";
import UserButton from "./components/settings/UserButton";
import SnackbarsManager from "./components/snackbars/SnackbarsManager";

// Component for router
import Navigation from "./components/Navigation";
import Dashboard from "./components/Dashboard";
import Transactions from "./components/Transactions";
import Report from "./components/Report";
import Changes from "./components/Changes";
import Categories from "./components/Categories";
import Settings from "./components/Settings";
import Logout from "./components/Logout";
import Reset from "./components/Reset";
import Welcoming from "./components/Welcoming";
import ResetPassword from "./components/ResetPassword";
import Search from "./components/Search";
import Convertor from "./components/Convertor";
import Nomadlist from "./components/Nomadlist";

import ResetPasswordForm from "./components/login/ResetPasswordForm";

import AppActions from "./actions/AppActions";
import ServerActions from "./actions/ServerActions";

import { useTheme } from "./theme";
import { createBrowserHistory } from "history";

import { Workbox } from "workbox-window";

const history = createBrowserHistory();

import "./main.scss";
let serviceWorkerRegistration;

/**
 * Main component is our root component which handle most loading events
 * Only load once, and should in theory never unmount.
 */
export const Main = () => {
  const dispatch = useDispatch();

  //
  // Handle Axios configuration and listenners
  //

  const url = useSelector((state) => (state.server ? state.server.url : ""));
  let serviceWorkerIgnoreUpdate = false;

  axios.defaults.baseURL = url;
  axios.defaults.timeout = 50000; // Default timeout for every request
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error && error.response && error.response.status === 503) {
        dispatch(ServerActions.maintenance());
      } else {
        dispatch(ServerActions.error(error.response));
      }
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    // On every url update from redux, we update axios default baseURL
    axios.defaults.baseURL = url;
  }, [url]);

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
        if (minutes_last_seen > 60 * 10) {
          dispatch(AppActions.snackbar("Welcome back 👋"));
          dispatch(AppActions.lastSeen());
        } else if (minutes_last_seen >= 1) {
          dispatch(AppActions.lastSeen());
        }

        if (serviceWorkerRegistration) {
          serviceWorkerRegistration.update();
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

  const path = useSelector((state) => state.app.url);
  useEffect(() => {
    // Redirect on load based on redux stored path, except for logout and resetpassword.
    if (
      !window.location.pathname.startsWith("/resetpassword") &&
      !window.location.pathname.startsWith("/settings/subscription") &&
      !window.location.pathname.startsWith("/reset") &&
      !window.location.pathname.startsWith("/logout")
    ) {
      history.push(path);
    }

    const removeListener = history.listen((location) => {
      dispatch(AppActions.navigate(location.pathname));
    });

    return () => {
      removeListener();
    };
  }, []);

  //
  // Handle listenner to notify serviceworker onupdatefound event with a snackbar
  //

  useEffect(() => {
    // Connect with workbow to display snackbar when update is available.
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

  //
  // Handle cipher   update for security
  //

  const cipher = useSelector((state) => (state.user ? state.user.cipher : ""));
  useEffect(() => {
    if (cipher) {
      encryption.key(cipher);
    }
  }, [cipher]);

  //
  // HANDLE POPUP events to show / hide and inject componentns.
  //

  // If local + remote accounts length is zero, we redirect user to dashboard
  // and how the welcoming panel. This panel disappear as soon as an account is
  // created.
  // We check if isOpen = "welcoming" to handle the login use case to close the popup.

  // isOpen is a String which contain popup content
  const isOpen = useSelector((state) => state.state.popup);
  // component to inject on popup
  const [component, setComponent] = useState(null);
  // nbAccount is used to define some basic behaviour if user need to create an account
  const nbAccount = useSelector(
    (state) => state.accounts.remote.length + state.accounts.local.length
  );

  useEffect(() => {
    if (window.location.pathname != "/resetpassword") {
      if (nbAccount < 1) {
        history.push("/dashboard");
        dispatch(AppActions.popup("welcoming"));
      } else if (isOpen && isOpen == "welcoming") {
        dispatch(AppActions.popup());
        setTimeout(() => setComponent(), 500);
      }
    }
  }, [nbAccount]);

  // When popup open, we inject Welcoming component to have lazy load.
  useEffect(() => {
    if (isOpen == "welcoming") {
      setComponent(<Welcoming />);
    } else if (isOpen == "login") {
      setComponent(
        <Welcoming
          connectOnly
          onClose={() => {
            dispatch(AppActions.popup());
            setTimeout(() => setComponent(), 500);
          }}
        />
      );
    } else if (isOpen == "resetPassword") {
      setComponent(
        <ResetPasswordForm
          onClose={() => {
            history.push("/dashboard");
            if (nbAccount < 1) {
              dispatch(AppActions.popup("welcoming"));
            } else {
              dispatch(AppActions.popup());
              setTimeout(() => {
                setComponent();
              }, 500);
            }
          }}
        />
      );
    }
  }, [isOpen]);

  //
  // Load variable for rendering only
  //

  // Load theme to inject in MuiThemeProvider
  const theme = useTheme();
  // Current selected account to show/hide some elements if account.isLocal
  const account = useSelector((state) => state.account);
  // Disable some UI element if app is syncing
  const isSyncing = useSelector(
    (state) => state.state.isSyncing || state.state.isLoading
  );
  // year
  const year = new Date().getFullYear();
  // month
  const month = new Date().getMonth() + 1;

  return (
    <HookedBrowserRouter history={history}>
      <MuiThemeProvider theme={theme}>
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <div id="appContainer">
            <div id="iPadBorder"></div>
            <div
              id="container"
              style={{
                backgroundColor: theme.palette.background.default,
                color: theme.palette.text.primary,
              }}
            >
              <div id="fullScreenComponent" className={isOpen ? "open" : ""}>
                {component}
              </div>

              <aside className="navigation">
                <Route component={Navigation} />
              </aside>
              <div id="content">
                <div id="toolbar" className="hideMobile">
                  <div className="left"></div>
                  <div className="right">
                    {account && !account.isLocal ? (
                      <SyncButton className="showDesktop" />
                    ) : (
                      ""
                    )}

                    {nbAccount >= 1 && account && !account.isLocal ? (
                      <hr className="showDesktop" />
                    ) : (
                      ""
                    )}
                    {account && nbAccount >= 1 ? (
                      <AccountSelector
                        disabled={isSyncing}
                        className="showDesktop"
                      />
                    ) : (
                      ""
                    )}
                    {account && nbAccount >= 1 ? (
                      <CurrencySelector
                        disabled={isSyncing}
                        display="code"
                        className="showDesktop"
                      />
                    ) : (
                      ""
                    )}
                    <hr className="showDesktop" />
                    <UserButton history={history} />
                  </div>
                </div>
                <main style={{ position: "relative", flexGrow: 1 }}>
                  <Switch>
                    <Redirect exact from="/" to="/dashboard" />
                    <Route exact path="/dashboard" component={Dashboard} />
                    <Route exact path="/report" component={Report} />
                    <Redirect
                      exact
                      from="/transactions"
                      to={`/transactions/${year}/${month}`}
                    />
                    <Route
                      path="/transactions/:year/:month"
                      component={Transactions}
                    />
                    <Route exact path="/categories" component={Categories} />
                    <Route path="/categories/:id" component={Categories} />
                    <Route exact path="/changes" component={Changes} />
                    <Route path="/changes/:id" component={Changes} />
                    <Route path="/search" component={Search} />
                    <Route path="/convertor" component={Convertor} />
                    <Route path="/nomadlist" component={Nomadlist} />
                    <Route path="/settings" component={Settings} />
                    <Route path="/logout" component={Logout} />
                    <Route path="/reset" component={Reset} />
                    <Route path="/resetpassword" component={ResetPassword} />
                  </Switch>
                  <SnackbarsManager />
                </main>
              </div>
            </div>
          </div>
        </MuiPickersUtilsProvider>
      </MuiThemeProvider>
    </HookedBrowserRouter>
  );
};
