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

class UserNameForm extends Component {
  constructor(props, context) {
    super(props, context);
    // Set default values
    this.state = {
      username: props.username,
      loading: false,
      onSubmit: props.onSubmit,
      onClose: props.onClose,
      error: {}, // error messages in form from WS
    };
  }

  handleFirstnameChange = event => {
    this.setState({
      username: event.target.value,
    });
  };

  save = e => {

    if (e) { e.preventDefault(); }

    this.setState({
      error: {},
      loading: true,
    });

    const { username } = this.state;
    const { dispatch } = this.props;

    dispatch(UserActions.update({ username }))
      .then(() => {
        this.props.onSubmit();
      })
      .catch((error) => {
        if (error && error['username']) {
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
      <form onSubmit={this.save} className="content">
        <header>
          <h2 style={{ color: 'white' }}>Username</h2>
        </header>
        {this.state.loading ? <LinearProgress mode="indeterminate" /> : ''}
        <div className="form">
          <TextField
            label="Username"
            onChange={this.handleFirstnameChange}
            disabled={this.state.loading}
            defaultValue={this.state.username}
            error={Boolean(this.state.error.username)}
            helperText={this.state.error.username}
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
    );
  }
}

UserNameForm.propTypes = {
  dispatch: PropTypes.func.isRequired,
  username: PropTypes.string.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    username: state.user.profile.username,
  };
};

export default connect(mapStateToProps)(UserNameForm);