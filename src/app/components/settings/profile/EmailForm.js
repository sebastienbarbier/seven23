/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import LinearProgress from '@material-ui/core/LinearProgress';

import UserActions from '../../../actions/UserActions';

class EmailForm extends Component {
  constructor(props, context) {
    super(props, context);
    // Set default values
    this.state = {
      email: props.email,
      loading: false,
      onSubmit: props.onSubmit,
      onClose: props.onClose,
      error: {}, // error messages in form from WS
    };
  }

  handleEmailChange = event => {
    this.setState({
      email: event.target.value,
    });
  };

  save = e => {

    if (e) { e.preventDefault(); }

    this.setState({
      error: {},
      loading: true,
    });

    const { email } = this.state;
    const { dispatch } = this.props;

    dispatch(UserActions.changeEmail({ email }))
      .then(() => {
        this.props.onSubmit();
      })
      .catch((error) => {
        if (error && error['email']) {
          this.setState({
            error: error,
            loading: false,
          });
        }
      });
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.email !== nextProps.email) {
      nextProps.onSubmit();
    } else {
      this.setState({
        loading: false,
        onSubmit: nextProps.onSubmit,
        onClose: nextProps.onClose,
        error: {}, // error messages in form from WS
      });
    }
  }

  componentDidMount() {
  }

  render() {
    const { onClose } = this.state;
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
              error={Boolean(this.state.error.email)}
              helperText={this.state.error.email}
              fullWidth
              margin="normal"
            />
          </div>
          <footer>
            <Button onClick={onClose} >Cancel</Button>
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

EmailForm.propTypes = {
  dispatch: PropTypes.func.isRequired,
  email: PropTypes.string.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    email: state.user.profile.email,
  };
};

export default connect(mapStateToProps)(EmailForm);
