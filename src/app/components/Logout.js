
/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
 import React, {Component} from 'react';
 import { Router } from 'react-router';

 import UserActions from '../actions/UserActions';
 import UserStore from '../stores/UserStore';

 class Logout extends Component {

  constructor(props, context) {
    super(props, context);
    this.context = context;
  }

  componentWillMount() {

    var component = this;

    UserStore.onceChangeListener(() => {
      component.context.router.replace('/login');
    });

    UserActions.logout();
  }

  render() {
    return (
      <div></div>
    );
  }

}

// Inject router in context
Logout.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default Logout;
