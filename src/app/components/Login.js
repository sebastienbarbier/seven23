import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Link, Route, Switch, Redirect } from 'react-router-dom';

import blueGrey from '@material-ui/core/colors/blueGrey';
import { withRouter } from 'react-router-dom';

import storage from '../storage';

import ServerActions from '../actions/ServerActions';
import UserActions from '../actions/UserActions';
import AccountsActions from '../actions/AccountsActions';

// Router
import LoginForm from './login/LoginForm';
import ForgottenPasswordForm from './login/ForgottenPasswordForm';
import ResetPasswordForm from './login/ResetPasswordForm';
import SignUpForm from './login/SignUpForm';
import ServerForm from './login/ServerForm';
import NoAccounts from './accounts/NoAccounts';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';

import LinearProgress from '@material-ui/core/LinearProgress';

import AccountBox from '@material-ui/icons/AccountBox';
import CancelIcon from '@material-ui/icons/Cancel';
import LiveHelp from '@material-ui/icons/LiveHelp';
import StorageIcon from '@material-ui/icons/Storage';

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
      nextPathname: props.location
        ? props.location.pathname
        : '/',
    };
  }

  handleCancelServerInit = () => {
    this.setState({
      animate: false,
    });
    this.history.push('/server');
  };

  connect = (url, user = this.props.user) => {
    const that = this;
    const { dispatch } = this.props;

    const dateBegin = moment();

    if (url.startsWith('localhost')) {
      url = `http://${url}`;
    } else if (url.startsWith('http://localhost')) {
      // Do nothing
    } else if (url.startsWith('http://')) {
      url = url.replace('http://', 'https://');
    } else if (!url.startsWith('https://')) {
      url = `https://${url}`;
    }

    // Connect to server
    dispatch(ServerActions.connect(url)).then(() => {

      const dateEnd = moment();
      let duration = 1;
      if (dateEnd.diff(dateBegin, 'seconds') <= 2000) {
        duration = 2000 - dateEnd.diff(dateBegin, 'seconds');
      }

      // connect storage to indexedDB
      return storage
        .connectIndexedDB()
        .then(() => {

          that.setState({
            url: url,
          });

          setTimeout(() => {
            if (user.token && !user.profile) {

              dispatch(UserActions.fetchProfile()).then((profile) => {
                if (profile) {
                  dispatch(AccountsActions.sync()).then(accounts => {

                    // If after init user has no account, we redirect ot create one.
                      dispatch(ServerActions.sync()).then(() => {
                        if (accounts && accounts.length === 0) {
                          that.history.push('/welcome');
                        } else {
                          that.history.push(this.state.nextPathname);
                        }
                      });
                  });
                } else {
                  that.setState({
                    loading: false,
                    animate: false,
                    connected: true,
                  });
                  that.history.push('/login');
                }
              })
              .catch(exception => {
                console.error(exception);
                that.setState({
                  loading: false,
                  animate: false,
                  connected: true,
                });
                that.history.push('/login');
              });
            } else {
              const noLoginRequired = [
                '/forgotpassword',
                '/signup',
                '/accounts',
                '/resetpassword',
                '/server',
              ];

              that.setState({
                loading: false,
                animate: false,
                connected: true,
              });

              if (
                !user.token &&
                noLoginRequired.indexOf(this.history.location.pathname) === -1
              ) {
                this.history.push('/login');
              }
            }
          }, duration);
        })
        .catch(exception => {
          console.error(exception);
        });

    }).catch((exception) => {

      console.log(exception);
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
    if (this.props.server.url) {
      this.connect(this.props.server.url);
    } else {
      this.history.push('/server');
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.user.token && nextProps.user.token) {
      this.setState({
        loading: true,
      });
      this.connect(this.props.server.url, nextProps.user);
    }

    if (!nextProps.server.url && this.props.location.pathname !== '/server') {
      this.history.push('/server');
    }
  }

  render() {
    const { server } = this.props;
    return (
      <div id="loginLayout">
        {this.state.animate ? <LinearProgress style={{ height: '6px' }} /> : ''}

        {this.state.connected ? (
          <header>
            <Link to="/login">
              <h1>💸 723 💸</h1>
            </Link>
          </header>
        ) : (
          ''
        )}

        <div className="content">
          {this.state.connected ? (
            <div>
              <div className="card">
                <Switch>
                  <Redirect exact from="/" to="/login" />
                  <Route
                    name="login"
                    path="/login"
                    component={LoginForm} />
                  <Route
                    name="forgotpassword"
                    path="/forgotpassword"
                    component={ForgottenPasswordForm}
                  />
                  <Route
                    name="signup"
                    path="/signup"
                    component={SignUpForm} />
                  <Route
                    name="accounts"
                    path="/accounts"
                    component={NoAccounts}
                  />
                  <Route
                    name="server"
                    path="/server"
                    component={ServerForm}
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
            ''
          )}
        </div>
        <footer>
          <div className="connectForm">
            {server.url && this.state.connected ? (
              <Link to="/server">
                <Button
                  disabled={!server.url || !this.state.connected}
                  style={{ marginBottom: ' 1px' }}
                >
                  <StorageIcon style={{ marginRight: 8 }} />{' '}
                  {server.url && this.state.connected
                    ? server.name
                    : ''}
                </Button>
              </Link>
            ) : (
              ''
            )}

            {server.url && !this.state.connected ? (
              <p style={{ marginBottom: '0px' }}>
                <Button
                  disabled={!server.url || !this.state.connected}
                  style={{ marginBottom: ' 1px' }}
                >
                  <StorageIcon />
                </Button>
                <span
                  className="threeDotsAnimated"
                >
                  Connecting to { server.name }
                </span>
                <IconButton
                  onClick={this.handleCancelServerInit}
                  className="delay2sec"
                >
                  <CancelIcon />
                </IconButton>
              </p>
            ) : (
              ''
            )}
          </div>

          {server.url && this.state.connected ? (
            <div>
              { server.allow_account_creation ? (
                <Link to="/signup">
                  <Button>
                    <AccountBox style={{ marginRight: 8 }} /> Sign up
                  </Button>
                </Link>
              ) : (
                ''
              )}
              <Link to="/forgotpassword">
                <Button>
                  <LiveHelp style={{ marginRight: 8 }} /> Forgotten Password
                </Button>
              </Link>
            </div>
          ) : (
            ''
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
  server: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    server: state.server,
    user: state.user
  };
};

export default withRouter(connect(mapStateToProps)(Login));
