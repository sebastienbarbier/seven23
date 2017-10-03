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

 class ProfileForm extends Component {

   constructor(props, context) {
     super(props, context);
    // Set default values
     this.state = {
       profile: null,
       id: null,
       username: null,
       email: null,
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

   handleUsernameChange = (event) => {
     this.setState({
       username: event.target.value,
     });
   };

   handleEmailChange = (event) => {
     this.setState({
       email: event.target.value,
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
       username: this.state.username,
       email: this.state.email,
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

     UserActions.update(user);

     if (e) {
       e.preventDefault();
     }
   };

   componentWillReceiveProps(nextProps) {
     this.setState({
       profile: nextProps.profile,
       username: nextProps.profile.username,
       email: nextProps.profile.email,
       open: nextProps.open,
       loading: false,
       error: {}, // error messages in form from WS
     });
   }

   render() {
     return (
      <Dialog
          title='Edit Profile'
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
              floatingLabelText="Email"
              onChange={this.handleEmailChange}
              defaultValue={this.state.email}
              style={{width: '100%'}}
              errorText={this.state.error.email}
            />
          </form>
        }
      </Dialog>
     );
   }
}

 export default ProfileForm;
