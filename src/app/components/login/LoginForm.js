import React, { Component } from 'react';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

import UserActions from '../../actions/UserActions';
import UserStore from '../../stores/UserStore';

const styles = {
  container: {
    textAlign: 'center',
  },
  connect: {
    margin: '20px 0px 0px 0px',
  },
};

class LoginForm extends Component {
  constructor(props, context) {
    super(props, context);
    this.context = context;
    this.location = props.location;
    this.state = {
      loading: false,
      error: {},
      username: '',
      password: '',
      nextPathname: props.location.state
        ? props.location.state.nextPathname
        : '/',
    };
  }

  handleChangeUsername = event => {
    this.setState({ username: event.target.value });
  };

  handleChangePassword = event => {
    this.setState({ password: event.target.value });
  };

  handleSubmit = e => {
    e.preventDefault();

    // Start animation during login process
    this.setState({
      loading: true,
    });

    let self = this;

    // Wait for login return event
    UserStore.onceChangeListener(args => {
      if (args) {
        self.setState({
          loading: false,
          error: {
            username: args.username || args.non_field_errors,
            password: args.password || args.non_field_errors,
          },
        });
      } else {
        //
      }
    });

    // Send login action
    UserActions.login(this.state.username, this.state.password);
  };

  render() {
    return (
      <div>
        {this.state.loading ? (
          <div className="flexboxContainer">
            <div className="flexbox">
              <CircularProgress color="secondary" size={80} />
            </div>
          </div>
        ) : (
          <div style={styles.container}>
            <form onSubmit={e => this.handleSubmit(e)}>
              <TextField
                error={Boolean(this.state.error.username)}
                label="Username"
                margin="normal"
                fullWidth
                value={this.state.username}
                helperText={this.state.error.username}
                onChange={this.handleChangeUsername}
              />
              <br />
              <TextField
                error={Boolean(this.state.error.password)}
                label="Password"
                type="password"
                margin="normal"
                fullWidth
                value={this.state.password}
                helperText={this.state.error.password}
                onChange={this.handleChangePassword}
              />
              <br />
              <Button type="submit" style={styles.connect}>
                Login
              </Button>
            </form>
          </div>
        )}
      </div>
    );
  }
}

export default LoginForm;
