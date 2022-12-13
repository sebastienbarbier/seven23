import React from "react";
import { useDispatch } from "react-redux";

import { Alert, AlertTitle } from '@mui/material';
import Button from "@mui/material/Button";

import AppActions from "../../actions/AppActions";

export default function NewVersionAvailable(props) {

  const dispatch = useDispatch()

  return (
    <Alert
      severity="success"
      action={
        <Button
          color="inherit"
          onClick={() => dispatch(AppActions.reload())}
          size="small"
        >
          Update
        </Button>
      }
    >
      <AlertTitle>New version available</AlertTitle>
      An update has just been installed and is now available on
      your device.
    </Alert>
  );
}