// CheckoutForm.js
import React from "react";
import { connect } from "react-redux";
import {
  injectStripe,
  StripeProvider,
  Elements,
  CardElement
} from "react-stripe-elements";

import CreditCard from "@material-ui/icons/CreditCard";
import Button from "@material-ui/core/Button";

import UserActions from "../../../actions/UserActions";
import ServerActions from "../../../actions/ServerActions";
import { Amount } from "../../currency/Amount";

class CheckoutForm extends React.Component {
  constructor(props, context) {
    super();

    this.state = {
      disabled: Boolean(typeof StripeCheckout === "undefined"),
      price: props.price,
      duration: props.duration,
      product: props.product,
      promocode: props.promocode
    };
  }

  handleChange = res => {
    this.setState({
      complete: res.complete
    });
  };

  componentDidMount() {
    const { dispatch, stripe_key } = this.props;
    const that = this;
    if (typeof StripeCheckout !== "undefined") {
      var handler = StripeCheckout.configure({
        key: stripe_key,
        image: "https://stripe.com/img/documentation/checkout/marketplace.png",
        locale: "auto",
        token: function(token) {
          const promocode = that.state.promocode;
          const product_id = that.state.product;
          const description = `${that.state.duration} months subscription`;
          // You can access the token ID with `token.id`.
          // Get the token ID to your server-side code for use.
          dispatch(
            UserActions.pay(token.id, product_id, promocode, description)
          )
            .then(result => {
              // console.log('success', result);
              dispatch(ServerActions.sync());
            })
            .catch(exception => {
              console.log("error", exception);
              dispatch(ServerActions.sync());
            });
        }
      });

      document
        .getElementById("customButton")
        .addEventListener("click", function(e) {
          // Open Checkout with further options:
          const description = `${that.state.duration} months subscription`;
          if (that.state.price === 0) {
            const promocode = that.state.promocode;
            const product_id = that.state.product;

            dispatch(UserActions.pay(null, product_id, promocode, description))
              .then(result => {
                // console.log('success', result);
                dispatch(ServerActions.sync());
              })
              .catch(exception => {
                console.log("error", exception);
                dispatch(ServerActions.sync());
              });
          } else {
            handler.open({
              name: "Seven23",
              description: description,
              currency: "eur",
              amount: that.state.price * 100
            });
          }
          e.preventDefault();
        });

      // Close Checkout on page navigation:
      window.addEventListener("popstate", function() {
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
    const { price, currency } = this.props;
    const { disabled } = this.state;
    return (
      <Button
        id="customButton"
        variant="contained"
        color="primary"
        disabled={disabled}
      >
        Pay&nbsp;
        <Amount value={price} currency={currency} />
      </Button>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    products: state.server.products,
    stripe_key: state.server.stripe_key
  };
};

export default injectStripe(connect(mapStateToProps)(CheckoutForm));
