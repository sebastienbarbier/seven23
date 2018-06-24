/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';
import Button from '@material-ui/core/Button';

import AccountStore from '../../../stores/AccountStore';
import AccountActions from '../../../actions/AccountActions';

class AccountDeleteForm extends Component {
  constructor(props, context) {
    super(props, context);
    // Set default values
    this.state = {
      account: props.account,
      onSubmit: props.onSubmit,
      onClose: props.onClose,
      loading: false,
      error: {}, // error messages in form from WS
    };
  }

  handleCloseForm = () => {
    this.state.onClose();
  };

  handleSubmit = () => {
    this.state.onSubmit();
  };

  delete = e => {
    // Logout and redirect on login page
    AccountStore.onceChangeListener(args => {
      this.handleSubmit();
    });
    AccountActions.delete(this.state.account.id);

    if (e) {
      e.preventDefault();
    }
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      account: nextProps.account,
      onSubmit: nextProps.onSubmit,
      onClose: nextProps.onClose,
      error: {}, // error messages in form from WS
    });
  }

  render() {
    return (
      <div>
        {this.state.loading ? <LinearProgress mode="indeterminate" /> : ''}
        <form onSubmit={this.delete} className="content">
          <header>
            <h2 style={{ color: 'white' }}>Account</h2>
          </header>

          <div className="form">
            <p>
              You are about to delete your account. All informations will be
              permanently lost.
            </p>
          </div>

          <footer>
            <Button onClick={this.handleCloseForm} >Cancel</Button>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              style={{ marginLeft: '8px' }}
              onClick={this.delete}
            >Delete this account</Button>
          </footer>
        </form>
      </div>
    );
  }
}

export default AccountDeleteForm;
