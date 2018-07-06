import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Link, Route, Switch, Redirect } from 'react-router-dom';

import blueGrey from '@material-ui/core/colors/blueGrey';
import { withTheme } from '@material-ui/core/styles';

import storage from '../storage';

import ServerActions from '../actions/ServerActions';
import UserActions from '../actions/UserActions';
import AccountsActions from '../actions/AccountsActions';

// Router
import LoginForm from './login/LoginForm';
import ForgottenPasswordForm from './login/ForgottenPasswordForm';
import ResetPasswordForm from './login/ResetPasswordForm';
import SignUpForm from './login/SignUpForm';
import NoAccounts from './accounts/NoAccounts';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';

import LinearProgress from '@material-ui/core/LinearProgress';

import AccountBox from '@material-ui/icons/AccountBox';
import CancelIcon from '@material-ui/icons/Cancel';
import StorageIcon from '@material-ui/icons/Storage';
import LiveHelp from '@material-ui/icons/LiveHelp';

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
      inputUrl: localStorage.getItem('server'),
      url: localStorage.getItem('server'),
      nextPathname: props.location
        ? props.location.pathname
        : '/',
    };
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
    const { dispatch } = this.props;
    const { user } = this.props;

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
      storage
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
                    if (accounts && accounts.length === 0) {
                      that.history.push('/welcome');
                    } else {
                      dispatch(ServerActions.sync()).then(() => {
                        that.history.push(this.state.nextPathname);
                      });
                    }
                  });
                } else {
                  that.setState({
                    loading: false,
                    animate: false,
                    connected: true,
                  });
                  that.history.push('/login');
                }
              });
            } else {
              const noLoginRequired = [
                '/forgotpassword',
                '/signup',
                '/accounts',
                '/resetpassword',
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
                that.history.push('/login');
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
    this.connect(this.props.server.url);
  }

  componentWillReceiveProps(nextProps) {

  }

  render() {
    const { theme, server } = this.props;
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
            ''
          )}
        </div>
        <footer>
          <div className="connectForm">
            {server.url && this.state.connected ? (
              <Button
                disabled={!server.url || !this.state.connected}
                onClick={this.handleChangeServer}
                style={{ marginBottom: ' 1px' }}
              >
                <StorageIcon style={{ marginRight: 8 }} />{' '}
                {server.url && this.state.connected
                  ? server.name
                  : ''}
              </Button>
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
                  style={{ color: theme.palette.text.primary }}
                >
                  Connecting to{' '}
                  {
                    this.state.inputUrl
                      .replace('http://', '')
                      .replace('https://', '')
                      .split(/[/?#]/)[0]
                  }
                </span>
                <IconButton
                  onClick={this.handleCancelServerInit}
                  className="delay2sec"
                  style={{ position: 'relative', top: '7px' }}
                >
                  <CancelIcon />
                </IconButton>
              </p>
            ) : (
              ''
            )}
            {!server.url && !this.state.connected ? (
              <form
                onSubmit={event => {
                  this.handleConnect();
                  event.preventDefault();
                }}
              >
                <Button
                  disabled={!server.url || !this.state.connected}
                  style={{ marginBottom: ' 1px' }}
                  className="storageIcon"
                >
                  <StorageIcon />
                </Button>
                <TextField
                  floatingLabelText="Server url"
                  hintText="https://"
                  value={this.state.inputUrl}
                  disabled={this.state.animate}
                  floatingLabelFocusStyle={{ color: blueGrey[200] }}
                  errorStyle={{ color: blueGrey[200] }}
                  errorText={this.state.error.url}
                  onChange={this.handleChangeUrl}
                />
                <Button
                  className="connectButton"
                  disabled={this.state.animate}
                  onClick={this.handleConnect}
                >
                  Connect
                </Button>
              </form>
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
  theme: PropTypes.object.isRequired,
  server: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    server: state.server,
    user: state.user
  };
};

export default connect(mapStateToProps)(withTheme()(Login));
