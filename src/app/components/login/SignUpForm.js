import axios from 'axios';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import md5 from 'blueimp-md5';

import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';

import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import MobileStepper from '@material-ui/core/MobileStepper';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import VerifiedUser from '@material-ui/icons/VerifiedUser';
import Announcement from '@material-ui/icons/Announcement';
import Check from '@material-ui/icons/Check';

import UserActions from '../../actions/UserActions';


const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    flex: '100%',
    width: '100%',
    overflow: 'hidden',
  },
  form: {
    flexGrow: 1,
    overflow: 'hidden',
    display: 'flex',
  },
  mobileStepper: {
    background: 'none',
    marginTop: '10px',
  },
  title: {
    fontSize: '2.3em'
  }
});

class SignUpForm extends Component {
  constructor(props, context) {
    super(props, context);
    this.history = props.history;
    this.state = {
      first_name: '',
      username: '',
      email: '',
      password1: '',
      password2: '',
      loading: false,
      error: {},
      activeStep: 0,
      maxSteps: 5,
    };
  }

  handleChangeFirstname = event => {
    this.setState({
      first_name: event.target.value,
    });
  };

  handleChangeUsername = event => {
    this.setState({
      username: event.target.value,
    });
  };

  handleChangeEmail = event => {
    this.setState({
      email: event.target.value,
    });
  };

  handleChangePassword = event => {
    this.setState({
      password1: event.target.value,
    });
  };

  handleChangeRepeatPassword = event => {
    this.setState({
      password2: event.target.value,
    });
  };

  handleCheck = (event, isChecked) => {
    this.setState({
      termsandconditions: isChecked,
    });
  };

  handleNext = (e) => {
    if (e) { e.preventDefault(); }
    const { activeStep } = this.state;
    if (activeStep === 2) {

      this.setState({
        loading: true
      });
      const { dispatch } = this.props;
      dispatch(UserActions.create(
          this.state.username,
          this.state.first_name,
          this.state.email,
          this.state.password1,
          this.state.password2,
          window.location.href.split(this.history.location.pathname)[0]))
      .then(() => {

        this.setState({
          activeStep: this.state.activeStep + 1,
          loading: false,
        });
      })
      .catch((exception) => {
        let error = {};

        if (exception.response.data.field) {
          error[exception.response.data.field] =
            exception.response.data.errorMsg;
        } else {
          Object.keys(exception.response.data).forEach(key => {
            error[key] = exception.response.data[key][0];
          });
        }
        this.setState({
          error,
          loading: false,
        });
      });
    } else {
      this.setState({
        activeStep: activeStep + 1,
      });
    }
  };

  handleBack = () => {
    this.setState({
      activeStep: this.state.activeStep - 1,
    });
  };

  render() {
    const { classes, theme, server } = this.props;
    const { activeStep, maxSteps, termsandconditions, password1, password2, username, email, isLoading } = this.state;

    let nextIsDisabled = false;
    nextIsDisabled = activeStep === maxSteps - 1 ? true : nextIsDisabled;
    nextIsDisabled = activeStep === maxSteps - 1 ? true : nextIsDisabled;
    nextIsDisabled = activeStep === 1 && !termsandconditions ? true : nextIsDisabled;
    nextIsDisabled = activeStep === 2 && !username ? true : nextIsDisabled;
    nextIsDisabled = activeStep === 2 && !email ? true : nextIsDisabled;
    nextIsDisabled = activeStep === 2 && !password1 ? true : nextIsDisabled;
    nextIsDisabled = activeStep === 2 && !password2 ? true : nextIsDisabled;
    nextIsDisabled = activeStep === 2 && password1 !== password2 ? true : nextIsDisabled;
    nextIsDisabled = isLoading ? true : nextIsDisabled;

    let backtIsDisabled = false;
    backtIsDisabled = isLoading ? true : backtIsDisabled;
    backtIsDisabled = activeStep === 0 ? true : backtIsDisabled;
    backtIsDisabled = activeStep === maxSteps-1 ? true : backtIsDisabled;
    backtIsDisabled = activeStep === 3 ? true : backtIsDisabled;

    return (
      <div className={classes.root}>
        <div className={classes.form}>
          { activeStep === 0 ? (
            <div>
              <h2 className={classes.title}>Thanks for joining us 🎉</h2>
              <p>You are about to create a user account on <code>{ server.name }</code>.</p>

              { server.isOfficial ? (
                <div className="warning green">
                  <VerifiedUser />
                  <p>This is our official instance, following our regular terms and conditions.</p>
                </div>
              ) : (
                <div className="warning blue">
                  <Announcement />
                  <p>This is a self-hosted instance.<br/>Please be aware the host might have redefined its own terms and conditions.</p>
                </div>
              )}

              <p>I hope you will enjoy using it.</p>

            </div>
          ) : ''}
          { activeStep === 1 ? (
            <div style={{ display: 'flex', flexDirection: 'column'}}>
              <h2 className={classes.title}>Terms and conditions</h2>
              <p style={{ margin: 0 }}>
                Published on{' '}
                {moment(
                  server.terms_and_conditions_date,
                  'YYYY-MM-DD',
                ).format('MMMM Do,YYYY')}
              </p>
              <div
                style={{ overflow: 'auto', margin: '20px 0', padding: '5px 10px', border: 'solid 1px #DDD' }}
                dangerouslySetInnerHTML={{
                  __html: server.terms_and_conditions,
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="agreed"
                    color="primary"
                    checked={termsandconditions}
                    onChange={this.handleCheck}
                    style={styles.checkbox}
                  />
                }
                label="I have read and agree with terms and conditions"
              />
            </div>
          ) : ''}
          { activeStep === 2 ? (
            <form onSubmit={this.handleNext}>
              <div>
                <h2 className={classes.title}>User details</h2>
                <div>
                  { this.state.loading ? (
                    <div style={styles.loading}>
                      <CircularProgress size={80} />
                    </div>
                  ) : '' }
                  <TextField
                    label="Username"
                    style={styles.input}
                    value={this.state.username}
                    error={Boolean(this.state.error.username)}
                    helperText={this.state.error.username}
                    onChange={this.handleChangeUsername}
                    autoFocus={true}
                    margin="normal"
                    fullWidth
                    disabled={this.state.loading}
                  />
                  <TextField
                    label="Firstname (optional)"
                    style={styles.input}
                    value={this.state.first_name}
                    error={Boolean(this.state.error.first_name)}
                    helperText={this.state.error.first_name}
                    onChange={this.handleChangeFirstname}
                    margin="normal"
                    fullWidth
                    disabled={this.state.loading}
                  />
                  <TextField
                    label="Email"
                    style={styles.input}
                    value={this.state.email}
                    error={Boolean(this.state.error.email)}
                    helperText={this.state.error.email}
                    onChange={this.handleChangeEmail}
                    margin="normal"
                    fullWidth
                    disabled={this.state.loading}
                  />
                  <TextField
                    label="Password"
                    type="password"
                    style={styles.input}
                    value={this.state.password1}
                    error={Boolean(this.state.error.password1)}
                    helperText={this.state.error.password1}
                    onChange={this.handleChangePassword}
                    margin="normal"
                    fullWidth
                    disabled={this.state.loading}
                  />
                  <TextField
                    label="Repeat password"
                    type="password"
                    style={styles.input}
                    value={this.state.password2}
                    error={Boolean(this.state.error.password2)}
                    helperText={this.state.error.password2}
                    onChange={this.handleChangeRepeatPassword}
                    margin="normal"
                    fullWidth
                    disabled={this.state.loading}
                  />
                  <br />
                  <input type='submit' style={{ display: 'none' }}  />
                </div>

              </div>

            </form>
          ) : ''}
          { activeStep === 3 ? (
            <div style={{ overflow: 'auto' }}>
              <h2 className={classes.title}>Backup your encryption key</h2>
              <p>Because of end to end encryption, your data are encrypted using a key
              generated from your password.</p>
              <p>This ensure that the host can not access your data, and guaranty your privacy 😎. However,
              if you forget or lose your password, this mean you can no longer decrypt your data and lose everything.</p>
              <p>To avoid this, here is the encryption key used to store your data.
              You should save it somewhere and it will be needed to recover your data.</p>
              <p><strong>Encryption key : </strong><code>{ md5(this.state.password1) }</code></p>
              <p>Do not share this with anyone, and make sure it is safely stored.</p>
            </div>
          ) : ''}
          { activeStep === 4 ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ flexGrow: 1, overflow: 'auto' }}>
                <h2 className={classes.title}>Thank you !</h2>
                <p>Your account has been successfully created 👍.</p>
                <p>Last step is now to confirm your email address. You should receive at <code>{ this.state.email }</code> a message with a link to activate your account.</p>
              </div>
              <Link to="/login">
                <Button fullWidth variant="contained" color="primary">Back to login</Button>
              </Link>
            </div>
          ) : ''}
        </div>
        <MobileStepper
          steps={maxSteps}
          position="static"
          activeStep={activeStep}
          className={classes.mobileStepper}
          nextButton={
            <Button size="small" onClick={this.handleNext} disabled={nextIsDisabled}>
              Next
              {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
            </Button>
          }
          backButton={
            activeStep != 0 ? (
              <Button size="small" onClick={this.handleBack} disabled={backtIsDisabled}>
                {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
                Back
              </Button>
            ) : (
              <Link to="/login">
                <Button size="small">
                  Cancel
                </Button>
              </Link>
            )
          }
        />
      </div>
    );
  }
}

SignUpForm.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  server: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    server: state.server,
  };
};

export default withStyles(styles, { withTheme: true })(connect(mapStateToProps)(SignUpForm));