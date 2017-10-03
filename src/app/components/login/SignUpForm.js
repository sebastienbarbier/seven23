import axios from 'axios';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router';

import {Card, CardText, CardTitle, CardActions} from 'material-ui/Card';
import TextField from 'material-ui/TextField';
import CircularProgress from 'material-ui/CircularProgress';
import FlatButton from 'material-ui/FlatButton';
import Checkbox from 'material-ui/Checkbox';

import UserActions from '../../actions/UserActions';
import UserStore from '../../stores/UserStore';

import TermsAndConditionsDialog from '../legal/TermsAndConditionsDialog'

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
    width: '80%',
    margin: 'auto',
    paddingTop: '0px',
    paddingBottom: '32px'
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
  }
};

class SignUpForm extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      password1: '',
      password2: '',
      termsandconditions: false,
      allow_account_creation: false,
      contact: null,
      url: axios.defaults.baseURL.replace('http://', '').replace('https://', ''),
      init: true,
      loading: false,
      open: false,
      error: {}
    };
  }

  componentWillMount() {
    const that = this;
    axios({
      url: '/api/init',
      method: 'get',
    })
    .then((response) => {
      that.setState({
        init: false,
        allow_account_creation: response.data.allow_account_creation
      });
    })
    .catch(function(ex) {

    });
  }

  handleChangeUsername = (event) => {
    this.setState({
      username: event.target.value,
      open: false,
    });
  };

  handleChangeEmail = (event) => {
    this.setState({
      email: event.target.value,
      open: false,
    });
  };

  handleChangePassword = (event) => {
    this.setState({
      password1: event.target.value,
      open: false,
    });
  };

  handleChangeRepeatPassword = (event) => {
    this.setState({
      password2: event.target.value,
      open: false,
    });
  };

  handleCheck = (event, isChecked) => {
    this.setState({
      termsandconditions: isChecked,
    });
  }

  handleOpen = () => {
    this.setState({
      open: true,
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();

    if (!this.state.termsandconditions) {
      this.setState({
        error: {
          termsandconditions: 'You need to agree with our terms and conditions to signup.',
        }
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
          password2: this.state.password2
        }
      }).then((response) => {
          localStorage.setItem('token', response.data.key);
          // Wait for login return event
          UserStore.onceChangeListener((args) => {
            if (args) {
              console.error(args);
            } else {
              self.context.router.replace('/');
            }
          });
           // Send login action
          UserActions.login(self.state.username, self.state.password1);
        }).catch(function(exception) {
          let error = {};

          if (exception.response.data.field) {
            error[exception.response.data.field] = exception.response.data.errorMsg;
          } else {
            Object.keys(exception.response.data).forEach((key) => {
              error[key] = exception.response.data[key][0];
            });
          }
          console.log(error);
          self.setState({
            error: error
          });
        });

    }
  };

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <Card>
            <CardTitle title="Sign up" />
            <CardText expandable={false} style={styles.cardText}>
            {
              this.state.init ?
              <div style={styles.loading}>
                <CircularProgress size={80} />
              </div>
              :
              <div>
                {
                  this.state.allow_account_creation ?
                  <div>
                    <TextField
                        floatingLabelText="Username"
                        style={styles.input}
                        value={this.state.username}
                        errorText={this.state.error.username}
                        onChange={this.handleChangeUsername}
                        autoFocus={true}
                        tabIndex={1}
                      />
                    <TextField
                        floatingLabelText="Email"
                        style={styles.input}
                        value={this.state.email}
                        errorText={this.state.error.email}
                        onChange={this.handleChangeEmail}
                        tabIndex={2}
                      />
                    <TextField
                        floatingLabelText="Password"
                        type="password"
                        hintText="Minimum of 6 characters."
                        style={styles.input}
                        value={this.state.password1}
                        errorText={this.state.error.password1}
                        onChange={this.handleChangePassword}
                        tabIndex={3}
                      />
                    <TextField
                        floatingLabelText="Repeat password"
                        type="password"
                        style={styles.input}
                        value={this.state.password2}
                        errorText={this.state.error.password2}
                        onChange={this.handleChangeRepeatPassword}
                        tabIndex={4}
                      /><br/>
                      { this.state.error.termsandconditions ?
                        <p style={styles.error}>{ this.state.error.termsandconditions }</p>
                        :
                        ''
                      }
                      <Checkbox
                        label="I have read and agree with terms and conditions"
                        name="agreed"
                        onCheck={this.handleCheck}
                        style={styles.checkbox}
                        tabIndex={5}
                      />
                  </div>
                  :
                  <div>
                    <p>Sorry, subscriptions are disabled for this server.<br/>
                    Please <strong>contact the administrator</strong> of { this.state.url }
                    { this.state.contact ? ' at ' + this.state.contact : '' }.</p>
                  </div>
                }
              </div>
              }
            </CardText>
            {
              this.state.init || !this.state.allow_account_creation ?
              ''
              :
              <CardActions style={styles.actions}>
                <FlatButton label="Terms and conditions" tabIndex={7} onTouchTap={this.handleOpen} />
                { this.state.loading ?
                  <CircularProgress size={20} style={styles.loading} /> :
                  <FlatButton onTouchTap={this.handleSaveChange} type="submit" label="Sign up" tabIndex={6} />
                }
              </CardActions>
            }
          </Card>

        <TermsAndConditionsDialog open={this.state.open} />
        </form>

      </div>
    );
  }
}

export default SignUpForm ;
