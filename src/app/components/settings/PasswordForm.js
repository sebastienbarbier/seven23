/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
 import React, {Component} from 'react';
import PropTypes from 'prop-types';
 import FlatButton from 'material-ui/FlatButton';
 import TextField from 'material-ui/TextField';

 import CircularProgress from 'material-ui/CircularProgress';

 import {green500, red500} from 'material-ui/styles/colors';

 import Dialog from 'material-ui/Dialog';
 import UserStore from '../../stores/UserStore';
 import UserActions from '../../actions/UserActions';

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

 class PasswordForm extends Component {

   constructor(props, context) {
     super(props, context);
    // Set default values
     this.state = {
       id: null,
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
        onTouchTap={this.handleCloseForm}
      />,
       <FlatButton
        label="Submit"
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

   handleOldPasswordChange = (event) => {
     this.setState({
       oldPassword: event.target.value,
     });
   };

   handleNewPasswordChange = (event) => {
     this.setState({
       newPassword: event.target.value,
     });
   };

   handleRepeatNewPasswordChange = (event) => {
     this.setState({
       repeatPassword: event.target.value,
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
     if (this.state.newPassword !== this.state.repeatPassword) {
       component.setState({
         error: {
           'newPassword': 'Not the same as your second try',
           'repeatPassword': 'Not the same as your first try',
         },
         loading: false,
       });
     } else {

      component.setState({
        error: {},
        loading: true,
      });

      let user = {
        "old_password": this.state.oldPassword,
        "new_password1": this.state.newPassword,
        "new_password2": this.state.repeatPassword
      };

       UserStore.onceChangeListener((args) => {
         if (args) {
           if (args.id) {
             this.handleSubmit();
           } else {
             component.setState({
               error: args,
               loading: false,
             });
           }
         } else {
           this.handleSubmit();
         }
       });

       UserActions.changePassword(user);

     }

     if (e) {
       e.preventDefault();
     }
   };

   componentWillReceiveProps(nextProps) {
     this.setState({
       open: nextProps.open,
       loading: false,
       error: {}, // error messages in form from WS
     });
   }

   render() {
     return (
      <Dialog
          title='Change password'
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
          <form onSubmit={this.save}>
            <TextField
              floatingLabelText="Old password"
              type="password"
              onChange={this.handleOldPasswordChange}
              defaultValue={this.state.oldPassword}
              style={{width: '100%'}}
              errorText={this.state.error.oldPassword}
            /><br/>
            <TextField
              floatingLabelText="New password"
              type="password"
              onChange={this.handleNewPasswordChange}
              defaultValue={this.state.newPassword}
              style={{width: '100%'}}
              errorText={this.state.error.newPassword}
            /><br/>
            <TextField
              floatingLabelText="Please repeat new password"
              type="password"
              onChange={this.handleRepeatNewPasswordChange}
              defaultValue={this.state.repeatPassword}
              style={{width: '100%'}}
              errorText={this.state.error.repeatPassword}
            /><br/>
          </form>
        }
      </Dialog>
     );
   }
}

 export default PasswordForm;
