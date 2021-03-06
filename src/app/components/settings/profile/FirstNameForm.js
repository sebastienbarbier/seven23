/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import LinearProgress from "@material-ui/core/LinearProgress";

import UserActions from "../../../actions/UserActions";

export default function FirstNameForm({ onSubmit, onClose }) {
  const dispatch = useDispatch();

  const [firstname, setFirstname] = useState(
    useSelector(state => state.user.profile.first_name)
  );

  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);

  const save = e => {
    if (e) {
      e.preventDefault();
    }

    setError({});
    setLoading(true);

    dispatch(UserActions.update({ first_name: firstname }))
      .then(() => {
        onSubmit();
        setLoading(false);
      })
      .catch(error => {
        if (error && error["first_name"]) {
          setError(error);
          setLoading(false);
        }
      });
  };

  return (
    <form onSubmit={save} className="content">
      <header>
        <h2 style={{ color: "white" }}>Firstname</h2>
      </header>
      {loading ? <LinearProgress mode="indeterminate" /> : ""}
      <div className="form">
        <TextField
          label="Firstname"
          onChange={event => setFirstname(event.target.value)}
          disabled={loading}
          defaultValue={firstname}
          error={Boolean(error.first_name)}
          helperText={error.first_name}
          fullWidth
          margin="normal"
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
