import React, {Component} from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {Card, CardText} from 'material-ui/Card';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';

import DeviceSettingsDaydream from 'material-ui/svg-icons/device/settings-system-daydream';
import InfoOutline from 'material-ui/svg-icons/action/info-outline';
import AccountBox from 'material-ui/svg-icons/action/account-box';
import LiveHelp from 'material-ui/svg-icons/communication/live-help';
import KeyboardArrowLeft from 'material-ui/svg-icons/hardware/keyboard-arrow-left';

import UserActions from '../actions/UserActions';
import UserStore from '../stores/UserStore';

const styles = {
  h1: {
    padding: '30px 10px 0px 0px',
    margin: '0',
    textAlign: 'center',
  },
  connect: {
    margin: '20px 0px 0px 150px',
  },
};

class Login extends Component {

  constructor(props, context) {
    super(props, context);

    this.context = context;
    this.state = {
      open: false,
      className: 'loginLayout',
      loading: false,
      error: {},
      username: '',
      password: '',
      nextPathname: props.location.state ? props.location.state.nextPathname : '/',
    };
  }

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();

    // Start animation during login process
    this.setState({
      loading: true,
    });

    let self = this;

    // Wait for login return event
    UserStore.onceChangeListener((args) => {
      if (args) {
        self.setState({
          loading: false,
          error: {
            username: args.username || args.non_field_errors,
            password: args.password || args.non_field_errors,
          }
        });
      } else {
        self.context.router.replace(self.state.nextPathname);
      }
    });

     // Send login action
    UserActions.login(this.state.username, this.state.password);
  }

  handleBackToLogin = () => {
    this.setState({
      className: 'loginLayout',
    });
  }

  handleServerTap = () => {
    this.setState({
      className: 'serverLayout',
    });
  }

  handleAboutTap = () => {
    this.setState({
      className: 'aboutLayout',
    });
  }

  handleForgottenPasswordTap = () => {
    this.setState({
      className: 'forgottenPasswordLayout',
    });
  }

  handleCreateAccountTap = () => {
    this.setState({
      className: 'createAccountLayout',
    });
  }

  handleChangeUsername = (event) => {
    this.setState({username: event.target.value});
  }

  handleChangePassword = (event) => {
    this.setState({password: event.target.value});
  }

  render() {
    const standardActions = (
      <FlatButton
      label="Ok"
      primary={true}
      onTouchTap={this.handleRequestClose}
      />
      );

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
          <div className={this.state.className}>
            <div className="goBackLoginButton">
              <FlatButton
              label="Back to login page"
              primary={true}
              onTouchTap={this.handleBackToLogin}
              icon={<KeyboardArrowLeft/>}/>
            </div>
            <Card className="card">
              <CardText expandable={false}>
                <form onSubmit={e => this.handleSubmit(e)} >
                  <TextField
                    floatingLabelText="Username"
                    value={this.state.username}
                    errorText={this.state.error.username}
                    onChange={this.handleChangeUsername}
                  /><br />
                  <TextField
                    floatingLabelText="Password"
                    type="password"
                    value={this.state.password}
                    errorText={this.state.error.password}
                    onChange={this.handleChangePassword}
                  /><br/>
                  <RaisedButton
                    label="Connect"
                    type="submit"
                    primary={true}
                    style={styles.connect} />
                </form>
              </CardText>
            </Card>
            <div className="actionsLeft">
              <FlatButton
              label="Create Account"
              primary={true}
              onTouchTap={this.handleCreateAccountTap}
              icon={<AccountBox/>}/>
              <FlatButton
              label="Forgotten Password"
              onTouchTap={this.handleForgottenPasswordTap}
              icon={<LiveHelp/>} />
            </div>
            <div className="actionsRight">
              <FlatButton
              label="Server"
              primary={true}
              onTouchTap={this.handleServerTap}
              icon={<DeviceSettingsDaydream/>}/>
              <FlatButton
              label="About"
              primary={true}
              onTouchTap={this.handleAboutTap}
              icon={<InfoOutline/>}/>
            </div>
            <Dialog
            open={this.state.open}
            title="Super Secret Password"
            actions={standardActions}
            onRequestClose={this.handleRequestClose}
            >
            1-2-3-4-5
            </Dialog>
          </div>
        }
      </div>
    );
  }
}

// Inject router in context
Login.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default Login;
