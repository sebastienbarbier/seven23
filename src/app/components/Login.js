import axios from "axios";
import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { Link, Route, Switch, Redirect } from "react-router-dom";
import { AnimatedSwitch } from "react-router-transition";
import { blueGrey200 } from "material-ui/styles/colors";

import auth from "../auth";
import ServerStore from "../stores/ServerStore";

// Router
import LoginForm from "./login/LoginForm";
import ForgottenPasswordForm from "./login/ForgottenPasswordForm";
import ResetPasswordForm from "./login/ResetPasswordForm";
import SignUpForm from "./login/SignUpForm";
import NoAccounts from "./accounts/NoAccounts";

import FlatButton from "material-ui/FlatButton";
import TextField from "material-ui/TextField";

import IconButton from "material-ui/IconButton";
import LinearProgress from "material-ui/LinearProgress";

import DeviceSettingsDaydream from "material-ui/svg-icons/device/settings-system-daydream";
import InfoOutline from "material-ui/svg-icons/action/info-outline";
import AccountBox from "material-ui/svg-icons/action/account-box";
import CancelIcon from "material-ui/svg-icons/navigation/cancel";
import EditIcon from "material-ui/svg-icons/image/edit";
import StorageIcon from "material-ui/svg-icons/device/storage";
import LiveHelp from "material-ui/svg-icons/communication/live-help";
import KeyboardArrowLeft from "material-ui/svg-icons/hardware/keyboard-arrow-left";

const styles = {};

class Login extends Component {
  constructor(props, context) {
    super(props, context);
    this.context = context;
    this.history = props.history;
    this.state = {
      animate: true,
      loading: true,
      connected: false,
      error: {},
      serverData: {},
      inputUrl: localStorage.getItem("server"),
      url: localStorage.getItem("server"),
      nextPathname: props.location.state
        ? props.location.state.nextPathname
        : "/",
    };
    axios.defaults.baseURL = localStorage.getItem("server");
  }

  handleCancelServerInit = () => {
    this.setState({
      url: null,
      animate: false,
    });
  };

  handleConnect = () => {
    this.setState({
      animate: true,
      url: this.state.inputUrl,
    });
    this.connect(this.state.inputUrl);
  };

  handleChangeServer = () => {
    this.setState({
      connected: false,
      url: null,
      error: {},
    });
  };

  // Event on input typing
  handleChangeUrl = event => {
    this.setState({
      inputUrl: event.target.value,
    });
  };

  connect = url => {
    const that = this;

    const dateBegin = moment();

    if (url.startsWith("localhost")) {
      url = `http://${url}`;
    } else if (url.startsWith("http://localhost")) {
      // Do nothing
    } else if (url.startsWith("http://")) {
      url = url.replace("http://", "https://");
    } else if (!url.startsWith("https://")) {
      url = `https://${url}`;
    }

    axios.defaults.baseURL = url;

    ServerStore.initialize()
      .then(() => {
        this.setState({
          serverData: ServerStore.server,
        });

        const dateEnd = moment();
        let duration = 1;
        if (dateEnd.diff(dateBegin, "seconds") <= 2000) {
          duration = 2000 - dateEnd.diff(dateBegin, "seconds");
        }
        setTimeout(() => {
          localStorage.setItem("server", url);
          const noLoginRequired = [
            "/forgotpassword",
            "/signup",
            "/accounts",
            "/resetpassword",
          ];

          if (
            !auth.loggedIn() &&
            noLoginRequired.indexOf(this.history.location.pathname) === -1
          ) {
            that.history.push("/login");
          }

          that.setState({
            url: url,
            loading: false,
            animate: false,
            connected: true,
          });
        }, duration);
      })
      .catch(exception => {
        // TO BE DEFINED
        that.setState({
          loading: true,
          url: null,
          inputUrl: url,
          animate: false,
          connected: false,
          error: {
            url: exception.message,
          },
        });
      });
  };

  componentDidMount() {
    // Timout allow allow smooth transition in navigation
    this.connect(localStorage.getItem("server"));
  }

  componentWillReceiveProps(nextProps) {}

  render() {
    return (
      <div id="loginLayout">
        {this.state.animate ? (
          <LinearProgress mode="indeterminate" style={{ height: "6px" }} />
        ) : (
          ""
        )}

        {this.state.connected ? (
          <header>
            <Link to="/login">
              <h1>Seven23</h1>
            </Link>
          </header>
        ) : (
          ""
        )}

        <div className="content">
          {this.state.connected ? (
            <div>
              <div className="card">
                <Switch>
                  <Redirect exact from="/" to="/login" />
                  <Route name="login" path="/login" component={LoginForm} />
                  <Route
                    name="forgotpassword"
                    path="/forgotpassword"
                    component={ForgottenPasswordForm}
                  />
                  <Route name="signup" path="/signup" component={SignUpForm} />
                  <Route
                    name="accounts"
                    path="/accounts"
                    component={NoAccounts}
                  />
                  <Route
                    name="resetpassword"
                    path="/resetpassword"
                    component={ResetPasswordForm}
                  />
                </Switch>
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
        <footer>
          <div className="connectForm">
            <FlatButton
              label={
                this.state.url && this.state.connected
                  ? this.state.url
                      .replace("http://", "")
                      .replace("https://", "")
                      .split(/[/?#]/)[0]
                  : ""
              }
              disabled={!this.state.url || !this.state.connected}
              onClick={this.handleChangeServer}
              style={{ marginBottom: " 1px" }}
              icon={<StorageIcon />}
            />

            {this.state.url && !this.state.connected ? (
              <p style={{ marginBottom: "0px" }}>
                <span className="threeDotsAnimated">
                  Connecting to{" "}
                  {
                    this.state.inputUrl
                      .replace("http://", "")
                      .replace("https://", "")
                      .split(/[/?#]/)[0]
                  }
                </span>
                <IconButton
                  onClick={this.handleCancelServerInit}
                  className="delay2sec"
                  style={{ position: "relative", top: "7px" }}
                  tooltip="Cancel request"
                  tooltipPosition="top-center"
                >
                  <CancelIcon />
                </IconButton>
              </p>
            ) : (
              ""
            )}
            {!this.state.url && !this.state.connected ? (
              <form
                onSubmit={event => {
                  this.handleConnect();
                  event.preventDefault();
                }}
              >
                <TextField
                  floatingLabelText="Server url"
                  hintText="https://"
                  value={this.state.inputUrl}
                  disabled={this.state.animate}
                  floatingLabelFocusStyle={{ color: blueGrey200 }}
                  errorStyle={{ color: blueGrey200 }}
                  errorText={this.state.error.url}
                  onChange={this.handleChangeUrl}
                  tabIndex={1}
                />
                <FlatButton
                  label="Connect"
                  style={{ padding: "0 20px", marginLeft: "6px" }}
                  disabled={this.state.animate}
                  onClick={this.handleConnect}
                />
              </form>
            ) : (
              ""
            )}
          </div>

          {this.state.url && this.state.connected ? (
            <div>
              {this.state.serverData.allow_account_creation ? (
                <Link to="/signup">
                  <FlatButton label="Sign up" icon={<AccountBox />} />
                </Link>
              ) : (
                ""
              )}
              <Link to="/forgotpassword">
                <FlatButton label="Forgotten Password" icon={<LiveHelp />} />
              </Link>
            </div>
          ) : (
            ""
          )}
        </footer>
      </div>
    );
  }
}

Login.propTypes = {
  location: PropTypes.object.isRequired,
};

export default Login;
