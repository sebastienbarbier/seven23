import axios from 'axios';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import {Card, CardActions, CardTitle, CardText} from 'material-ui/Card';
import CircularProgress from 'material-ui/CircularProgress';
import ActionCheckCircle from 'material-ui/svg-icons/action/check-circle';

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
    color: 'white',
    verticalAlign: 'middle',
  }
};

class ForgottenPasswordForm extends Component {

  constructor(props, context) {
    super(props, context);
    this.router = context.router;
    this.state = {
      loading: false,
      uid: this.props.location.search.slice(1).split('&')[0].split('=')[1],
      token: this.props.location.search.slice(1).split('&')[1].split('=')[1],
      new_password1: '',
      new_password2: '',
      done: false,
      error: {},
    };
  }

  handleSaveChange = (e) => {
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
      }
    })
    .then((response) => {
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

  handlePassword1 = (event) => {
    this.setState({ new_password1: event.target.value });
  };

  handlePassword2 = (event) => {
    this.setState({ new_password2: event.target.value });
  };

  render() {
    return (
      <form onSubmit={this.handleSaveChange} style={{color: 'white'}}>
        <h2>Reset password</h2>
        <div>
          { this.state.done ?
            <div>
              <p><ActionCheckCircle style={styles.icon} /> Password has successfuly been modified.</p>
            </div>
            :
            <div>
              <TextField
                  floatingLabelText="New password"
                  type="password"
                  style={styles.urlField}
                  value={this.state.new_password1}
                  errorText={this.state.error.new_password1}
                  onChange={this.handlePassword1}
                  tabIndex={1}
                />
              <TextField
                  floatingLabelText="Repeat new password"
                  type="password"
                  style={styles.urlField}
                  value={this.state.new_password2}
                  errorText={this.state.error.new_password2}
                  onChange={this.handlePassword2}
                  tabIndex={2}
                />
            </div>
          }
        </div>
        <div style={styles.actions}>
          { this.state.done ?
            <div>
              <Link to='/login'><FlatButton label='Try to login' tabIndex={3}/></Link>
            </div>
            :
            <div>
              { this.state.loading ?
                <CircularProgress size={20} style={styles.loading} /> :
                <FlatButton type='submit' label='Reset password' tabIndex={2} disabled={this.state.done} />
              }
            </div>
          }

        </div>
      </form>
    );
  }
}

export default ForgottenPasswordForm;
