import React from "react";
import { useNavigate } from "react-router-dom";

import { Alert, AlertTitle } from '@mui/material';
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

export default function MigrateToCloud(props) {

  const navigate = useNavigate();

  return (
    <Alert
      severity="info"
      id="cy_migrate_alert"
    >
      <AlertTitle>Migrate your account</AlertTitle>
      <p>This account is currently ony available on your device. Migrate it to the cloud so it can be synced and saved for you.</p>
      <Stack direction="row-reverse" spacing={2}>
        <Button
          color="inherit"
          onClick={() => navigate('/settings/accounts/')}
          size="small"
        >
          Migrate now
        </Button>
      </Stack>
    </Alert>
  );
}