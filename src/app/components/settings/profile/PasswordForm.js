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

export default function PasswordForm({ onSubmit, onClose }) {
  const dispatch = useDispatch();
  const [error, setError] = useState({});

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const accounts = useSelector(state => state.accounts.remote);

  const [loading, setLoading] = useState(false);

  const handleOldPasswordChange = event => {
    setOldPassword(event.target.value);
  };

  const handleNewPasswordChange = event => {
    setNewPassword(event.target.value);
  };

  const handleRepeatNewPasswordChange = event => {
    setRepeatPassword(event.target.value);
  };

  const save = e => {
    if (e) {
      e.preventDefault();
    }

    if (newPassword !== repeatPassword) {
      setError({
        newPassword: "Not the same as your second try",
        repeatPassword: "Not the same as your first try"
      });
      setLoading(false);
    } else {
      setError({});
      setLoading(true);

      let user = {
        old_password: oldPassword,
        new_password1: newPassword,
        new_password2: repeatPassword
      };

      dispatch(UserActions.changePassword(user))
        .then(args => {
          setLoading(false);
          onSubmit();
        })
        .catch(error => {
          if (
            error &&
            (error["new_password1"] ||
              error["new_password2"] ||
              error["old_password"])
          ) {
            setError(error);
            setLoading(false);
          }
        });
    }
  };

  return (
    <form onSubmit={save} className="content">
      <header>
        <h2 style={{ color: "white" }}>Password</h2>
      </header>
      {loading ? <LinearProgress mode="indeterminate" /> : ""}
      <div className="form">
        <TextField
          label="Old password"
          type="password"
          onChange={handleOldPasswordChange}
          value={oldPassword}
          style={{ width: "100%" }}
          error={Boolean(error.old_password)}
          helperText={error.old_password}
          disabled={loading}
          margin="normal"
        />
        <br />
        <TextField
          label="New password"
          type="password"
          onChange={handleNewPasswordChange}
          value={newPassword}
          style={{ width: "100%" }}
          error={Boolean(error.new_password1)}
          helperText={error.new_password1}
          disabled={loading}
          margin="normal"
        />
        <br />
        <TextField
          label="Please repeat new password"
          type="password"
          onChange={handleRepeatNewPasswordChange}
          value={repeatPassword}
          style={{ width: "100%" }}
          error={Boolean(error.new_password2)}
          helperText={error.new_password2}
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
          Submit
        </Button>
      </footer>
    </form>
  );
}
