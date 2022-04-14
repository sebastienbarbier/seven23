// CheckoutForm.js

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import axios from "axios";
import CreditCard from "@material-ui/icons/CreditCard";
import Button from "@material-ui/core/Button";

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
}) {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.server.products);
  const url = useSelector((state) => state.server.url);
  const token = useSelector((state) => state.user.token);
  const email = useSelector((state) => state.user.email);
  const id = useSelector((state) => state.user.profile.pk);

  const [disabled, setDisabled] = useState(false);
  const [complete, setComplete] = useState(null);

  return (
    <form method="POST" action={`${url}/paid/`}>
      <Button
        id="customButton"
        variant="contained"
        color="primary"
        type="submit"
        disabled={disabled}
      >
        Pay&nbsp;
        <Amount value={price} currency={currency} />
        <input type="hidden" name="user" value={id} />
        <input type="hidden" name="url" value={window.location.href} />
      </Button>
    </form>
  );
}