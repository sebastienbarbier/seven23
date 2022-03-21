import "./SignUpForm.scss";
import axios from "axios";

import { makeStyles } from "@material-ui/styles";
import { useLocation } from "react-router-dom";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import md5 from "blueimp-md5";

import { withStyles } from "@material-ui/core/styles";

import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "@material-ui/core/Button";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

import MobileStepper from "@material-ui/core/MobileStepper";
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";
import VerifiedUser from "@material-ui/icons/VerifiedUser";
import Announcement from "@material-ui/icons/Announcement";
import Check from "@material-ui/icons/Check";

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

  const dispatch = useDispatch();
  const location = useLocation();
  const server = useSelector(state => state.server);

  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = 5;

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
  nextIsDisabled = activeStep === maxSteps - 1 ? true : nextIsDisabled;
  nextIsDisabled =
    activeStep === 1 && !termsandconditions ? true : nextIsDisabled;
  nextIsDisabled = activeStep === 2 && !username ? true : nextIsDisabled;
  nextIsDisabled = activeStep === 2 && !email ? true : nextIsDisabled;
  nextIsDisabled = activeStep === 2 && !password1 ? true : nextIsDisabled;
  nextIsDisabled = activeStep === 2 && !password2 ? true : nextIsDisabled;
  nextIsDisabled =
    activeStep === 2 && password1 !== password2 ? true : nextIsDisabled;
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
    if (activeStep === 2) {
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

  return (
    <div className="welcoming__layout">
      <div className="content">
        <div className={classes.form}>
          {activeStep === 0 ? (
            <div>
              <h2 className={classes.title}>Thanks for joining us&nbsp;🎉</h2>
              <p>
                You are about to create a user account on{" "}
                <code>{server.name}</code>.
              </p>

              {server.isOfficial ? (
                <div className="warning green">
                  <VerifiedUser />
                  <p>
                    This is our official instance, following our regular terms
                    and conditions.
                  </p>
                </div>
              ) : (
                <div className="warning blue">
                  <Announcement />
                  <p>
                    This is a self-hosted instance.
                    <br />
                    Please be aware the host might have redefined its own terms
                    and conditions.
                  </p>
                </div>
              )}

              {server.saas ? (
                <div>
                  <p>
                    This instance offer a{" "}
                    <strong>{server.trial_period} days trial period</strong>,
                    followed by paid subscriptions like:
                  </p>
                  <ul>
                    {server.products.map((product, index) => {
                      return (
                        <li key={index}>
                          <span>
                            <strong>{product.duration} months</strong>{" "}
                            subscription / {product.price} €
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <p>I hope you will enjoy using it.</p>
              )}
            </div>
          ) : (
            ""
          )}
          {activeStep === 1 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%"
              }}
            >
              <h2 className={classes.title}>Terms and conditions</h2>
              <p style={{ margin: 0 }}>
                Published on{" "}
                {moment(server.terms_and_conditions_date, "YYYY-MM-DD").format(
                  "MMMM Do,YYYY"
                )}
              </p>
              <div
                style={{
                  overflow: "auto",
                  margin: "20px 0",
                  padding: "5px 18px 5px 10px",
                  border: "solid 1px #DDD",
                  textAlign: "justify"
                }}
                dangerouslySetInnerHTML={{
                  __html: server.terms_and_conditions
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="agreed"
                    color="primary"
                    checked={termsandconditions}
                    onChange={(event, isChecked) =>
                      setTermsandconditions(isChecked)
                    }
                  />
                }
                label="I have read and agree with terms and conditions"
              />
            </div>
          ) : (
            ""
          )}
          {activeStep === 2 ? (
            <form onSubmit={handleNext}>
              <div>
                <h2 className={classes.title}>User details</h2>
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
                    fullWidth
                    disabled={isLoading}
                  />
                  <TextField
                    label="Password"
                    type="password"
                    value={password1}
                    error={Boolean(error.password1)}
                    helperText={error.password1}
                    onChange={event => setPassword1(event.target.value)}
                    margin="normal"
                    fullWidth
                    disabled={isLoading}
                  />
                  <TextField
                    label="Repeat password"
                    type="password"
                    value={password2}
                    error={Boolean(error.password2)}
                    helperText={error.password2}
                    onChange={event => setPassword2(event.target.value)}
                    margin="normal"
                    fullWidth
                    disabled={isLoading}
                  />
                  <br />
                  <input type="submit" style={{ display: "none" }} />
                </div>
              </div>
            </form>
          ) : (
            ""
          )}
          {activeStep === 3 ? (
            <div style={{ overflow: "auto" }}>
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
            </div>
          ) : (
            ""
          )}
          {activeStep === 4 ? (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ flexGrow: 1, overflow: "auto" }}>
                <h2 className={classes.title}>Thank you !</h2>
                <p>Your account has been successfully created 👍.</p>
              </div>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => props.setStep("CONNECT")}
              >
                Login now
              </Button>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
      <footer className="extended">
        <MobileStepper
          steps={maxSteps}
          position="static"
          activeStep={activeStep}
          className={classes.mobileStepper}
          nextButton={
            <Button
              size="small"
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
                onClick={handleBack}
                disabled={backtIsDisabled}
              >
                <KeyboardArrowLeft />
                Back
              </Button>
            ) : (
              <Button onClick={() => props.setStep("CONNECT")} size="small">
                Cancel
              </Button>
            )
          }
        />
      </footer>
    </div>
  );
}