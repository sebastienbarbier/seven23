import axios from 'axios';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router';

import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import {Card, CardActions, CardTitle, CardText} from 'material-ui/Card';
import CircularProgress from 'material-ui/CircularProgress';

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
  }
};

class ServerForm extends Component {

  constructor(props, context) {
    super(props, context);
    this.router = context.router;
    this.state = {
      loading: false,
      url: localStorage.getItem('server'),
      error: {},
    };
  }

  handleSaveChange = (e) => {
    e.preventDefault();

    let url = this.state.url;

    if (url.indexOf('localhost') === 0){
      url = 'http://' + url;
    } else if (url.indexOf('http://') === 0){
      url = 'https://' + url.replace('http://', '');
    } else if (url.indexOf('https://') === -1){
      url = 'https://' + url;
    }

    this.setState({
      loading: true,
      url: url,
      error: {},
    });

    let that = this;

    axios({
      url: url + '/api/init',
      method: 'get',
    })
    .then((response) => {
      localStorage.setItem('server', url);
      axios.defaults.baseURL = url;
      that.router.replace('/login');
    })
    .catch(function(ex) {
      that.setState({
        loading: false,
        error: {
          url: 'Connection could be performed with provided url.',
        },
      });
    });
  };

  handleChangeUrl = (event) => {
    this.setState({url: event.target.value});
  };

  render() {
    return (
      <form onSubmit={e => this.handleSaveChange(e)} >
        <Card>
          <CardTitle title="Server" subtitle="Define a custom URL to access your self-hosted instance of seven23." />
          <CardText expandable={false}>
              <TextField
                floatingLabelText="Server url"
                hintText="https://"
                value={this.state.url}
                style={styles.urlField}
                disabled={this.state.loading}
                errorText={this.state.error.url}
                onChange={this.handleChangeUrl}
                autoFocus={true}
                tabIndex={1}
              />
          </CardText>
          <CardActions style={styles.actions}>
            { this.state.loading ?
              <CircularProgress size={20} style={styles.loading} /> :
              <FlatButton onTouchTap={this.handleSaveChange} type="submit" label="Change server" tabIndex={2} />
            }
          </CardActions>
        </Card>
      </form>
    );
  }
}

export default ServerForm;
