import React, { Component } from "react";
import PropTypes from "prop-types";

import TextField from "material-ui/TextField";
import FlatButton from "material-ui/FlatButton";
import CircularProgress from "material-ui/CircularProgress";
import { Card, CardText } from "material-ui/Card";

import UserActions from "../../actions/UserActions";
import UserStore from "../../stores/UserStore";

const styles = {
  container: {
    textAlign: "center",
  },
  connect: {
    margin: "20px 0px 0px 0px",
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
      username: "",
      password: "",
      nextPathname: props.location.state
        ? props.location.state.nextPathname
        : "/",
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
              <CircularProgress size={80} />
            </div>
          </div>
        ) : (
          <div style={styles.container}>
            <form onSubmit={e => this.handleSubmit(e)}>
              <TextField
                floatingLabelText="Username"
                value={this.state.username}
                errorText={this.state.error.username}
                onChange={this.handleChangeUsername}
              />
              <br />
              <TextField
                floatingLabelText="Password"
                type="password"
                value={this.state.password}
                errorText={this.state.error.password}
                onChange={this.handleChangePassword}
              />
              <br />
              <FlatButton label="Login" type="submit" style={styles.connect} />
            </form>
          </div>
        )}
      </div>
    );
  }
}

export default LoginForm;
