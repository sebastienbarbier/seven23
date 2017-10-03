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
   actions: {
     textAlign: 'right',
   },
 };

 class TermsAndConditionsDialog extends Component {

   constructor(props, context) {
     super(props, context);
    // Set default values
     this.state = {
       open: false,
     };

     this.actions = [
       <FlatButton
        label="Close"
        primary={true}
        onTouchTap={this.handleClose}
      />,
     ];
   }

   handleClose = () => {
     this.setState({
       open: false,
     });
   };

   componentWillReceiveProps(nextProps) {
     this.setState({
       open: nextProps.open,
     });
   }

   render() {
     return (
      <Dialog
          title='Terms and conditions'
          actions={this.actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
          autoScrollBodyContent={true}
        >
        <p>This project started as a side-project, but is going to quikly gain traction.</p>
        <p>Those terms and conditions are temporary, and will be updated before official launch.</p>
        <p>By agreeing, you show that you understand the fact that you will receive new terms and
        conditions to agree with. You will not be able to continue using the application
        wihtout accepting them.</p>
      </Dialog>
     );
   }
}

 export default TermsAndConditionsDialog;
