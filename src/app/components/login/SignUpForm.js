import axios from 'axios';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import PropTypes from 'prop-types';

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

import UserActions from '../../actions/UserActions';

import TermsAndConditionsDialog from '../legal/TermsAndConditionsDialog';


const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  form: {
    flexGrow: 1,
  },
  mobileStepper: {
    background: 'none'
  }
});

class SignUpForm extends Component {
  constructor(props, context) {
    super(props, context);
    this.history = props.history;
    this.state = {
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      password1: '',
      password2: '',
      loading: false,
      open: false,
      error: {},
      activeStep: 0,
      maxSteps: 4,
    };
  }

  handleChangeUsername = event => {
    this.setState({
      username: event.target.value,
      open: false,
    });
  };

  handleChangeEmail = event => {
    this.setState({
      email: event.target.value,
      open: false,
    });
  };

  handleChangePassword = event => {
    this.setState({
      password1: event.target.value,
      open: false,
    });
  };

  handleChangeRepeatPassword = event => {
    this.setState({
      password2: event.target.value,
      open: false,
    });
  };

  handleCheck = (event, isChecked) => {
    this.setState({
      termsandconditions: isChecked,
    });
  };

  handleOpen = () => {
    this.setState({
      open: true,
    });
  };

  handleNext = () => {
    this.setState({
      activeStep: this.state.activeStep + 1,
    });
  };

  handleBack = () => {
    this.setState({
      activeStep: this.state.activeStep - 1,
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    const { dispatch } = this.props;

    if (!this.state.termsandconditions) {
      this.setState({
        error: {
          termsandconditions:
            'You need to agree with our terms and conditions to signup.',
        },
      });
    } else {

      dispatch(UserActions.create(
          this.state.username,
          this.state.email,
          this.state.password1,
          this.state.password2,
          window.location.href.split(this.history.location.pathname)[0]))
      .then(() => {
        this.setState({
          loading: true
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

    }
  };

  render() {
    const { classes, theme } = this.props;
    const { activeStep, maxSteps } = this.state;
    return (
      <div className={classes.root}>
        {this.state.loading ? (
          <div className="flexboxContainer">
            <div className="flexbox">
              <CircularProgress color="primary" size={80} />
            </div>
          </div>
        ) : (
          <div className={classes.form}>
            { activeStep === 0 ? (
              <form onSubmit={this.handleSubmit}>
                <div>
                  <h2 style={{ fontSize: '2.3em' }}>Sign up</h2>
                  <div style={styles.cardText}>
                    {this.state.loading ? (
                      <div style={styles.loading}>
                        <CircularProgress size={80} />
                      </div>
                    ) : (
                      <div>
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
                        />
                        <br />
                        {this.state.error.termsandconditions ? (
                          <p style={styles.error}>
                            {this.state.error.termsandconditions}
                          </p>
                        ) : (
                          ''
                        )}
                      </div>
                    )}
                  </div>

                </div>

              </form>
            ) : ''}
            { activeStep === 1 ? (
              <div style={styles.actions}>

                <FormControlLabel
                  control={
                    <Checkbox
                      name="agreed"
                      onChange={this.handleCheck}
                      style={styles.checkbox}
                    />
                  }
                  label="I have read and agree with terms and conditions"
                />
                <Button onClick={this.handleOpen}>
                  Terms and conditions
                </Button>
                {this.state.loading ? (
                  <CircularProgress size={20} style={styles.loading} />
                ) : (
                  <Button type="submit">
                    Sign up
                  </Button>
                )}

                <TermsAndConditionsDialog open={Boolean(this.state.open)} />
              </div>
            ) : ''}
            { activeStep === 2 ? (
              <p>End to end encryption, backup key.</p>
            ) : ''}
            { activeStep === 3 ? (
              <p>Confirm your email</p>
            ) : ''}
          </div>
        )}
        <MobileStepper
          steps={maxSteps}
          position="static"
          activeStep={activeStep}
          className={classes.mobileStepper}
          nextButton={
            <Button size="small" onClick={this.handleNext} disabled={activeStep === maxSteps - 1}>
              Next
              {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
            </Button>
          }
          backButton={
            activeStep != 0 ? (
              <Button size="small" onClick={this.handleBack} disabled={activeStep === 0}>
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
};

const mapStateToProps = (state, ownProps) => {
  return {};
};

export default withStyles(styles, { withTheme: true })(connect(mapStateToProps)(SignUpForm));
