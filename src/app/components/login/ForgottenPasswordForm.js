import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, Link, useNavigate } from 'react-router-dom';

import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
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
  const navigate = useNavigate();

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
    <div className="layout dashboard mobile">
      <header className="layout_header">
        <Container className="layout_header_top_bar">
          <h2>Forgotten password</h2>
        </Container>
      </header>
      <main className="layout_content">
        <Container style={{ paddingTop: 18 }}>
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
                  fullWidth
                />
              </form>
            )}
          </div>
        </Container>
      </main>
      <footer className="layout_footer">
        <Container>
          <Stack direction='row' spacing={2} style={{ justifyContent: 'space-between'}}>
            <Link to="/login"><Button color='inherit'>Cancel</Button></Link>
            <Button 
              variant="contained"
              disableElevation
              color="primary" 
              onClick={() => handleSaveChange()} 
              disabled={!email || done}>
              Send email
            </Button>
          </Stack>
        </Container>
      </footer>
    </div>
  );
}