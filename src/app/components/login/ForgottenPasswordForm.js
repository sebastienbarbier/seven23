import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from 'react-router-dom';

import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import useRouteTitle from "../../hooks/useRouteTitle";

import ModalLayoutComponent from '../layout/ModalLayoutComponent';

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
  const titleObject = useRouteTitle();

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

  const handleCancel = () => {
    if (props.onClose) {
      props.onClose();
    } else {
      navigate('/login');
    }
  }

  return (
    <ModalLayoutComponent
      title={ titleObject.title }
      content={<>
        <main>
          <Container sx={{ marginTop: 2 }}>
            {done ? (
              <div style={{ paddingTop: 18 }}>
                <Alert severity="success">
                  <AlertTitle>An email has been sent.</AlertTitle>
                  <p>We have sent you an email with a link to reset your password. In order to migrate your data, please have your previous encryption key ready. This key will be required in order to successfully migrate your data to the new password.</p>
                </Alert>
              </div>
            ) : (
              <form onSubmit={handleSaveChange}>
                <Stack direction='column' spacing={2}>
                  <p>
                    We can send an email with a temporary link to reset your password.
                  </p>
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
                  <Button
                    variant="contained"
                    disableElevation
                    color="primary"
                    onClick={() => handleSaveChange()}
                    disabled={!email || done}>
                    Send email
                  </Button>
                </Stack>
              </form>
            )}
          </Container>
        </main>
      </>}
      footer={<>
        <Stack direction='row' spacing={2} style={{ justifyContent: 'space-between'}}>
          <Button color='inherit' onClick={() => handleCancel()}>Cancel</Button>
        </Stack>
      </>}
    />
  );
}