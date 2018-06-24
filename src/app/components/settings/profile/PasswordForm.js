/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import LinearProgress from '@material-ui/core/LinearProgress';

import UserStore from '../../../stores/UserStore';
import UserActions from '../../../actions/UserActions';

class PasswordForm extends Component {
  constructor(props, context) {
    super(props, context);
    // Set default values
    this.state = {
      id: null,
      oldpassword: '',
      newPassword: '',
      repeatPassword: '',
      loading: false,
      onSubmit: props.onSubmit,
      onClose: props.onClose,
      error: {}, // error messages in form from WS
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
      oldPassword: event.target.value,
    });
  };

  handleNewPasswordChange = event => {
    this.setState({
      newPassword: event.target.value,
    });
  };

  handleRepeatNewPasswordChange = event => {
    this.setState({
      repeatPassword: event.target.value,
    });
  };

  save = e => {
    let component = this;
    if (this.state.newPassword !== this.state.repeatPassword) {
      component.setState({
        error: {
          newPassword: 'Not the same as your second try',
          repeatPassword: 'Not the same as your first try',
        },
        loading: false,
      });
    } else {
      component.setState({
        error: {},
        loading: true,
      });

      let user = {
        old_password: this.state.oldPassword,
        new_password1: this.state.newPassword,
        new_password2: this.state.repeatPassword,
      };

      UserStore.onceChangePasswordListener(args => {
        if (
          args &&
          (args['new_password1'] ||
            args['new_password2'] ||
            args['old_password'])
        ) {
          component.setState({
            error: args,
            loading: false,
          });
        } else {
          this.handleSubmit();
        }
      });

      UserActions.changePassword(user);
    }

    if (e) {
      e.preventDefault();
    }
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      onSubmit: nextProps.onSubmit,
      onClose: nextProps.onClose,
      loading: false,
      error: {}, // error messages in form from WS
    });
  }

  componentDidMount() {
    setTimeout(() => {
      this.input.focus();
    }, 180);
  }

  render() {
    return (
      <div>
        {this.state.loading ? <LinearProgress mode="indeterminate" /> : ''}
        <form onSubmit={this.save} className="content">
          <header>
            <h2 style={{ color: 'white' }}>Password</h2>
          </header>
          <div className="form">
            <TextField
              label="Old password"
              type="password"
              onChange={this.handleOldPasswordChange}
              value={this.state.oldPassword}
              style={{ width: '100%' }}
              error={Boolean(this.state.error.old_password)}
              helperText={this.state.error.old_password}
              margin="normal"
              ref={input => {
                this.input = input;
              }}
            />
            <br />
            <TextField
              label="New password"
              type="password"
              onChange={this.handleNewPasswordChange}
              value={this.state.newPassword}
              style={{ width: '100%' }}
              error={Boolean(this.state.error.new_password1)}
              helperText={this.state.error.new_password1}
              margin="normal"
            />
            <br />
            <TextField
              label="Please repeat new password"
              type="password"
              onChange={this.handleRepeatNewPasswordChange}
              value={this.state.repeatPassword}
              style={{ width: '100%' }}
              error={Boolean(this.state.error.new_password2)}
              helperText={this.state.error.new_password2}
              margin="normal"
            />
          </div>
          <footer>
            <Button onClick={this.handleCloseForm} >Cancel</Button>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              style={{ marginLeft: '8px' }}
            >Submit</Button>
          </footer>
        </form>
      </div>
    );
  }
}

export default PasswordForm;
