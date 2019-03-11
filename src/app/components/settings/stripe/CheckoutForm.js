// CheckoutForm.js
import React from 'react';
import { injectStripe, StripeProvider, Elements, CardElement } from 'react-stripe-elements';

import Button from '@material-ui/core/Button';

class CheckoutForm extends React.Component {
  handleSubmit = (ev) => {
    // We don't want to let default form submission happen here, which would refresh the page.
    ev.preventDefault();

    // Within the context of `Elements`, this call to createToken knows which Element to
    // tokenize, since there's only one in this group.
    this.props.stripe.createToken({name: 'Jenny Rosen'}).then(({token}) => {
      console.log('Received Stripe token:', token);
    });

    // However, this line of code will do the same thing:
    //
    // this.props.stripe.createToken({type: 'card', name: 'Jenny Rosen'});

    // You can also use createSource to create Sources. See our Sources
    // documentation for more: https://stripe.com/docs/stripe-js/reference#stripe-create-source
    //
    // this.props.stripe.createSource({type: 'card', owner: {
    //   name: 'Jenny Rosen'
    // }});
  };

  handleChange = (res) {
    console.log(res);
  };

  componentDidMount() {

  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <CardElement on={this.handleChange}/>
        <Button>Confirm order</Button>
      </form>
    );
  }
}

export default injectStripe(CheckoutForm);