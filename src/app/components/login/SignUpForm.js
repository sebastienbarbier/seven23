import axios from "axios";

import { makeStyles } from "@mui/styles";
import { useLocation, Link } from "react-router-dom";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import md5 from "blueimp-md5";


import Container from "@mui/material/Container";
import withStyles from '@mui/styles/withStyles';

import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

// Import for Password field
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';

import MobileStepper from "@mui/material/MobileStepper";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import VerifiedUser from "@mui/icons-material/VerifiedUser";
import Announcement from "@mui/icons-material/Announcement";
import Check from "@mui/icons-material/Check";

import PasswordField from '../forms/PasswordField'
import UserActions from "../../actions/UserActions";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    flex: "100%",
    width: "100%",
    overflow: "hidden"
  },
  form: {
    flexGrow: 1,
    overflow: "hidden",
    display: "flex",
    height: "100%"
  },
  mobileStepper: {
    width: "100%",
    background: "none"
  },
  title: {
    fontSize: "2.3em"
  }
});

export default function SignUpForm(props) {
  const classes = useStyles();

  const [values, setValues] = useState({
    showPassword: false,
  });

  const dispatch = useDispatch();
  const location = useLocation();
  const server = useSelector(state => state.server);

  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = 3;

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

      <header className="layout_header">
        <Container className="layout_header_top_bar">
          <h2>Sign up</h2>
        </Container>
      </header>
      <main className="layout_content">
        <div className="content">
          <div className={classes.form}>
            
            {activeStep === 0 && <form onSubmit={handleNext}>
                <Container>
                  <div>
                    {isLoading ? (
                      <div>
                        <CircularProgress size={80} />
                      </div>
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
              <Container style={{ overflow: "auto" }}>
                <h2 className={classes.title}>Backup your encryption key</h2>
                <p>
                  Because of end to end encryption, your data are encrypted using
                  a key generated from your password.
                </p>
                <p>
                  This ensure that the host can not access your data, and guaranty
                  your privacy 😎. However, if you forget or lose your password,
                  this mean you can no longer decrypt your data and lose
                  everything.
                </p>
                <p>
                  To avoid this, here is the encryption key used to store your
                  data. You should save it somewhere and it will be needed to
                  recover your data.
                </p>
                <p>
                  <strong>Encryption key : </strong>
                  <code>{md5(password1)}</code>
                </p>
                <p>
                  Do not share this with anyone, and make sure it is safely
                  stored.
                </p>
              </Container>
            }
            {activeStep === 2 &&
              <Container style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ flexGrow: 1, overflow: "auto" }}>
                  <h2 className={classes.title}>Thank you !</h2>
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
          </div>
        </div>
      </main>
      <footer className="layout_footer">
        <MobileStepper
          steps={maxSteps}
          position="static"
          activeStep={activeStep}
          className={classes.mobileStepper}
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