/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import LinearProgress from "@material-ui/core/LinearProgress";

import UserActions from "../../../actions/UserActions";

class PasswordForm extends Component {
  constructor(props, context) {
    super(props, context);
    // Set default values
    this.state = {
      id: null,
      oldPassword: "",
      newPassword: "",
      repeatPassword: "",
      loading: false,
      onSubmit: props.onSubmit,
      onClose: props.onClose,
      error: {} // error messages in form from WS
    };
  }

  handleCloseForm = () => {
    this.state.onClose();
  };

  handleSubmit = () => {
    this.state.onSubmit();
  };

  handleOldPasswordChange = event => {
    this.setState({
      oldPassword: event.target.value
    });
  };

  handleNewPasswordChange = event => {
    this.setState({
      newPassword: event.target.value
    });
  };

  handleRepeatNewPasswordChange = event => {
    this.setState({
      repeatPassword: event.target.value
    });
  };

  save = e => {
    if (e) {
      e.preventDefault();
    }

    if (this.state.newPassword !== this.state.repeatPassword) {
      this.setState({
        error: {
          newPassword: "Not the same as your second try",
          repeatPassword: "Not the same as your first try"
        },
        loading: false
      });
    } else {
      this.setState({
        error: {},
        loading: true
      });

      let user = {
        old_password: this.state.oldPassword,
        new_password1: this.state.newPassword,
        new_password2: this.state.repeatPassword
      };

      const { dispatch } = this.props;

      dispatch(UserActions.changePassword(user))
        .then(args => {
          this.handleSubmit();
        })
        .catch(error => {
          if (
            error &&
            (error["new_password1"] ||
              error["new_password2"] ||
              error["old_password"])
          ) {
            this.setState({
              error: error,
              loading: false
            });
          }
        });
    }
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({
      onSubmit: nextProps.onSubmit,
      onClose: nextProps.onClose
    });
  }

  componentDidMount() {}

  render() {
    return (
      <form onSubmit={this.save} className="content">
        <header>
          <h2 style={{ color: "white" }}>Password</h2>
        </header>
        {this.state.loading ? <LinearProgress mode="indeterminate" /> : ""}
        <div className="form">
          <TextField
            label="Old password"
            type="password"
            onChange={this.handleOldPasswordChange}
            value={this.state.oldPassword}
            style={{ width: "100%" }}
            error={Boolean(this.state.error.old_password)}
            helperText={this.state.error.old_password}
            disabled={this.state.loading}
            margin="normal"
          />
          <br />
          <TextField
            label="New password"
            type="password"
            onChange={this.handleNewPasswordChange}
            value={this.state.newPassword}
            style={{ width: "100%" }}
            error={Boolean(this.state.error.new_password1)}
            helperText={this.state.error.new_password1}
            disabled={this.state.loading}
            margin="normal"
          />
          <br />
          <TextField
            label="Please repeat new password"
            type="password"
            onChange={this.handleRepeatNewPasswordChange}
            value={this.state.repeatPassword}
            style={{ width: "100%" }}
            error={Boolean(this.state.error.new_password2)}
            helperText={this.state.error.new_password2}
            disabled={this.state.loading}
            margin="normal"
          />
        </div>
        <footer>
          <Button onClick={this.handleCloseForm}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            style={{ marginLeft: "8px" }}
          >
            Submit
          </Button>
        </footer>
      </form>
    );
  }
}

PasswordForm.propTypes = {
  dispatch: PropTypes.func.isRequired,
  accounts: PropTypes.array.isRequired
};

const mapStateToProps = (state, ownProps) => {
  return {
    accounts: state.accounts.remote
  };
};

export default connect(mapStateToProps)(PasswordForm);
