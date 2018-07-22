import axios from 'axios';

import React, { Component } from 'react';
import { connect } from 'react-redux';
// import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';

import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import UserActions from '../../actions/UserActions';

import TermsAndConditionsDialog from '../legal/TermsAndConditionsDialog';

const styles = {
  actions: {
    textAlign: 'right',
  },
  floatLeft: {
    float: 'left',
    marginLeft: '10px',
  },
  input: {
    width: '100%',
    display: 'block',
  },
  cardText: {
    width: '100%',
    margin: 'auto',
    paddingTop: '0px',
    paddingBottom: '32px',
  },
  checkbox: {
    marginTop: '10px',
    marginBottom: '6px',
  },
  termsandconditions: {
    float: 'left',
    marginLeft: '10px',
  },
  loading: {
    textAlign: 'center',
    padding: '50px 0',
  },
  error: {
    color: 'red',
  },
};

class SignUpForm extends Component {
  constructor(props, context) {
    super(props, context);
    this.history = props.history;
    this.state = {
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      password1: '',
      password2: '',
      loading: false,
      open: false,
      error: {},
    };
  }

  handleChangeUsername = event => {
    this.setState({
      username: event.target.value,
      open: false,
    });
  };

  handleChangeEmail = event => {
    this.setState({
      email: event.target.value,
      open: false,
    });
  };

  handleChangePassword = event => {
    this.setState({
      password1: event.target.value,
      open: false,
    });
  };

  handleChangeRepeatPassword = event => {
    this.setState({
      password2: event.target.value,
      open: false,
    });
  };

  handleCheck = (event, isChecked) => {
    this.setState({
      termsandconditions: isChecked,
    });
  };

  handleOpen = () => {
    this.setState({
      open: true,
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    const { dispatch } = this.props;

    if (!this.state.termsandconditions) {
      this.setState({
        error: {
          termsandconditions:
            'You need to agree with our terms and conditions to signup.',
        },
      });
    } else {
      let self = this;

      axios({
        url: '/api/v1/rest-auth/registration/',
        method: 'POST',
        data: {
          username: this.state.username,
          email: this.state.email,
          password1: this.state.password1,
          password2: this.state.password2,
          origin: window.location.href.split(this.history.location.pathname)[0],
        },
      })
        .then(response => {
          localStorage.setItem('token', response.data.key);
          // Send login action
          dispatch(UserActions.login(self.state.username, self.state.password1)).then(() => {
            self.context.router.replace('/');
          }).catch((error) => {
            console.error(error);
          });
        })
        .catch(function(exception) {
          let error = {};

          if (exception.response.data.field) {
            error[exception.response.data.field] =
              exception.response.data.errorMsg;
          } else {
            Object.keys(exception.response.data).forEach(key => {
              error[key] = exception.response.data[key][0];
            });
          }
          console.log(error);
          self.setState({
            error: error,
          });
        });
    }
  };

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <div>
            <h2 style={{ fontSize: '2.3em' }}>Sign up</h2>
            <div style={styles.cardText}>
              {this.state.loading ? (
                <div style={styles.loading}>
                  <CircularProgress size={80} />
                </div>
              ) : (
                <div>
                  <TextField
                    label="Username"
                    style={styles.input}
                    value={this.state.username}
                    error={Boolean(this.state.error.username)}
                    helperText={this.state.error.username}
                    onChange={this.handleChangeUsername}
                    autoFocus={true}
                    margin="normal"
                    fullWidth
                  />
                  <TextField
                    label="Email"
                    style={styles.input}
                    value={this.state.email}
                    error={Boolean(this.state.error.email)}
                    helperText={this.state.error.email}
                    onChange={this.handleChangeEmail}
                    margin="normal"
                    fullWidth
                  />
                  <TextField
                    label="Password"
                    type="password"
                    style={styles.input}
                    value={this.state.password1}
                    error={Boolean(this.state.error.password1)}
                    helperText={this.state.error.password1}
                    onChange={this.handleChangePassword}
                    margin="normal"
                    fullWidth
                  />
                  <TextField
                    label="Repeat password"
                    type="password"
                    style={styles.input}
                    value={this.state.password2}
                    error={Boolean(this.state.error.password2)}
                    helperText={this.state.error.password2}
                    onChange={this.handleChangeRepeatPassword}
                    margin="normal"
                    fullWidth
                  />
                  <br />
                  {this.state.error.termsandconditions ? (
                    <p style={styles.error}>
                      {this.state.error.termsandconditions}
                    </p>
                  ) : (
                    ''
                  )}

                  <FormControlLabel
                    control={
                      <Checkbox
                        name="agreed"
                        onChange={this.handleCheck}
                        style={styles.checkbox}
                      />
                    }
                    label="I have read and agree with terms and conditions"
                  />
                </div>
              )}
            </div>
            <div style={styles.actions}>
              <Button onClick={this.handleOpen}>
                Terms and conditions
              </Button>
              <Link to="/login">
                <Button>Cancel</Button>
              </Link>
              {this.state.loading ? (
                <CircularProgress size={20} style={styles.loading} />
              ) : (
                <Button type="submit">
                  Sign up
                </Button>
              )}
            </div>
          </div>

          <TermsAndConditionsDialog open={Boolean(this.state.open)} />
        </form>
      </div>
    );
  }
}

SignUpForm.propTypes = {
};

const mapStateToProps = (state, ownProps) => {
  return {};
};

export default connect(mapStateToProps)(SignUpForm);
