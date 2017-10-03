/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
 import React, {Component} from 'react';
import PropTypes from 'prop-types';
 import FlatButton from 'material-ui/FlatButton';

 import CircularProgress from 'material-ui/CircularProgress';

 import {green500, red500} from 'material-ui/styles/colors';

 import Dialog from 'material-ui/Dialog';
 import AccountStore from '../../stores/AccountStore';
 import AccountActions from '../../actions/AccountActions';

 const styles = {
   form: {
     textAlign: 'center',
     padding: '0 60px',
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

 class AccountDeleteForm extends Component {

   constructor(props, context) {
     super(props, context);
    // Set default values
     this.state = {
       account: null,
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
        label="Delete this account"
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

    // Logout and redirect on login page
     AccountStore.onceChangeListener((args) => {
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
       open: nextProps.open,
       loading: false,
       error: {}, // error messages in form from WS
     });
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

 export default AccountDeleteForm;
