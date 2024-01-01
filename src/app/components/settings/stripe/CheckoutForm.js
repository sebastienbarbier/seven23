// CheckoutForm.js

import { useDispatch } from "react-redux";

import Button from "@mui/material/Button";

import ServerActions from "../../../actions/ServerActions";

export default function CheckoutForm({
  product,
  label,
  selectedPrice,
  currency,
  disabled,
}) {
  const dispatch = useDispatch();

  const startSubscription = (event) => {
    dispatch(ServerActions.subscribe(selectedPrice)).then((url) => {
      // Redirect current page to url
      window.location = url;
    });
  };

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
      {label || `Start your subscription`}
    </Button>
  );
}
