// CheckoutForm.js

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

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

export default function CheckoutForm({
  stripe,
  price,
  duration,
  product,
  promocode,
  currency
}) {
  const dispatch = useDispatch();
  const products = useSelector(state => state.server.products);
  const stripe_key = useSelector(state => state.server.stripe_key);

  const [disabled, setDisabled] = useState(true);
  const [complete, setComplete] = useState(null);

  useEffect(() => {
    if (typeof StripeCheckout !== "undefined") {
      var handler = StripeCheckout.configure({
        key: stripe_key,
        image: "https://stripe.com/img/documentation/checkout/marketplace.png",
        locale: "auto",
        token: function(token) {
          const product_id = product;
          const description = `${duration} months subscription`;
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
          const description = `${duration} months subscription`;
          if (price === 0) {
            const product_id = product;

            dispatch(UserActions.pay(null, product_id, promocode, description))
              .then(result => {
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
              amount: price * 100
            });
          }
          e.preventDefault();
        });

      // Close Checkout on page navigation:
      window.addEventListener("popstate", function() {
        handler.close();
      });
    }
  }, [stripe]);

  useEffect(() => {
    setDisabled(!Boolean(stripe));
  }, [stripe]);

  const handleChange = res => {
    setComplete(res.complete);
  };

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
