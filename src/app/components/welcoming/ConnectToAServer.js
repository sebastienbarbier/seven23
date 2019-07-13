import React, { useState } from "react";
import { useSelector } from "react-redux";

import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";

import Edit from "@material-ui/icons/Edit";
import Close from "@material-ui/icons/Close";

import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";

export default function ConnectToAServer(props) {
  const server = useSelector(state => state.server);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);

  const non_field_errors = error["non_field_errors"];

  return (
    <div className="welcoming__layout">
      <header>
        <h2>Login</h2>
      </header>
      <div className="content">
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
          onClick={() => props.setStep("SELECT_MODE")}
          style={{ margin: "8px 0" }}
        >
          Login
        </Button>
        <br />
        <Button
          fullWidth
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
        <Button onClick={() => props.setStep("SELECT_MODE")}>Cancel</Button>
        <div>
          <Button onClick={() => props.setStep("FORGOTTEN_PASSWORD")}>
            Forgotten password ?
          </Button>
          <Button onClick={() => props.setStep("SIGNIN")}>Signin</Button>
        </div>
      </footer>
    </div>
  );
}
