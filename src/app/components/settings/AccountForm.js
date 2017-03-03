/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
 import React, {Component} from 'react';
 import FlatButton from 'material-ui/FlatButton';
 import TextField from 'material-ui/TextField';

 import CircularProgress from 'material-ui/CircularProgress';

 import {green500, red500} from 'material-ui/styles/colors';

 import Dialog from 'material-ui/Dialog';

 import CurrencyStore from '../../stores/CurrencyStore';
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

 class ProfileForm extends Component {

   constructor(props, context) {
     super(props, context);
    // Set default values
     this.state = {
       account: null,
       name: null,
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

   handleNameChange = (event) => {
     this.setState({
       name: event.target.value,
     });
   };

   handleSubmit = () => {
     this.setState({
       open: false,
       loading: false,
     });
   };

   handleCloseForm = () => {
     this.setState({
       open: false,
     });
   };

   save = (e) => {

     let component = this;

     component.setState({
       error: {},
       loading: true,
     });

     let account = {
       id: this.state.account ? this.state.account.id : '',
       name: this.state.name,
       currency: '',
     };

     if (this.state.account) {
      account.currency = this.state.account.currency;
     } else {
      account.currency = CurrencyStore.getSelectedCurrency();
     }

     AccountStore.onceChangeListener((args) => {
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

     if (this.state.account) {
      AccountActions.update(account);
     } else {
      AccountActions.create(account);
     }

     if (e) {
       e.preventDefault();
     }
   };

   componentWillReceiveProps(nextProps) {
     this.setState({
       account: nextProps.account,
       name: nextProps.account ? nextProps.account.name : '',
       open: nextProps.open,
       loading: false,
       error: {}, // error messages in form from WS
     });
   }

   render() {
     return (
      <Dialog
          title='Account'
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
              floatingLabelText="Name"
              onChange={this.handleNameChange}
              defaultValue={this.state.name}
              style={{width: '100%'}}
              errorText={this.state.error.name}
            />
          </form>
        }
      </Dialog>
     );
  }
}

 export default ProfileForm;
