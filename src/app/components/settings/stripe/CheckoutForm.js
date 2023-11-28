// CheckoutForm.js

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import axios from "axios";
import CreditCard from "@mui/icons-material/CreditCard";
import Button from "@mui/material/Button";

import UserActions from "../../../actions/UserActions";
import ServerActions from "../../../actions/ServerActions";
import { Amount } from "../../currency/Amount";

export default function CheckoutForm({
  product,
  selectedPrice,
  currency,
  disabled,
}) {
  const dispatch = useDispatch();

  const startSubscription = (event) => {
    dispatch(ServerActions.subscribe(selectedPrice)).then(url => {
      // Redirect current page to url
      window.location = url;
    });
  }

  return (
    <Button
      id="customButton"
      variant="contained"
      color="primary"
      type="submit"
      disableElevation
      disabled={disabled}
      onClick={startSubscription}
    >
      Start your subscription
    </Button>
  );
}