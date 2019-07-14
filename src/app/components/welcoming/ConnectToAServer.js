import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";

import Edit from "@material-ui/icons/Edit";
import Close from "@material-ui/icons/Close";

import UserActions from "../../actions/UserActions";
import { useRouter } from "../../router";

import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";

export default function ConnectToAServer(props) {
  const dispatch = useDispatch();
  const { history } = useRouter();
  const server = useSelector(state => state.server);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);

  const non_field_errors = error["non_field_errors"];

  const handleSubmit = event => {
    if (event) {
      event.preventDefault();
    }

    setLoading(true);

    dispatch(UserActions.fetchToken(username, password))
      .then(res => {
        return dispatch(UserActions.login());
      })
      .then(res => {
        setLoading(false);
        if (props.connectOnly) {
          props.onClose();
        } else {
          props.setStep("CREATE_ACCOUNT");
          history.push("/");
        }
      })
      .catch(error => {
        console.error(error);
        if (error && error.response && error.response.data) {
          setLoading(false);
          setError({
            non_field_errors: error.response.data.non_field_errors,
            username: error.response.data.username,
            password: error.response.data.password
          });
        } else {
          console.error(error);
        }
      });
  };

  return (
    <div className="welcoming__layout">
      <header>
        <h2>Login</h2>
      </header>
      <div className="content">
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            margin="normal"
            fullWidth
            disabled={loading}
            value={username}
            error={Boolean(error.username)}
            helperText={error.username}
            onChange={event => setUsername(event.target.value)}
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
            onChange={event => setPassword(event.target.value)}
          />
          <br />
          <Button
            variant="contained"
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
        <Button
          fullWidth
          disabled={loading}
          onClick={() => props.setStep("SERVER_FORM")}
          className="serverButton"
        >
          <span className="text">
            <small style={{ fontWeight: 300 }}>server</small>
            <br />
            {server.name}
          </span>
          <KeyboardArrowRightIcon />
        </Button>
        <br />
        {non_field_errors ? (
          <p style={{ color: "red" }}>{non_field_errors}</p>
        ) : (
          ""
        )}
      </div>
      <footer className="spaceBetween">
        {props.connectOnly ? (
          <Button disabled={loading} onClick={() => props.onClose()}>
            Close
          </Button>
        ) : (
          <Button
            disabled={loading}
            onClick={() => props.setStep("SELECT_MODE")}
          >
            Cancel
          </Button>
        )}

        <div>
          <Button
            disabled={loading}
            onClick={() => props.setStep("FORGOTTEN_PASSWORD")}
          >
            Forgotten password ?
          </Button>
          <Button disabled={loading} onClick={() => props.setStep("SIGNIN")}>
            Signin
          </Button>
        </div>
      </footer>
    </div>
  );
}
