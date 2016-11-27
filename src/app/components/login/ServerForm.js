import axios from 'axios';
import React, {Component} from 'react';
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
    } else if (url.indexOf('https://') == -1){
      url = 'https://' + url;
    }
    if (url.indexOf('https://') === 0 ||
        url.indexOf('http://localhost') === 0) {
      this.setState({
        loading: true,
        error: {},
      });
      let self = this;
      axios({
        url: url + '/api/init/',
        method: 'get',
      })
      .then((response) => {
        localStorage.setItem('server', self.state.url);
        self.router.replace('/login');
      })
      .catch(function(ex) {
        self.setState({
          loading: false,
          error: {
            url: 'Connection could be performed with provided url.',
          },
        });
      });
    } else {
      this.setState({
        error: {
          url: 'Connection needs to be secure, using https.',
        },
      });
    }
  };

  handleChangeUrl = (event) => {
    this.setState({url: event.target.value});
  };

  render() {
    return (
      <form onSubmit={e => this.handleSaveChange(e)} >
        <Card>
          <CardTitle title="Server" subtitle="Define a custom URL to access your self-hosted instance of 723e." />
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
            <Link to="/login"><FlatButton label="Cancel" tabIndex={3}/></Link>
            { this.state.loading ?
              <CircularProgress size={20} style={styles.loading} /> :
              <FlatButton onTouchTap={this.handleSaveChange} type="submit" label="Save" tabIndex={2} />
            }
          </CardActions>
        </Card>
      </form>
    );
  }
}

// Inject router in context
ServerForm.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default ServerForm;
