import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import StorageIcon from '@material-ui/icons/Storage';

import ServerActions from '../../actions/ServerActions';

const styles = {
  container: {
    textAlign: 'center',
  },
  connect: {
    margin: '20px 0px 0px 0px',
  },
};

class ServerForm extends Component {
  constructor(props, context) {
    super(props, context);
    this.context = context;
    this.location = props.location;
    this.state = {
      loading: false,
      error: {},
      username: '',
      password: '',
      nextPathname: props.location.state
        ? props.location.state.nextPathname
        : '/',
    };

    // Send login action
    const { dispatch } = this.props;

    dispatch(ServerActions.disconnect());
  }

  // Event on input typing
  handleChangeUrl = event => {
    this.setState({
      inputUrl: event.target.value,
    });
  };

  handleSubmit = e => {
    e.preventDefault();

    // Start animation during login process
    this.setState({
      loading: true,
    });

    const { dispatch, history } = this.props;

    let url = this.state.inputUrl;

    if (url.startsWith('localhost')) {
      url = `http://${url}`;
    } else if (url.startsWith('http://localhost')) {
      // Do nothing
    } else if (url.startsWith('http://')) {
      url = url.replace('http://', 'https://');
    } else if (!url.startsWith('https://')) {
      url = `https://${url}`;
    }

    // Connect to server
    dispatch(ServerActions.connect(url)).then(() => {
      history.push('/');
    }).catch((exception) => {

      console.log(exception);
      // TO BE DEFINED
      this.setState({
        loading: true,
        url: null,
        inputUrl: url,
        loading: false,
        connected: false,
        error: {
          url: exception.message,
        },
      });
    });

  };

  render() {
    const { server } =  this.props;
    return (
      <div>
        <div style={styles.container}>
          <form
              onSubmit={this.handleSubmit}
            >
            <Button
              disabled={!server.url || !this.state.connected}
              style={{ marginBottom: ' 1px' }}
              className="storageIcon"
            >
              <StorageIcon />
            </Button>
            <TextField
              label="Server url"
              placeholder="https://"
              value={this.state.inputUrl}
              disabled={this.state.loading}
              error={Boolean(this.state.error.url)}
              helperText={this.state.error.url}
              onChange={this.handleChangeUrl}
            />
            <Button
              className="connectButton"
              disabled={this.state.animate}
              onClick={this.handleConnect}
            >
              Connect
            </Button>
          </form>
        </div>
      </div>
    );
  }
}


ServerForm.propTypes = {
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  server: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    server: state.server,
    user: state.user
  };
};


export default withRouter(connect(mapStateToProps)(ServerForm));
