import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import ActionCheckCircle from '@material-ui/icons/CheckCircle';

const styles = {
  actions: {
    textAlign: 'right',
  },
  urlField: {
    width: '100%',
    marginBottom: '16px',
  },
  loading: {
    margin: '8px 20px 0px 20px',
  },
  icon: {
    width: '40px',
    height: '40px',
    marginRight: 12,
    marginTop: -5,
    marginLeft: 20,
    verticalAlign: 'middle',
  },
};

class ForgottenPasswordForm extends Component {
  constructor(props, context) {
    super(props, context);
    this.router = context.router;
    this.state = {
      loading: false,
      uid: this.props.location.search
        .slice(1)
        .split('&')[0]
        .split('=')[1],
      token: this.props.location.search
        .slice(1)
        .split('&')[1]
        .split('=')[1],
      new_password1: '',
      new_password2: '',
      done: false,
      error: {},
    };
  }

  handleSaveChange = e => {
    e.preventDefault();

    this.setState({
      loading: true,
      error: {},
    });

    let that = this;

    axios({
      url: '/api/v1/rest-auth/password/reset/confirm/',
      method: 'post',
      data: {
        uid: this.state.uid,
        token: this.state.token,
        new_password1: this.state.new_password1,
        new_password2: this.state.new_password2,
      },
    })
      .then(response => {
        that.setState({
          loading: false,
          done: true,
        });
      })
      .catch(function(ex) {
        that.setState({
          loading: false,
          error: {
            email: 'An error occured and prevented the email to be send.',
          },
        });
      });
  };

  handlePassword1 = event => {
    this.setState({ new_password1: event.target.value });
  };

  handlePassword2 = event => {
    this.setState({ new_password2: event.target.value });
  };

  render() {
    return (
      <form onSubmit={this.handleSaveChange}>
        <h2>Reset password</h2>
        <div>
          {this.state.done ? (
            <div>
              <p>
                <ActionCheckCircle style={styles.icon} /> Password has
                successfuly been modified.
              </p>
            </div>
          ) : (
            <div>
              <TextField
                label="New password"
                type="password"
                style={styles.urlField}
                value={this.state.new_password1}
                error={Boolean(this.state.error.new_password1)}
                helperText={this.state.error.new_password1}
                onChange={this.handlePassword1}
                margin="normal"
                fullWidth
              />
              <TextField
                label="Repeat new password"
                type="password"
                style={styles.urlField}
                value={this.state.new_password2}
                error={Boolean(this.state.error.new_password2)}
                helperText={this.state.error.new_password2}
                onChange={this.handlePassword2}
                margin="normal"
                fullWidth
              />
            </div>
          )}
        </div>
        <div style={styles.actions}>
          {this.state.done ? (
            <div>
              <Link to="/login">
                <Button>Try to login</Button>
              </Link>
            </div>
          ) : (
            <div>
              {this.state.loading ? (
                <CircularProgress size={20} style={styles.loading} />
              ) : (
                <Button type="submit" disabled={this.state.done}>
                  Reset password
                </Button>
              )}
            </div>
          )}
        </div>
      </form>
    );
  }
}

export default ForgottenPasswordForm;
