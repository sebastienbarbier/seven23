/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import LinearProgress from "@mui/material/LinearProgress";

import UserActions from "../../../actions/UserActions";

export default function EmailForm({ onSubmit, onClose }) {
  const dispatch = useDispatch();

  const [email, setEmail] = useState(
    useSelector(state => state.user.profile.email)
  );

  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);

  const save = e => {
    if (e) {
      e.preventDefault();
    }

    setError({});
    setLoading(true);

    dispatch(UserActions.changeEmail({ email }))
      .then(() => {
        onSubmit();
        setLoading(false);
      })
      .catch(error => {
        if (error && error["email"]) {
          setError(error);
          setLoading(false);
        } else {
          setError({
            email: "An error server occured"
          });
          setLoading(false);
        }
      });
  };

  return (
    <form onSubmit={save} className="content">
      <header>
        <h2 style={{ color: "white" }}>Email</h2>
      </header>
      {loading ? <LinearProgress mode="indeterminate" /> : ""}
      <div className="form">
        <TextField
          label="Email"
          onChange={event => setEmail(event.target.value)}
          disabled={loading}
          defaultValue={email}
          error={Boolean(error.email)}
          helperText={error.email}
          fullWidth
          margin="normal"
          variant="standard"
        />
      </div>
      <footer>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          style={{ marginLeft: "8px" }}
        >
          Submit
        </Button>
      </footer>
    </form>
  );
}