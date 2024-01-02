import { useNavigate } from "react-router-dom";

import { Alert, AlertTitle } from "@mui/material";

import "./alerts.scss";

export default function SubscriptionCanceled(props) {
  const navigate = useNavigate();

  return (
    <Alert severity="error" className="alerts">
      <AlertTitle>Subscription canceled</AlertTitle>
      Your subscription has been canceled and will expire{" "}
      {props.valid_until_moment && props.valid_until_moment.fromNow()}.
    </Alert>
  );
}
