// CheckoutForm.js

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import axios from "axios";
import CreditCard from "@material-ui/icons/CreditCard";
import Button from "@material-ui/core/Button";

import UserActions from "../../../actions/UserActions";
import ServerActions from "../../../actions/ServerActions";
import { Amount } from "../../currency/Amount";
import { loadStripe } from "@stripe/stripe-js";

export default function CheckoutForm({
  stripe,
  price,
  duration,
  product,
  promocode,
  currency,
  onSubmit,
}) {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.server.products);
  const stripe_key = useSelector((state) => state.server.stripe_key);
  const token = useSelector((state) => state.user.token);
  const email = useSelector((state) => state.user.email);

  const [disabled, setDisabled] = useState(false);
  const [complete, setComplete] = useState(null);

  const fetchCheckoutSession = async () => {
    const res = await axios({
      url: "/api/v1/stripe/session",
      method: "GET",
      headers: {
        Authorization: "Token " + token,
      },
      params: {
        product_id: product,
        coupon_code: promocode,
        success_url: window.location.href,
        cancel_url: window.location.href,
      },
    });
    return res.data;
  };

  const handleClick = async (event) => {
    setDisabled(true);
    const stripePromise = loadStripe(stripe_key);
    // Call your backend to create the Checkout session.
    const payload = await fetchCheckoutSession();

    if (payload.session_id) {
      // When the customer clicks on the button, redirect them to Checkout.
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: payload.session_id.id,
      });
      // If `redirectToCheckout` fails due to a browser or network
      // error, display the localized error message to your customer
      // using `error.message`.
      if (error) {
        console.error(error);
      }
      setDisabled(false);
    } else {
      if (onSubmit) {
        onSubmit();
      }
      setDisabled(false);
    }
  };

  return (
    <Button
      id="customButton"
      variant="contained"
      color="primary"
      disabled={disabled}
      onClick={handleClick}
    >
      Pay&nbsp;
      <Amount value={price} currency={currency} />
    </Button>
  );
}
