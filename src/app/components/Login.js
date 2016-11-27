import React, {Component} from 'react';
import {Link} from 'react-router';

import FlatButton from 'material-ui/FlatButton';
import CircularProgress from 'material-ui/CircularProgress';

import DeviceSettingsDaydream from 'material-ui/svg-icons/device/settings-system-daydream';
import InfoOutline from 'material-ui/svg-icons/action/info-outline';
import AccountBox from 'material-ui/svg-icons/action/account-box';
import LiveHelp from 'material-ui/svg-icons/communication/live-help';
import KeyboardArrowLeft from 'material-ui/svg-icons/hardware/keyboard-arrow-left';

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
      stateName: this.props.children.type.name,
      nextPathname: props.location.state ? props.location.state.nextPathname : '/',
      serverName: 'Server : ' + localStorage.getItem('server').replace('http://','').replace('https://','').split(/[/?#]/)[0],
    };
  }

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  }

  componentWillReceiveProps(nextProps){
    this.setState({
      stateName: nextProps.children.type.name,
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
          <div className={this.state.stateName + 'Layout'}>
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
              {this.props.children}
            </div>
            <div className="actionsLeft">
              <Link to="/createaccount">
                <FlatButton
                label="Create Account"
                primary={true}
                onTouchTap={this.handleCreateAccountTap}
                icon={<AccountBox/>}/>
              </Link>
              <Link to="/forgotpassword">
                <FlatButton
                label="Forgotten Password"
                onTouchTap={this.handleForgottenPasswordTap}
                icon={<LiveHelp/>} />
              </Link>
            </div>
            <div className="actionsRight">
              <Link to="/server">
                <FlatButton
                label={this.state.serverName}
                primary={true}
                onTouchTap={this.handleServerTap}
                icon={<DeviceSettingsDaydream/>}/>
              </Link>
              <Link to="/about">
                <FlatButton
                label="About"
                primary={true}
                onTouchTap={this.handleAboutTap}
                icon={<InfoOutline/>}/>
              </Link>
            </div>
          </div>
        }
      </div>
    );
  }
}

export default Login;
