import React from "react";
import { useNavigate } from "react-router-dom";

import { Alert, AlertTitle } from '@mui/material';
import Button from "@mui/material/Button";

import './alerts.scss';

export default function SubscriptionExpireSoon(props) {

  const navigate = useNavigate();

  return (
    <Alert
      severity="warning"
      className="alerts"
      action={
        !props.noAction && <Button
          color="inherit"
          onClick={() => navigate('/settings/subscription/')}
          size="small"
          sx={{ mr: 1, ml: 2, mt: 1 }}
        >
          Renew
        </Button>
      }
    >
      <AlertTitle>Subscription expiring soon</AlertTitle>
      Your subscription is about to expire { props.valid_until_moment && props.valid_until_moment.fromNow() }.
    </Alert>
  );
}