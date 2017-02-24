/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import axios from 'axios';
import React, {Component} from 'react';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import CircularProgress from 'material-ui/CircularProgress';

import auth from './auth';
import storage from './storage';

const styles = {
  container: {
    minHeight: '100%',
    position: 'relative',
  },
  title: {
    textAlign: 'left',
  },
};

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: '#2b3d51',
    accent1Color: '#2b3d51',
  },
});

class Main extends Component {

  constructor(props, context) {
    super(props, context);
    this.context = context;
    this.state = {
      loading: true,
    };
  }

  componentWillMount() {

    if (!localStorage.getItem('server')) {
      localStorage.setItem('server', 'django723e.herokuapp.com');
    }

    axios.defaults.baseURL = localStorage.getItem('server');

    var component = this;
    // connect storage to indexedDB
    storage.connectIndexedDB().then(() => {
      if (auth.loggedIn() && !auth.isInitialize()) {
        console.log('Initialization starting');
        auth.initialize().then(() => {
          component.setState({
            loading: false,
          });
        });
      } else {
        component.setState({
          loading: false
        });
      }
    }).catch((exception) => {
      console.error(exception);
    });
  }

  componentWillUnmount() {

  }

  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        {this.state.loading ?
          <div className="flexboxContainer">
            <div className="flexbox">
              <CircularProgress size={80} />
            </div>
          </div>
          :
          <div style={styles.container}>
            {this.props.children}
          </div>
        }
      </MuiThemeProvider>
    );
  }
}

// Inject router in context
Main.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default Main;
