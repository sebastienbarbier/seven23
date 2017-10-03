import axios from 'axios';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router';

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
    color: 'green',
    verticalAlign: 'middle',
  }
};

class ForgottenPasswordForm extends Component {

  constructor(props, context) {
    super(props, context);
    this.router = context.router;

    this.state = {
      loading: false,
      email: '',
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
      url: '/api/v1/rest-auth/password/reset/',
      method: 'post',
      data: {
        email: this.state.email,
        origin: window.location.href.split(this.router.location.pathname)[0],
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

  handleChangeEmail = (event) => {
    this.setState({ email: event.target.value });
  };

  render() {
    return (
      <Card>
        <CardTitle title="Forgotten password" subtitle="We can send an email with a temporary link to reset your password." />
        <CardText expandable={false}>
          { this.state.done ?
            <div>
              <p><ActionCheckCircle style={styles.icon} /> An email has been send.</p>
            </div>
            :
            <TextField
              floatingLabelText="Email address"
              value={this.state.email}
              style={styles.urlField}
              disabled={this.state.loading}
              errorText={this.state.error.email}
              onChange={this.handleChangeEmail}
              autoFocus={true}
              tabIndex={1}
            />
          }
        </CardText>
        <CardActions style={styles.actions}>
          { this.state.done ?
            <div>
              <Link to="/login"><FlatButton label="Close" tabIndex={3}/></Link>
            </div>
            :
            <div>
              { this.state.loading ?
                <CircularProgress size={20} style={styles.loading} /> :
                <FlatButton onTouchTap={this.handleSaveChange} type="submit" label="Send request" tabIndex={2} disabled={this.state.done} />
              }
            </div>
          }

        </CardActions>
      </Card>
    );
  }
}

export default ForgottenPasswordForm;
