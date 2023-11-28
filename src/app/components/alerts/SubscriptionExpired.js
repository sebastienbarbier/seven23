import React from "react";
import { useNavigate } from "react-router-dom";

import { Alert, AlertTitle } from '@mui/material';
import Button from "@mui/material/Button";

import './alerts.scss';

export default function SubscriptionExpired(props) {

  const navigate = useNavigate();

  return (
    <Alert
      severity="error"
      className="alerts"
      action={
        !props.noAction && <Button
          color="inherit"
          onClick={() => navigate('/settings/subscription/')}
          size="small"
          sx={{ mr: 1, ml: 2, mt: 1 }}
        >
          Subscribe
        </Button>
      }
    >
      <AlertTitle>Subscription expired</AlertTitle>
      Your subscription has expired. You can still read your data but sync has been disabled.
    </Alert>
  );
}