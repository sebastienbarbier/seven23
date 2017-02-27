import axios from 'axios';
import React, {Component} from 'react';
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
      uid: this.props.location.query.uid,
      token: this.props.location.query.token,
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
      <Card>
        <CardTitle title='Reset password' subtitle='Reset your account with a new password.' />
        <CardText expandable={false}>
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
        </CardText>
        <CardActions style={styles.actions}>
          { this.state.done ?
            <div>
              <Link to='/login'><FlatButton label='Close' tabIndex={3}/></Link>
            </div>
            :
            <div>
              { this.state.loading ?
                <CircularProgress size={20} style={styles.loading} /> :
                <FlatButton onTouchTap={this.handleSaveChange} type='submit' label='Reset password' tabIndex={2} disabled={this.state.done} />
              }
            </div>
          }

        </CardActions>
      </Card>
    );
  }
}

// Inject router in context
ForgottenPasswordForm.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default ForgottenPasswordForm;
