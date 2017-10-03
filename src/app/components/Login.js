import axios from 'axios';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { Link, Route, Switch } from 'react-router-dom';

// Router
import LoginForm from './login/LoginForm';
import ServerForm from './login/ServerForm';
import ForgottenPasswordForm from './login/ForgottenPasswordForm';
import ResetPasswordForm from './login/ResetPasswordForm';
import SignUpForm from './login/SignUpForm';
import About from './login/About';
import NoAccounts from './accounts/NoAccounts';

import FlatButton from 'material-ui/FlatButton';
import CircularProgress from 'material-ui/CircularProgress';

import DeviceSettingsDaydream from 'material-ui/svg-icons/device/settings-system-daydream';
import InfoOutline from 'material-ui/svg-icons/action/info-outline';
import AccountBox from 'material-ui/svg-icons/action/account-box';
import LiveHelp from 'material-ui/svg-icons/communication/live-help';
import KeyboardArrowLeft from 'material-ui/svg-icons/hardware/keyboard-arrow-left';


const styles = {
  hide: {
    display: 'none',
  }
};

class Login extends Component {

  constructor(props, context) {
    super(props, context);
    this.context = context;
    this.state = {
      open: false,
      loading: false,
      error: {},
      username: '',
      password: '',
      stateStyleClasse: props.location.pathname.replace('/', '') + 'Layout',
      nextPathname: props.location.state ? props.location.state.nextPathname : '/',
      serverName: 'Server : ' + localStorage.getItem('server').replace('http://','').replace('https://','').split(/[/?#]/)[0],
    };
    axios.defaults.baseURL = localStorage.getItem('server');
  }

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  }

  componentWillReceiveProps(nextProps){
    this.setState({
      stateStyleClasse: nextProps.location.pathname.replace('/', '') + 'Layout',
      serverName: 'Server : ' + localStorage.getItem('server').replace('http://','').replace('https://','').split(/[/?#]/)[0],
    });
  }

  render() {

    return (
      <div id="loginLayout">
        { this.state.loading
          ?
          <div className="flexboxContainer">
            <div className="flexbox">
              <CircularProgress size={80} />
            </div>
          </div>
          :
          <div className={this.state.stateStyleClasse}>
            <div className="goBackLoginButton">
              <Link to="/login">
                <FlatButton
                label="Back to login page"
                primary={true}
                onTouchTap={this.handleBackToLogin}
                icon={<KeyboardArrowLeft/>}/>
              </Link>
            </div>
            <div className="card">
              <Switch>
                <Route name="login" path="/login" component={LoginForm} />
                <Route name="server" path="/server" component={ServerForm} />
                <Route name="forgotpassword" path="/forgotpassword" component={ForgottenPasswordForm} />
                <Route name="signup" path="/signup" component={SignUpForm} />
                <Route name="about" path="/about" component={About} />
                <Route name="accounts" path="/accounts" component={NoAccounts} />
                <Route name="resetpassword" path="/resetpassword" component={ResetPasswordForm} />
              </Switch>
            </div>
            <div className="actionsLeft">
              <Link to="/signup">
                <FlatButton
                label="Sign up"
                primary={true}
                icon={<AccountBox/>}/>
              </Link>
              <Link to="/forgotpassword">
                <FlatButton
                label="Forgotten Password"
                icon={<LiveHelp/>} />
              </Link>
            </div>
            <div className="actionsRight">
              <Link to="/server">
                <FlatButton
                label={this.state.serverName}
                primary={true}
                icon={<DeviceSettingsDaydream/>}/>
              </Link>
              <Link to="/about">
                <FlatButton
                label="About"
                primary={true}
                icon={<InfoOutline/>}/>
              </Link>
            </div>
          </div>
        }
      </div>
    );
  }
}

Login.propTypes = {
  location: PropTypes.object.isRequired,
};

export default Login;
