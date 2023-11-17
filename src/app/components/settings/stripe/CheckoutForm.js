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
  price,
  duration,
  product,
  promocode,
  currency,
  onSubmit,
  disabled
}) {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.server.products);
  const url = useSelector((state) => state.server.url);
  const token = useSelector((state) => state.user.token);
  const email = useSelector((state) => state.user.email);
  const id = useSelector((state) => state.user.profile.pk);

  const [complete, setComplete] = useState(null);

  return (
    <form method="POST" action={`${url}/paid/`}>
      <Button
        id="customButton"
        variant="contained"
        color="primary"
        type="submit"
        disableElevation
        disabled={disabled}
      >
        Start your subscription
        <input type="hidden" name="user" value={id} />
        <input type="hidden" name="url" value={window.location.href} />
      </Button>
    </form>
  );
}