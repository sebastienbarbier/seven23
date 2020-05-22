/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "../../../router";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import LinearProgress from "@material-ui/core/LinearProgress";

import UserActions from "../../../actions/UserActions";

export default function DeleteUserForm({ onSubmit, onClose }) {
  const dispatch = useDispatch();
  const { history } = useRouter();
  const profile = useSelector((state) => state.user.profile);
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);

  let password;

  const setPassword = (event) => {
    password = event.target.value;
  };

  const deleteUserAccount = (e) => {
    if (e) {
      e.preventDefault();
    }

    setError({});
    setLoading(true);

    dispatch(UserActions.delete(password))
      .then(() => {
        setLoading(false);
        onSubmit();
        history.push("/logout");
      })
      .catch((error) => {
        if (error && error["password"]) {
          setError(error);
          setLoading(false);
        }
      });
  };

  return (
    <form onSubmit={deleteUserAccount} className="content">
      <header>
        <h2 style={{ color: "white" }}>Delete my user account</h2>
      </header>
      {loading ? <LinearProgress mode="indeterminate" /> : ""}
      <div className="form">
        <p>
          Deleting your user account <strong>{profile.username}</strong> will{" "}
          <strong>permanently</strong> erase all data from our server. You will
          not be able to recover them, this action being{" "}
          <strong>irreversible</strong>.
        </p>

        <p>Your password is required to confirm this action.</p>
        <TextField
          label="Confirm your password"
          type="password"
          onChange={setPassword}
          value={password}
          style={{ width: "100%" }}
          error={Boolean(error.password)}
          helperText={error.password}
          disabled={loading}
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
          Delete permanently
        </Button>
      </footer>
    </form>
  );
}
