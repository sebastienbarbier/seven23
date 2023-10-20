import axios from "axios";

import { useLocation, Link } from "react-router-dom";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import md5 from "blueimp-md5";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

import MobileStepper from "@mui/material/MobileStepper";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import VerifiedUser from "@mui/icons-material/VerifiedUser";
import Announcement from "@mui/icons-material/Announcement";
import Check from "@mui/icons-material/Check";

import PasswordField from '../forms/PasswordField';
import UserActions from "../../actions/UserActions";
import useRouteTitle from "../../hooks/useRouteTitle";

const CSS_LOADING_ANIMATION = {
  position: 'absolute',
  background: 'rgba(255, 255, 255, 0.5)',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 999,
};

const CSS_TITLE = {
  fontSize: "2.3em"
};

export default function SignUpForm(props) {

  const [values, setValues] = useState({
    showPassword: false,
  });

  const dispatch = useDispatch();
  const location = useLocation();
  const titleObject = useRouteTitle();
  const server = useSelector(state => state.server);

  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = 2;

  const [error, setError] = useState({});

  const [isLoading, setLoading] = useState(false);
  const [termsandconditions, setTermsandconditions] = useState(false);

  const [first_name, setFirst_name] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");

  // Manage footer
  let nextIsDisabled = false;
  nextIsDisabled = activeStep === maxSteps - 1 ? true : nextIsDisabled;
  nextIsDisabled = activeStep === 0 && !username ? true : nextIsDisabled;
  nextIsDisabled = activeStep === 0 && !email ? true : nextIsDisabled;
  nextIsDisabled = activeStep === 0 && !password1 ? true : nextIsDisabled;
  nextIsDisabled = activeStep === 0 && !password2 ? true : nextIsDisabled;
  nextIsDisabled = isLoading ? true : nextIsDisabled;

  let backtIsDisabled = false;
  backtIsDisabled = isLoading ? true : backtIsDisabled;
  backtIsDisabled = activeStep === 0 ? true : backtIsDisabled;
  backtIsDisabled = activeStep === maxSteps - 1 ? true : backtIsDisabled;
  backtIsDisabled = activeStep === 3 ? true : backtIsDisabled;

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleNext = event => {
    if (event) {
      event.preventDefault();
    }
    if (activeStep === 0) {

      if (password1 != password2) {
        setError({
          password2: "The two password fields didn't match.",
        });
        return;
      }
      setLoading(true);

      dispatch(
        UserActions.create(
          username,
          first_name,
          email,
          password1,
          password2,
          window.location.href.split(location.pathname)[0]
        )
      )
        .then(() => {
          setActiveStep(activeStep + 1);
          setLoading(false);
        })
        .catch(exception => {
          let error = {};

          if (exception.response.data.field) {
            error[exception.response.data.field] =
              exception.response.data.errorMsg;
          } else {
            Object.keys(exception.response.data).forEach(key => {
              error[key] = exception.response.data[key][0];
            });
          }

          setError(error);
          setLoading(false);
        });
    } else {
      setActiveStep(activeStep + 1);
    }
  };

  const handleLogin = () => {
    props.onLogin();
  };

  const handleCancel = () => {
    props.onClose();
  };

  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleClickShowPassword = () => {
    setValues({
      ...values,
      showPassword: !values.showPassword,
    });
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <div className="layout dashboard mobile">
      <header className="layout_header showDesktop">
        <Container className="layout_header_top_bar">
          <h2>Sign up</h2>
        </Container>
      </header>
      <main className="layout_content">
        <div className="content">
          <Box sx={{
              flexGrow: 1,
              overflow: "hidden",
              display: "flex",
              height: "100%"
            }}>
            {activeStep === 0 && <form onSubmit={handleNext}>
                <Container>
                  <div>
                    {isLoading ? (
                      <Box sx={CSS_LOADING_ANIMATION}>
                        <CircularProgress size={80} />
                      </Box>
                    ) : (
                      ""
                    )}
                    <TextField
                      label="Username"
                      value={username}
                      error={Boolean(error.username)}
                      helperText={error.username}
                      onChange={event => setUsername(event.target.value)}
                      autoFocus={true}
                      margin="normal"
                      inputProps={{
                        form: {
                          autocomplete: 'off',
                        },
                      }}
                      fullWidth
                      disabled={isLoading}
                    />
                    <TextField
                      label="Firstname (optional)"
                      value={first_name}
                      error={Boolean(error.first_name)}
                      helperText={error.first_name}
                      onChange={event => setFirst_name(event.target.value)}
                      margin="normal"
                      inputProps={{
                        form: {
                          autocomplete: 'off',
                        },
                      }}
                      fullWidth
                      disabled={isLoading}
                    />
                    <TextField
                      label="Email"
                      value={email}
                      error={Boolean(error.email)}
                      helperText={error.email}
                      onChange={event => setEmail(event.target.value)}
                      margin="normal"
                      inputProps={{
                        form: {
                          autocomplete: 'off',
                        },
                      }}
                      fullWidth
                      disabled={isLoading}
                    />
                     <PasswordField
                      label="Password"
                      value={password1}
                      error={Boolean(error.password1)}
                      helperText={error.password1 || `Password must be a minimum of 6 characters.`}
                      onChange={event => setPassword1(event.target.value)}
                      fullWidth
                      disabled={isLoading}
                    />
                    <PasswordField
                      label="Repeat password"
                      value={password2}
                      error={Boolean(error.password2)}
                      helperText={error.password2}
                      onChange={event => setPassword2(event.target.value)}
                      fullWidth
                      disabled={isLoading}
                    />
                    <br />
                    <input type="submit" style={{ display: "none" }} />
                  </div>
                </Container>
              </form>
            }
            {activeStep === 1 &&
              <Container style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ flexGrow: 1, overflow: "auto" }}>
                  <h2 sx={CSS_TITLE}>Thank you !</h2>
                  <p>Your account has been successfully created 👍.</p>
                </div>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={() => handleLogin()}
                >
                  Login now
                </Button>
              </Container>
            }
          </Box>
        </div>
      </main>
      <footer className="layout_footer">
        <MobileStepper
          steps={maxSteps}
          position="static"
          activeStep={activeStep}
          sx={{
            width: "100%",
            background: "none"
          }}
          nextButton={
            <Button
              size="small"
              color='inherit'
              onClick={event => handleNext(event)}
              disabled={nextIsDisabled}
            >
              Next
              <KeyboardArrowRight />
            </Button>
          }
          backButton={
            activeStep != 0 ? (
              <Button
                size="small"
                color='inherit'
                onClick={handleBack}
                disabled={backtIsDisabled}
              >
                <KeyboardArrowLeft />
                Back
              </Button>
            ) : (
              <Button 
                color='inherit' 
                size="small" 
                onClick={() => handleCancel()}>
                Cancel
              </Button>
            )
          }
        />
      </footer>
    </div>
  );
}