import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import ActionCheckCircle from "@mui/icons-material/CheckCircle";

const styles = {
  actions: {
    textAlign: "right"
  },
  urlField: {
    width: "100%",
    marginBottom: "16px"
  },
  loading: {
    margin: "8px 20px 0px 20px"
  },
  icon: {
    width: "40px",
    height: "40px",
    marginRight: 12,
    marginTop: -5,
    marginLeft: 20,
    verticalAlign: "middle"
  }
};

export default function ForgottenPasswordForm(props) {
  const [email, setEmail] = useState("");
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState({});

  useEffect(() => {
    if (props.step == "FORGOTTEN_PASSWORD") {
      setEmail("");
      setDone(false);
      setError({});
    }
  }, [props.step]);

  const handleSaveChange = event => {
    if (event) {
      event.preventDefault();
    }

    setLoading(true);
    setError({});

    axios({
      url: "/api/v1/rest-auth/password/reset/",
      method: "post",
      data: {
        email: email,
        origin: window.location.href.split(location.pathname)[0]
      }
    })
      .then(response => {
        setLoading(false);
        setDone(true);
      })
      .catch(function(ex) {
        setLoading(false);
        setError({
          email: "An error occured and prevented the email to be send."
        });
      });
  };

  return (
    <div className="welcoming__layout">
      <header>
        <h2>Forgotten password</h2>
      </header>
      <div className="content">
        <p>
          We can send an email with a temporary link to reset your password.
        </p>
        <div>
          {done ? (
            <div>
              <p>
                <ActionCheckCircle style={styles.icon} /> An email has been
                send.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSaveChange}>
              <TextField
                label="Email address"
                value={email}
                style={styles.urlField}
                disabled={loading}
                error={Boolean(error.email)}
                helperText={error.email}
                onChange={event => setEmail(event.target.value)}
                autoFocus={true}
                margin="normal"
                variant="standard"
                fullWidth
              />
            </form>
          )}
        </div>
      </div>
      <footer className="spaceBetween">
        <Button onClick={() => props.setStep("CONNECT")}>Cancel</Button>
        <Button onClick={() => handleSaveChange()} disabled={!email || done}>
          Send email
        </Button>
      </footer>
    </div>
  );
}