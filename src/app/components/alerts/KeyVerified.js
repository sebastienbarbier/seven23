import { useNavigate } from "react-router-dom";

import { Alert, AlertTitle } from "@mui/material";
import Button from "@mui/material/Button";

import "./alerts.scss";

export default function KeyVerified(props) {
  const navigate = useNavigate();

  return (
    <Alert
      severity="warning"
      className="alerts"
      action={
        <Button
          color="inherit"
          onClick={() => navigate("/settings/security/")}
          size="small"
          sx={{ whiteSpace: "nowrap", mr: 1, ml: 2, mt: 1 }}
        >
          Backup now
        </Button>
      }
    >
      <AlertTitle>You need to backup your encryption key</AlertTitle>A backup of
      your encryption key will be required to access your data if you lose your
      password. Without this key, all your data will be lost.
    </Alert>
  );
}
