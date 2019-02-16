import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import StorageIcon from '@material-ui/icons/Storage';

import ServerActions from '../../actions/ServerActions';

import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

const styles = {
  container: {
    textAlign: 'left',
    maxWidth: '400px',
    flex: '100%',
    overflow: 'auto',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  listItemText: {
    whitespace: 'nowrap',
    overflow: 'hidden',
    textoverflow: 'ellipsis',
  }
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

  setShortcut = (url) => {
    this.setState({
      inputUrl: url,
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    if (!this.state.inputUrl) {
      return;
    }

    // Start animation during login process
    this.setState({
      loading: true,
    });

    const { dispatch, history } = this.props;

    let url = this.state.inputUrl;

    if (url.startsWith('localhost')) {
      url = `http://${url}`;
    } else if (url.startsWith('http://192.') || url.startsWith('http://172.') || url.startsWith('http://localhost')) {
      // Do nothing
    } else if (url.startsWith('192.168.') || url.startsWith('localhost')) {
      url = `http://${url}`;
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
    const { loading } = this.state;
    return (
      <div style={styles.container}>

        <h1>Server</h1>
        <p>This application can connect different server.<br/>If you decided to self-host your
        own server this is where you can configure your application to connect.</p>
        <form
          style={styles.form}
          onSubmit={this.handleSubmit}
        >
          <TextField
            InputLabelProps={{ shrink: Boolean(this.state.inputUrl) }}
            label="Server url"
            placeholder="https://"
            value={this.state.inputUrl}
            disabled={loading}
            error={Boolean(this.state.error.url)}
            helperText={this.state.error.url}
            onChange={this.handleChangeUrl}
          />
          <br/>
          <Button
            style={{ margin: '40px 0 40px 0' }}
            fullWidth variant="contained" color="primary"
            disabled={this.state.animate}
            onClick={this.handleSubmit}
          >
            Connect
          </Button>
        </form>

        <h2>Shortcut</h2>

        <List>
          <ListItem button onClick={() => { this.setShortcut('https://seven23.sebastienbarbier.com') }}>
            <Avatar>
              <StorageIcon />
            </Avatar>
            <ListItemText primary="seven23.sebastienbarbier.com" secondary="Default server" style={ styles.listItemText } />
          </ListItem>
          <ListItem button onClick={() => { this.setShortcut('localhost:8000') }}>
            <Avatar>
              <StorageIcon />
            </Avatar>
            <ListItemText primary="localhost:8000" primaryTypographyProps={ styles.listItemText } />
          </ListItem>
        </List>

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