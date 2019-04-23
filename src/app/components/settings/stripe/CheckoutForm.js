// CheckoutForm.js
import React from 'react';
import { connect } from 'react-redux';
import { injectStripe, StripeProvider, Elements, CardElement } from 'react-stripe-elements';

import CreditCard from '@material-ui/icons/CreditCard';
import Button from '@material-ui/core/Button';

import UserActions from '../../../actions/UserActions';
import ServerActions from '../../../actions/ServerActions';
import { Amount } from '../../currency/Amount';

class CheckoutForm extends React.Component {

  constructor (props, context) {
    super();

    this.state = {
      disabled: Boolean(typeof StripeCheckout === 'undefined'),
      price: props.price,
      duration: props.duration,
      product: props.product,
      promocode: props.promocode
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
    const that = this;
    if (typeof StripeCheckout !== 'undefined') {

      var handler = StripeCheckout.configure({
        key: 'pk_test_CSOinVQkYDyHH5SohltMEzAV',
        image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
        locale: 'auto',
        token: function(token) {

          const promocode = that.state.promocode;
          const product_id = that.state.product;
          const description = `${that.state.duration} months subscription`;
          // You can access the token ID with `token.id`.
          // Get the token ID to your server-side code for use.
          dispatch(UserActions.pay(token.id, product_id, promocode, description)).then((result) => {
            // console.log('success', result);
            dispatch(ServerActions.sync());
          }).catch((exception) => {
            console.log('error', exception);
            dispatch(ServerActions.sync());
          });
        }
      });

      document.getElementById('customButton').addEventListener('click', function(e) {
        // Open Checkout with further options:
        const description = `${that.state.duration} months subscription`;
        if (that.state.price === 0) {

          const promocode = that.state.promocode;
          const product_id = that.state.product;

          dispatch(UserActions.pay(null, product_id, promocode, description)).then((result) => {
            // console.log('success', result);
            dispatch(ServerActions.sync());
          }).catch((exception) => {
            console.log('error', exception);
            dispatch(ServerActions.sync());
          });
        } else {
          handler.open({
            name: 'Seven23',
            description: description,
            currency: 'eur',
            amount: that.state.price * 100
          });
        }
        e.preventDefault();
      });

      // Close Checkout on page navigation:
      window.addEventListener('popstate', function() {
        handler.close();
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      price: nextProps.price,
      duration: nextProps.duration,
      product: nextProps.product,
      promocode: nextProps.promocode
    });
  }

  render() {
    const { products, price, currency } = this.props;
    const { disabled } = this.state;
    return (
      <Button id="customButton" variant="contained" color="primary" disabled={disabled}>Pay&nbsp;<Amount value={price} currency={currency} /></Button>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    products: state.server.products,
  };
};

export default injectStripe(connect(mapStateToProps)(CheckoutForm));