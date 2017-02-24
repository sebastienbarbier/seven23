import axios from 'axios';
import React, {Component} from 'react';
import {Link} from 'react-router';

import {Card, CardText, CardTitle, CardActions} from 'material-ui/Card';
import TextField from 'material-ui/TextField';
import CircularProgress from 'material-ui/CircularProgress';
import FlatButton from 'material-ui/FlatButton';

import UserActions from '../../actions/UserActions';
import UserStore from '../../stores/UserStore';

const styles = {
  actions: {
    textAlign: 'right',
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
  }
};

class CreateAccountForm extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      username: '',
      email: '',
      password: '',
      repeatpassword: '',
      loading: false,
      error: {}
    };
  }

  handleChangeUsername = (event) => {
    this.setState({
      username: event.target.value,
    });
  };

  handleChangeEmail = (event) => {
    this.setState({
      email: event.target.value,
    });
  };

  handleChangePassword = (event) => {
    this.setState({
      password: event.target.value,
    });
  };

  handleChangeRepeatPassword = (event) => {
    this.setState({
      repeatpassword: event.target.value,
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();

    if (this.state.password !== this.state.repeatpassword) {
      this.setState({
        error: {
          password: 'Should be the same as repeat password field',
          repeatpassword: 'Should be the same as password field'
        }
      });
    }

    let self = this;

    axios({
      url: '/api/v1/rest-auth/registration/',
      method: 'POST',
      data: {
        username: this.state.username,
        email: this.state.email,
        password1: this.state.password,
        password2: this.state.repeatpassword
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
        UserActions.login(self.state.username, self.state.password);
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
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <Card>
          <CardTitle title="Create new account" subtitle="Welcome on 723e !" />
          <CardText expandable={false} style={styles.cardText}>
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
                style={styles.input}
                value={this.state.password}
                errorText={this.state.error.password}
                onChange={this.handleChangePassword}
                tabIndex={3}
              />
            <TextField
                floatingLabelText="Repeat password"
                type="password"
                style={styles.input}
                value={this.state.repeatpassword}
                errorText={this.state.error.repeatpassword}
                onChange={this.handleChangeRepeatPassword}
                tabIndex={4}
              />
          </CardText>
          <CardActions style={styles.actions}>
            <Link to="/login"><FlatButton label="Cancel" tabIndex={7}/></Link>
            { this.state.loading ?
              <CircularProgress size={20} style={styles.loading} /> :
              <FlatButton onTouchTap={this.handleSaveChange} type="submit" label="Create account" tabIndex={6} />
            }
          </CardActions>
        </Card>
      </form>
    );
  }
}

// Inject router in context
CreateAccountForm.contextTypes = {
  router: React.PropTypes.object.isRequired
};


export default CreateAccountForm;
