import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Link, Route, Switch, Redirect, withRouter } from "react-router-dom";

import Button from "@material-ui/core/Button";
import LinearProgress from "@material-ui/core/LinearProgress";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";

import storage from "../storage";

import ServerActions from "../actions/ServerActions";
import UserActions from "../actions/UserActions";
import AccountsActions from "../actions/AccountsActions";

// Router
import LoginForm from "./login/LoginForm";
import ForgottenPasswordForm from "./login/ForgottenPasswordForm";
import ResetPasswordForm from "./login/ResetPasswordForm";
import SignUpForm from "./login/SignUpForm";
import ServerForm from "./login/ServerForm";

const styles = {
  serverButton: {
    marginBottom: " 1px",
    textTransform: "lowercase",
    display: "flex",
    justifyContent: "space-between",
    textAlign: "left"
  },
  serverButtonContent: {
    whitespace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  cardContent: {
    display: "flex",
    flex: "100%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 0,
    paddingBottom: 0,
    overflow: "auto",
    width: "100%"
  }
};

class Login extends Component {
  constructor(props, context) {
    super(props, context);
    this.context = context;
    this.history = props.history;
    this.state = {
      error: {},
      nextPathname: props.location ? props.location.pathname : "/"
    };
  }

  handleCancelServerInit = () => {
    this.history.push("/server");
  };

  connect = (url, user = this.props.user) => {
    const that = this;
    const { dispatch } = this.props;

    const noLoginRequired = [
      "/login",
      "/forgotpassword",
      "/signup",
      "/accounts",
      "/resetpassword",
      "/server"
    ];

    // Connect to server
    dispatch(ServerActions.connect(url))
      .then(() => {
        // connect storage to indexedDB
        return storage
          .connectIndexedDB()
          .then(() => {
            that.setState({
              url: url
            });

            if (user.token && user.cipher && user.profile === null) {
              // START LOGIN
              dispatch(UserActions.loginStart());
              dispatch(UserActions.fetchProfile())
                .then(profile => {
                  if (profile) {
                    dispatch(AccountsActions.sync())
                      .then(accounts => {
                        // If after init user has no account, we redirect ot create one.
                        dispatch(ServerActions.sync())
                          .then(() => {
                            dispatch(UserActions.login());
                            // END LOGIN
                            if (accounts && accounts.length === 0) {
                              that.history.push("/dashboard");
                            } else {
                              if (
                                noLoginRequired.indexOf(
                                  this.state.nextPathname
                                ) !== -1
                              ) {
                                that.history.push("/");
                              } else if (
                                this.history.location.pathname !== "/logout"
                              ) {
                                that.history.push(this.state.nextPathname);
                              }
                            }
                          })
                          .catch(exception => {
                            dispatch(UserActions.logout());
                            // END LOGIN
                            that.history.push("/login");
                          });
                      })
                      .catch(exception => {
                        console.error(exception);
                        dispatch(UserActions.logout());
                        // END LOGIN
                        that.history.push("/login");
                      });
                  } else {
                    dispatch(UserActions.loginStop());
                    // END LOGIN
                    that.history.push("/login");
                  }
                })
                .catch(exception => {
                  console.error(exception);
                  that.history.push("/login");
                });
            } else {
              if (
                (!user.token || !user.cipher) &&
                noLoginRequired.indexOf(this.history.location.pathname) === -1
              ) {
                this.history.push("/login");
              }
            }
          })
          .catch(exception => {
            console.error(exception);
            that.history.push("/server");
          });
      })
      .catch(exception => {
        that.setState({
          url: null,
          inputUrl: url,
          connected: false,
          error: {
            url: exception.message
          }
        });
        console.log(exception);
        that.history.push("/server");
      });
  };

  componentDidMount() {
    if (this.props.server.url) {
      this.connect(this.props.server.url);
    } else {
      this.history.push("/server");
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      !this.props.user.token &&
      nextProps.user.token &&
      !this.props.user.cipher &&
      nextProps.user.cipher
    ) {
      this.connect(this.props.server.url, nextProps.user);
    }

    if (
      !nextProps.isConnecting &&
      !nextProps.server.url &&
      this.props.location.pathname !== "/server"
    ) {
      this.history.push("/server");
    }
  }

  render() {
    const {
      server,
      isSyncing,
      isConnecting,
      isConnected,
      isLogging
    } = this.props;
    const { pathname } = this.props.location;

    const showFooter =
      pathname == "/login" && isConnected && !isConnecting && !isLogging;
    return (
      <div
        id="loginLayout"
        className={showFooter ? "showFooter" : "hideFooter"}
      >
        {isConnecting || isLogging ? (
          <LinearProgress style={{ height: "6px", width: "100%" }} />
        ) : (
          ""
        )}
        <Card className="content">
          <CardContent
            className="cardContentAnimation"
            style={styles.cardContent}
          >
            {isConnected && !isConnecting && !isSyncing && !isLogging ? (
              <Switch>
                <Redirect exact from="/" to="/login" />
                <Route name="login" path="/login" component={LoginForm} />
                <Route
                  name="forgotpassword"
                  path="/forgotpassword"
                  component={ForgottenPasswordForm}
                />
                <Route name="signup" path="/signup" component={SignUpForm} />
                <Route name="server" path="/server" component={ServerForm} />
                <Route
                  name="resetpassword"
                  path="/resetpassword"
                  component={ResetPasswordForm}
                />
              </Switch>
            ) : !isSyncing && !isConnected ? (
              <Switch>
                <Route name="server" path="/server" component={ServerForm} />
              </Switch>
            ) : (
              ""
            )}
          </CardContent>
        </Card>

        <footer>
          {server.url && isConnected ? (
            <Link to="/server" style={{ width: "100%" }}>
              <Button fullWidth style={styles.serverButton}>
                <span style={styles.serverButtonContent}>
                  <small style={{ fontWeight: 300 }}>server</small>
                  <br />
                  {server.name}
                </span>
                <KeyboardArrowRightIcon />
              </Button>
            </Link>
          ) : (
            ""
          )}
        </footer>
      </div>
    );
  }
}

Login.propTypes = {
  dispatch: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  isSyncing: PropTypes.bool.isRequired,
  isConnecting: PropTypes.bool.isRequired,
  isConnected: PropTypes.bool.isRequired,
  isLogging: PropTypes.bool.isRequired,
  server: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired
};

const mapStateToProps = (state, ownProps) => {
  return {
    server: state.server,
    isSyncing: state.state.isSyncing || state.state.isLoading,
    isConnecting: state.state.isConnecting,
    isLogging: state.state.isLogging,
    isConnected: state.server.isConnected,
    user: state.user
  };
};

export default withRouter(connect(mapStateToProps)(Login));
