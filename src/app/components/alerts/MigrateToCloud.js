import React from "react";
import { useNavigate } from "react-router-dom";

import { Alert, AlertTitle } from '@mui/material';
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

import './alerts.scss';

export default function MigrateToCloud(props) {

  const navigate = useNavigate();

  return (
    <Alert
      severity="info"
      className="alerts"
      id="cy_migrate_alert"
      action={<Button
          color="inherit"
          onClick={() => navigate('/settings/accounts/')}
          sx={{ mr: 1, ml: 2, mt: 1 }}
          size="small"
        >
          Migrate now
        </Button>}
    >
      <AlertTitle>Migrate your account</AlertTitle>
      <p>This account is currently ony available on your device. Migrate it to the cloud so it can be synced and saved for you.</p>
    </Alert>
  );
}