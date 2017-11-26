/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from "react";
import PropTypes from "prop-types";
import FlatButton from "material-ui/FlatButton";
import RaisedButton from "material-ui/RaisedButton";
import TextField from "material-ui/TextField";

import LinearProgress from "material-ui/LinearProgress";

import UserStore from "../../../stores/UserStore";
import UserActions from "../../../actions/UserActions";

const styles = {};

class EmailForm extends Component {
  constructor(props, context) {
    super(props, context);
    // Set default values
    this.state = {
      email: UserStore.user.email,
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

  handleEmailChange = event => {
    this.setState({
      email: event.target.value
    });
  };

  save = e => {
    if (e) {
      e.preventDefault();
    }

    let component = this;

    component.setState({
      error: {},
      loading: true
    });

    let data = {
      email: this.state.email
    };

    UserStore.onceChangeListener(args => {
      if (args) {
        if (args.id) {
          this.handleSubmit();
        } else {
          component.setState({
            error: args,
            loading: false
          });
        }
      } else {
        this.handleSubmit();
      }
    });

    UserActions.changeEmail(data);
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      loading: false,
      onSubmit: nextProps.onSubmit,
      onClose: nextProps.onClose,
      error: {} // error messages in form from WS
    });
  }

  render() {
    return (
      <div>
        {this.state.loading ? <LinearProgress mode="indeterminate" /> : ""}
        <form onSubmit={this.save} className="content">
          <header>
            <h2>Email</h2>
          </header>
          <div className="form">
            <TextField
              floatingLabelText="Email"
              onChange={this.handleEmailChange}
              disabled={this.state.loading}
              defaultValue={this.state.email}
              style={{ width: "100%" }}
              errorText={this.state.error.email}
            />
          </div>
          <footer>
            <FlatButton label="Cancel" onClick={this.handleCloseForm} />
            <RaisedButton
              label="Submit"
              type="submit"
              style={{ marginLeft: "8px" }}
              primary={true}
            />
          </footer>
        </form>
      </div>
    );
  }
}

export default EmailForm;
