import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Link } from "react-router-dom";

import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";

import UserActions from "../../actions/UserActions";

const styles = {
  title: {
    marginBottom: "50px"
  },
  container: {
    textAlign: "center",
    width: "100%",
    maxWidth: 360,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40
  },
  container2: {
    textAlign: "center",
    maxWidth: "400px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    height: "100%"
  },
  connect: {
    margin: "20px 0px 0px 0px"
  },
  signin: {
    margin: "12px 0px 0px 0px"
  },
  serverButton: {
    marginBottom: " 1px",
    textTransform: "lowercase",
    display: "flex",
    justifyContent: "space-between",
    textAlign: "left"
  },
  serverButtonContent: {
    whitespace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  cardContent: {
    display: "flex",
    flex: "100%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 0,
    paddingBottom: 0,
    overflow: "auto",
    width: "100%"
  }
};

class LoginForm extends Component {
  constructor(props, context) {
    super(props, context);
    this.props = props;
    this.state = {
      loading: false,
      error: {},
      username: "",
      password: "",
      nextPathname: props.location.state
        ? props.location.state.nextPathname
        : "/"
    };
  }

  handleChangeUsername = event => {
    this.setState({ username: event.target.value });
  };

  handleChangePassword = event => {
    this.setState({ password: event.target.value });
  };

  handleSubmit = e => {
    e.preventDefault();

    // Start animation during login process
    this.setState({
      loading: true
    });

    // Send login action
    const { dispatch } = this.props;

    dispatch(UserActions.fetchToken(this.state.username, this.state.password))
      .then(() => {
        return dispatch(UserActions.login());
      })
      .then(() => {
        this.props.history.push("/");
      })
      .catch(error => {
        if (error) {
          this.setState({
            loading: false,
            error: {
              non_field_errors: error.response.data.non_field_errors,
              username: error.response.data.username,
              password: error.response.data.password
            }
          });
        } else {
          console.error(error);
        }
      });
  };

  render() {
    const { server } = this.props;
    const { non_field_errors } = this.state.error;
    return (
      <div style={styles.container}>
        <form onSubmit={e => this.handleSubmit(e)} style={styles.container2}>
          <header></header>
          <div>
            <h1 style={styles.title}>
              Welcome {server.isBack ? "back " : ""}!
            </h1>
            <TextField
              label="Username"
              margin="normal"
              fullWidth
              disabled={this.state.loading}
              value={this.state.username}
              error={Boolean(this.state.error.username)}
              helperText={this.state.error.username}
              onChange={this.handleChangeUsername}
            />
            <br />
            <TextField
              label="Password"
              type="password"
              margin="normal"
              fullWidth
              disabled={this.state.loading}
              value={this.state.password}
              error={Boolean(this.state.error.password)}
              helperText={this.state.error.password}
              onChange={this.handleChangePassword}
            />
            <br />
            <p>
              <Link to="/forgotpassword">Forgotten password ?</Link>
            </p>
            <br />
            {non_field_errors ? (
              <p style={{ color: "red" }}>{non_field_errors}</p>
            ) : (
              ""
            )}
          </div>
          <div style={styles.connect}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={this.state.loading}
            >
              Login
            </Button>
            {server.url && server.allow_account_creation ? (
              <p style={styles.signin}>
                or{" "}
                <Link to="/signup">
                  <Button>Sign up</Button>
                </Link>
              </p>
            ) : (
              ""
            )}
          </div>
        </form>
        <Link to="/server" style={{ width: "100%" }}>
          <Button fullWidth style={styles.serverButton}>
            <span style={styles.serverButtonContent}>
              <small style={{ fontWeight: 300 }}>server</small>
              <br />
              {server.name}
            </span>
            <KeyboardArrowRightIcon />
          </Button>
        </Link>
      </div>
    );
  }
}

LoginForm.propTypes = {
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired
};

const mapStateToProps = (state, ownProps) => {
  return {
    server: state.server
  };
};

export default withRouter(connect(mapStateToProps)(LoginForm));
