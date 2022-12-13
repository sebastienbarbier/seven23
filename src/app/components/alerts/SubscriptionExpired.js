import React from "react";
import { useNavigate } from "react-router-dom";

import { Alert, AlertTitle } from '@mui/material';
import Button from "@mui/material/Button";

export default function SubscriptionExpired(props) {

  const navigate = useNavigate();

  return (
    <Alert
      severity="error"
      action={
        <Button
          color="inherit"
          onClick={() => navigate('/settings/subscription/')}
          size="small"
        >
          Renew
        </Button>
      }
    >
      <AlertTitle>Subscription expired</AlertTitle>
      Your subscription has expired. You can still read your data but sync has been disabled.
    </Alert>
  );
}