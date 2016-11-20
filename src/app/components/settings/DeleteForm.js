/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
 import React, {Component} from 'react';
 import { Router, Route, Link, browserHistory } from 'react-router';
 import {List, ListItem, makeSelectable} from 'material-ui/List';
 import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
 import FontIcon from 'material-ui/FontIcon';
 import FlatButton from 'material-ui/FlatButton';
 import TextField from 'material-ui/TextField';
 import MaterialColorPicker from 'react-material-color-picker';
 import IconButton from 'material-ui/IconButton';
 import ImageColorize from 'material-ui/svg-icons/image/colorize';
 import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';

 import CircularProgress from 'material-ui/CircularProgress';
 import SelectField from 'material-ui/SelectField';
 import MenuItem from 'material-ui/MenuItem';

 import {green500, red500} from 'material-ui/styles/colors';

 import Dialog from 'material-ui/Dialog';

 import DatePicker from 'material-ui/DatePicker';
 import moment from 'moment';

 import UserStore from '../../stores/UserStore';
 import ChangeStore from '../../stores/ChangeStore';
 import CategoryStore from '../../stores/CategoryStore';
 import CurrencyStore from '../../stores/CurrencyStore';
 import AccountStore from '../../stores/AccountStore';
 import CategoryActions from '../../actions/CategoryActions';
 import ChangeActions from '../../actions/ChangeActions';
 import UserActions from '../../actions/UserActions';

 const styles = {
  form: {
    textAlign: 'center',
    padding: '0 60px',
  },
  loading: {
    textAlign: 'center',
  },
  actions: {
    textAlign: 'right',
  },
  debit: {
    borderColor: red500,
    color: red500,
  },
  credit: {
    borderColor: green500,
    color: green500,
  },
  loading: {
    textAlign: 'center',
    padding: '50px 0',
  },
 };

 const dataSourceConfig = {
    text: 'name',
    value: 'id',
  };

 class DeleteForm extends Component {

  constructor(props, context) {
    super(props, context);
    // Set default values
    this.state = {
      profile: null,
      id: null,
      username: null,
      email: null,
      oldpassword: null,
      newPassword: null,
      repeatPassword: null,
      loading: false,
      open: false,
      error: {}, // error messages in form from WS
    };

    this.actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleCloseForm}
      />,
      <FlatButton
        label="Yes, I want to permanently delete my accound"
        primary={true}
        onTouchTap={this.save}
      />,
    ];
  }

  handleCloseForm = () => {
    this.setState({
      open: false,
    });
  };

  handleSubmit = () => {
    this.setState({
      open: false,
      loading: false,
    });
  };

  save = (e) => {
    let component = this;

    component.setState({
      error: {},
      loading: true,
    });

    let user = {
      id: this.state.profile.id,
    };

    // Logout and redirect on login page
    UserStore.onceChangeListener((args) => {
      component.context.router.replace('/login');
    });
    UserActions.delete(user);

    if (e) {
      e.preventDefault();
    }
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      profile: nextProps.profile,
      open: nextProps.open,
      loading: false,
      error: {}, // error messages in form from WS
    });
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  render() {
    return (
      <Dialog
          title='Delete account'
          actions={this.actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleCloseForm}
          autoScrollBodyContent={true}
        >
        {
          this.state.loading ?
          <div style={styles.loading}>
            <CircularProgress />
          </div>
          :
          <div>
            <p>You are about to delete your account. All informations will be permanently lost.</p>
          </div>
        }
      </Dialog>
    );
  }
}

// Inject router in context
DeleteForm.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default DeleteForm;
