/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

import UserActions from "../../../actions/UserActions";

import Container from "@mui/material/Container";
import ModalLayoutComponent from "../../layout/ModalLayoutComponent";

export default function EmailForm({ onSubmit, onClose }) {
  const dispatch = useDispatch();

  const [email, setEmail] = useState(
    useSelector((state) => state.user.profile.email)
  );

  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);

  const save = (e) => {
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
      .catch((error) => {
        if (error && error["email"]) {
          setError(error);
          setLoading(false);
        } else {
          setError({
            email: "An error server occured",
          });
          setLoading(false);
        }
      });
  };

  return (
    <ModalLayoutComponent
      title={"Email"}
      isLoading={loading}
      content={
        <>
          <Container>
            <form onSubmit={save}>
              <div className="form">
                <TextField
                  label="Email"
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={loading}
                  defaultValue={email}
                  error={Boolean(error.email)}
                  helperText={error.email}
                  fullWidth
                  margin="normal"
                />
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
              onClick={save}
              disableElevation
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
