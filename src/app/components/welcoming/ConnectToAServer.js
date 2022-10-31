import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from 'react-router-dom';

import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";

import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";

import Edit from "@mui/icons-material/Edit";
import Close from "@mui/icons-material/Close";

import UserActions from "../../actions/UserActions";

import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

export default function ConnectToAServer(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const server = useSelector((state) => state.server);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);

  const non_field_errors = error["non_field_errors"];

  const handleSubmit = (event) => {
    if (event) {
      event.preventDefault();
    }

    setLoading(true);

    dispatch(UserActions.fetchToken(username, password))
      .then((res) => {
        return dispatch(UserActions.login());
      })
      .then((res) => {
        setLoading(false);
        if (props.connectOnly) {
          props.onClose();
        } else {
          navigate("/dashboard");
        }
      })
      .catch((error) => {
        if (error && error.response && error.response.data) {
          setLoading(false);
          setError({
            non_field_errors: error.response.data.non_field_errors,
            username: error.response.data.username,
            password: error.response.data.password,
          });
        } else {
          setLoading(false);
          setError({
            non_field_errors: "An error occured",
          });
        }
      });
  };

  return (
    <div className="layout dashboard mobile">
      <header className="layout_header">
        <Container className="layout_header_top_bar">
          <h2>Login</h2>
        </Container>
      </header>
      <main className="layout_content">
        <Container>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Username"
              margin="normal"
              fullWidth
              disabled={loading}
              value={username}
              error={Boolean(error.username)}
              helperText={error.username}
              onChange={(event) => setUsername(event.target.value)}
            />
            <br />
            <TextField
              label="Password"
              type="password"
              margin="normal"
              fullWidth
              disabled={loading}
              value={password}
              error={Boolean(error.password)}
              helperText={error.password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <br />
            <Button
              variant="contained"
              disableElevation
              color="primary"
              fullWidth
              disabled={loading}
              type="submit"
              style={{ margin: "8px 0" }}
            >
              Login
            </Button>
            <br />
          </form>
          <Link to="/server"><Button
            fullWidth
            disabled={loading}
            color='inherit'
            onClick={() => props.setStep("SERVER_FORM")}
            className="serverButton"
          >
            <span className="text">
              <small style={{ fontWeight: 300 }}>server</small>
              <br />
              {server.name}
            </span>
            <KeyboardArrowRightIcon />
          </Button></Link>
          <br />
          {non_field_errors ? (
            <p style={{ color: "red" }}>{non_field_errors}</p>
          ) : (
            ""
          )}
        </Container>
      </main>
      <footer className="layout_footer">
        <Container>
          <Stack direction='row' spacing={2} style={{ justifyContent: 'space-between'}}>
              
          {props.connectOnly ? (
            <Button disabled={loading} onClick={() => props.onClose()}>
              Close
            </Button>
          ) : (
            <Link to="/select-account-type">
              <Button
                disabled={loading}
                color='inherit'
              >
                Cancel
              </Button>
            </Link>
          )}

          <div>
            <Link to="/password/reset"><Button
              disabled={loading}
              color='inherit'
              onClick={() => props.setStep("FORGOTTEN_PASSWORD")}
            >
              Forgotten password ?
            </Button></Link>
          </div>

          </Stack>
        </Container>
      </footer>
    </div>
  );
}