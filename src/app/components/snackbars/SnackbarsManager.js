/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";

import Snackbar from "@mui/material/Snackbar";
import Button from "@mui/material/Button";

import AppActions from "../../actions/AppActions";

import './SnackbarsManager.scss';

export default function SnackbarsManager() {
  const dispatch = useDispatch();
  const snackbars = useSelector(state => state.state.snackbars);

  const [snackbar, setSnackbar] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const s = snackbars.pop();
    if (s) {
      setSnackbar(s);
      setOpen(true);
    }
  }, [snackbars]);

  const onExited = () => {
    setSnackbar(null);
    dispatch(AppActions.removeReadSnackbar());
  };

  const handleUndoButton = () => {
    if (snackbar && snackbar.onClick) {
      snackbar.onClick();
    }
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      className="snackbarManager"
      message={snackbar ? snackbar.message : ""}
      autoHideDuration={3000}
      onClose={() => setOpen(false)}
      TransitionProps={{ onExited: onExited }}
      action={
        snackbar && snackbar.onClick ? (
          <Button color="inherit" size="small" onClick={handleUndoButton}>
            {snackbar.buttonLabel ? snackbar.buttonLabel : "Undo"}
          </Button>
        ) : (
          ""
        )
      }
    />
  );
}