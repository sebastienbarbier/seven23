import React, { Component } from 'react';
import { connect } from 'react-redux';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

import UserActions from '../../actions/UserActions';

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

    // Send login action
    const { dispatch } = this.props;
    dispatch(UserActions.login(this.state.username, this.state.password)).catch((error) => {
      this.setState({
        loading: false,
        error: {
          username: error.username || error.non_field_errors,
          password: error.password || error.non_field_errors,
        },
      });
    });
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


export default connect()(LoginForm);
