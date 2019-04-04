// CheckoutForm.js
import React from 'react';
import { connect } from 'react-redux';
import { injectStripe, StripeProvider, Elements, CardElement } from 'react-stripe-elements';

import Button from '@material-ui/core/Button';

import UserActions from '../../../actions/UserActions';

class CheckoutForm extends React.Component {

  constructor () {
    super();

    this.state = {
      disabled: Boolean(typeof StripeCheckout === 'undefined')
    };
  }

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

  handleChange = (res) => {
    this.setState({
      complete: res.complete
    });
  };

  componentDidMount() {

    const { dispatch, products } = this.props;
    if (typeof StripeCheckout !== 'undefined') {
      var handler = StripeCheckout.configure({
        key: 'pk_test_CSOinVQkYDyHH5SohltMEzAV',
        image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
        locale: 'auto',
        token: function(token) {
          const coupon_id = undefined;
          const product_id = products[0].pk;
          console.log(products, product_id);
          // You can access the token ID with `token.id`.
          // Get the token ID to your server-side code for use.
          dispatch(UserActions.pay(token.id, product_id, coupon_id)).then((result) => {
            console.log('success', result);
          }).catch((exception) => {
            console.log('error', exception);
          });
        }
      });

      document.getElementById('customButton').addEventListener('click', function(e) {
        // Open Checkout with further options:
        handler.open({
          name: 'Seven23',
          description: '12 months subscription',
          currency: 'eur',
          amount: 4500
        });
        e.preventDefault();
      });

      // Close Checkout on page navigation:
      window.addEventListener('popstate', function() {
        handler.close();
      });
    }
  }

  render() {
    const { products } = this.props;
    const { disabled } = this.state;
    return (
      <Button id="customButton" disabled={disabled}>Purchase</Button>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    products: state.server.products,
  };
};

export default injectStripe(connect(mapStateToProps)(CheckoutForm));