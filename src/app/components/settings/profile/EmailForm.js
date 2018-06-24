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

class EmailForm extends Component {
  constructor(props, context) {
    super(props, context);
    // Set default values
    this.state = {
      email: UserStore.user.email,
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

  handleEmailChange = event => {
    this.setState({
      email: event.target.value,
    });
  };

  save = e => {
    if (e) {
      e.preventDefault();
    }

    let component = this;

    component.setState({
      error: {},
      loading: true,
    });

    let data = {
      email: this.state.email,
    };

    UserStore.onceChangeListener(args => {
      if (args) {
        if (args.id) {
          this.handleSubmit();
        } else {
          component.setState({
            error: args,
            loading: false,
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
            <h2 style={{ color: 'white' }}>Email</h2>
          </header>
          <div className="form">
            <TextField
              label="Email"
              onChange={this.handleEmailChange}
              disabled={this.state.loading}
              defaultValue={this.state.email}
              ref={input => {
                this.input = input;
              }}
              style={{ width: '100%' }}
              error={Boolean(this.state.error.email)}
              helperTExt={this.state.error.email}
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

export default EmailForm;
