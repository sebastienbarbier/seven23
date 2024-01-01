import { useDispatch } from "react-redux";

import { Alert, AlertTitle } from "@mui/material";
import Button from "@mui/material/Button";

import AppActions from "../../actions/AppActions";

import "./alerts.scss";

export default function NewVersionAvailable(props) {
  const dispatch = useDispatch();

  return (
    <Alert
      severity="success"
      className="alerts"
      action={
        <Button
          color="inherit"
          onClick={() => AppActions.reload()}
          size="small"
        >
          Update
        </Button>
      }
    >
      <AlertTitle>New version available</AlertTitle>
      An update has just been installed and is now available on your device.
    </Alert>
  );
}
