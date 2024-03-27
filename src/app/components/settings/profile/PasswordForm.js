/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import { useState } from "react";
import { useDispatch } from "react-redux";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";

import UserActions from "../../../actions/UserActions";
import ModalLayoutComponent from "../../layout/ModalLayoutComponent";

export default function PasswordForm({ onSubmit, onClose }) {
  const dispatch = useDispatch();
  const [error, setError] = useState({});

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleOldPasswordChange = (event) => {
    setOldPassword(event.target.value);
  };

  const handleNewPasswordChange = (event) => {
    setNewPassword(event.target.value);
  };

  const handleRepeatNewPasswordChange = (event) => {
    setRepeatPassword(event.target.value);
  };

  const save = (e) => {
    if (e) {
      e.preventDefault();
    }

    if (newPassword !== repeatPassword) {
      setError({
        newPassword: "Not the same as your second try",
        repeatPassword: "Not the same as your first try",
      });
      setLoading(false);
    } else {
      setError({});
      setLoading(true);

      let user = {
        old_password: oldPassword,
        new_password1: newPassword,
        new_password2: repeatPassword,
      };

      dispatch(UserActions.changePassword(user))
        .then((args) => {
          setOldPassword("");
          setNewPassword("");
          setRepeatPassword("");
          setLoading(false);
          onSubmit();
        })
        .catch((error) => {
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
    <ModalLayoutComponent
      title={"password"}
      isLoading={loading}
      content={
        <>
          <Container>
            <form onSubmit={save}>
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
                <br />
                <p>
                  This might take a few minutes since it required to re-encrypt
                  all your data with the new password
                </p>
              </div>
            </form>
          </Container>
        </>
      }
      footer={
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              flexDirection: "row",
              width: "100%",
            }}
          >
            <Button color="inherit" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              disableElevation
              onClick={save}
              style={{ marginLeft: "8px" }}
            >
              Submit
            </Button>
          </Box>
        </>
      }
    />
  );
}