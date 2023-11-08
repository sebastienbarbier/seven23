import React from "react";
import { Alert, AlertTitle } from '@mui/material';

import './alerts.scss';

export default function ChangeRateUnknownAlert(props) {

  return (
    <Alert
      className="alerts"
      severity="error"
      >
        <AlertTitle>Unknown exchange rate</AlertTitle>
        Some transactions <strong>could not be converted</strong> using current selected 
        currency, and <strong>are so ignored</strong> in all calculation.<br/>To solve 
        this, <strong>add an exchange rate</strong> or switch to a <strong>different currency</strong>.
    </Alert>
  );
}