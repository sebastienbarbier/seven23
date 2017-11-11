import axios from 'axios';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Link, Route, Switch } from 'react-router-dom';
import { AnimatedSwitch } from 'react-router-transition';
import { blueGrey200 } from 'material-ui/styles/colors';

import auth from '../auth';

// Router
import LoginForm from './login/LoginForm';
import ForgottenPasswordForm from './login/ForgottenPasswordForm';
import ResetPasswordForm from './login/ResetPasswordForm';
import SignUpForm from './login/SignUpForm';
import NoAccounts from './accounts/NoAccounts';

import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

import IconButton from 'material-ui/IconButton';
import LinearProgress from 'material-ui/LinearProgress';

import DeviceSettingsDaydream from 'material-ui/svg-icons/device/settings-system-daydream';
import InfoOutline from 'material-ui/svg-icons/action/info-outline';
import AccountBox from 'material-ui/svg-icons/action/account-box';
import CancelIcon from 'material-ui/svg-icons/navigation/cancel';
import EditIcon from 'material-ui/svg-icons/image/edit';
import StorageIcon from 'material-ui/svg-icons/device/storage';
import LiveHelp from 'material-ui/svg-icons/communication/live-help';
import KeyboardArrowLeft from 'material-ui/svg-icons/hardware/keyboard-arrow-left';

const styles = {
  hide: {
    display: 'none',
  },
  layout: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    fontSize: '16px',
    color: 'white',
    lineHeight: '1.3em'
  },
  layoutWrap: {
    display: 'flex',
    padding: '30px',
    alignItems: 'flex-end'
  },
  urlField: {

  }
};

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
      inputUrl: localStorage.getItem('server'),
      url: localStorage.getItem('server'),
      nextPathname: props.location.state ? props.location.state.nextPathname : '/'
    };
    axios.defaults.baseURL = localStorage.getItem('server');
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
      url: this.state.inputUrl
    });
    this.connect(this.state.inputUrl);
  };

  handleChangeServer = () => {
    this.setState({
      connected: false,
      url: null,
      error: {}
    });
  };

  // Event on input typing
  handleChangeUrl = (event) => {
    this.setState({
     inputUrl: event.target.value
    });
  };

  connect = (url) => {
    const that = this;

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

    axios({
      url: url + '/api/init',
      method: 'get',
    })
    .then((response) => {

      this.setState({
        serverData: response.data
      });

      const dateEnd = moment();
      let duration = 1;
      if (dateEnd.diff(dateBegin, 'seconds') <= 2000) {
        duration = 2000 - dateEnd.diff(dateBegin, 'seconds');
      }
      setTimeout(() => {
        localStorage.setItem('server', url);
        axios.defaults.baseURL = url;
        const noLoginRequired = ['/forgotpassword','/signup','/accounts','/resetpassword'];

        if (!auth.loggedIn() && noLoginRequired.indexOf(this.history.location.pathname) === -1) {
          that.history.push('/login');
        }

        that.setState({
          url: url,
          loading: false,
          animate: false,
          connected: true
        });
      }, duration);
    })
    .catch(function(ex) {
      // TO BE DEFINED
      that.setState({
        loading: true,
        url: null,
        inputUrl: url,
        animate: false,
        connected: false,
        error: {
          url: ex.message
        }
      });
    });
  };

  componentDidMount() {
    // Timout allow allow smooth transition in navigation
    this.connect(localStorage.getItem('server'));
  }

  componentWillReceiveProps(nextProps){
  }

  render() {

    return (
      <div id="loginLayout">
        { this.state.animate
          ?
          <LinearProgress mode="indeterminate" style={{height: '6px'}} />
          : '' }

          { this.state.connected
            ?
            <header><Link to="/login">
              <h1>Seven23</h1></Link>
            </header>
          : '' }

          <div className="content">
            { this.state.connected
              ?
              <div>
                <div className="card">
                  <Switch>
                    <Route name="login" path="/" component={LoginForm} />
                    <Route name="login" path="/login" component={LoginForm} />
                    <Route name="forgotpassword" path="/forgotpassword" component={ForgottenPasswordForm} />
                    <Route name="signup" path="/signup" component={SignUpForm} />
                    <Route name="accounts" path="/accounts" component={NoAccounts} />
                    <Route name="resetpassword" path="/resetpassword" component={ResetPasswordForm} />
                  </Switch>
                </div>
              </div>
              :
              ''
            }
          </div>
          <footer style={styles.layout}>
            { this.state.url && !this.state.connected ?
              <div style={styles.layoutWrap}>
                <StorageIcon style={{width: '30px', height: '30px', marginBottom: '4px', marginRight: '18px'}} />
                <p style={{margin: '8px 0'}} className="threeDotsAnimated">Connecting to { this.state.inputUrl.replace('http://','').replace('https://','').split(/[/?#]/)[0] }</p>
                <IconButton
                  onClick={this.handleCancelServerInit}
                  className="delay2sec"
                  style={{ marginLeft: '10px', padding: '10px 10px 0 10px' }}
                  tooltip="Cancel request"
                  tooltipPosition="top-center">
                  <CancelIcon />
                </IconButton>
              </div>
              : ''
            }
            { !this.state.url && !this.state.connected ?
              <form style={styles.layoutWrap} onSubmit={(event) => {this.handleConnect(); event.preventDefault();}}>
                <StorageIcon style={{width: '30px', height: '30px', marginBottom: '4px', marginRight: '18px'}} />
                <TextField
                  floatingLabelText="Server url"
                  hintText="https://"
                  value={this.state.inputUrl}
                  style={styles.urlField}
                  disabled={this.state.animate}
                  floatingLabelFocusStyle={{color: blueGrey200}}
                  errorStyle={{color: blueGrey200}}
                  errorText={this.state.error.url}
                  onChange={this.handleChangeUrl}
                  tabIndex={1}
                />
                <FlatButton
                  label="Connect"
                  style={{ padding: '0 20px', marginLeft: '6px' }}
                  disabled={this.state.animate}
                  onClick={this.handleConnect}></FlatButton>
              </form>
              : ''
            }
            { this.state.url && this.state.connected ?
              <div style={styles.layoutWrap}>
                <StorageIcon style={{width: '30px', height: '30px', marginBottom: '4px', marginRight: '8px'}} />
                <FlatButton
                  style={{ padding: '0 40px 0 10px', marginLeft: '0px' }}
                  onClick={this.handleChangeServer}>
                  { this.state.url.replace('http://','').replace('https://','').split(/[/?#]/)[0] }
                </FlatButton>
              </div>
              : ''
            }

            { this.state.url && this.state.connected ?
            <div style={{ padding: '0 20px', marginBottom: '36px' }}>
              { this.state.serverData.allow_account_creation ?
              <Link to="/signup">
                <FlatButton
                label="Sign up"
                icon={<AccountBox/>}/>
              </Link>
              : '' }
              <Link to="/forgotpassword">
                <FlatButton
                label="Forgotten Password"
                icon={<LiveHelp/>} />
              </Link>
            </div>
              : ''
            }
          </footer>
      </div>
    );
  }
}

Login.propTypes = {
  location: PropTypes.object.isRequired,
};

export default Login;
