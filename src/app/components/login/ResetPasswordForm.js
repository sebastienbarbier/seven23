import axios from "axios";
import md5 from "blueimp-md5";
import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { Link } from "react-router-dom";

import UserActions from "../../actions/UserActions";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";
import ActionCheckCircle from "@material-ui/icons/CheckCircle";
import LinearProgress from "@material-ui/core/LinearProgress";

const styles = {
  actions: {
    textAlign: "right"
  },
  fullWidth: {
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

class ForgottenPasswordForm extends Component {
  constructor(props, context) {
    super(props, context);
    this.router = context.router;
    this.dispatch = this.props.dispatch;
    this.state = {
      loading: false,
      uid: this.props.location.search
        .slice(1)
        .split("&")[0]
        .split("=")[1],
      token: this.props.location.search
        .slice(1)
        .split("&")[1]
        .split("=")[1],
      username: this.props.location.search
        .slice(1)
        .split("&")[2]
        .split("=")[1],
      new_password1: "",
      new_password2: "",
      newCipher: "",
      oldCipher: "",
      decrypted: false,
      done: false,
      error: {}
    };
  }

  handleSaveChange = e => {
    e.preventDefault();

    this.setState({
      loading: true,
      error: {}
    });

    let that = this;

    axios({
      url: "/api/v1/rest-auth/password/reset/confirm/",
      method: "post",
      data: {
        uid: this.state.uid,
        token: this.state.token,
        new_password1: this.state.new_password1,
        new_password2: this.state.new_password2
      }
    })
      .then(response => {
        this.dispatch(
          UserActions.fetchToken(
            this.state.username,
            this.state.new_password1,
            true
          )
        )
          .then(token => {
            that.setState({
              token,
              newCipher: md5(this.state.new_password1),
              loading: false,
              done: true
            });
          })
          .catch(_ => {
            that.setState({
              loading: false
            });
          });
      })
      .catch(function(ex) {
        that.setState({
          loading: false,
          error: {
            email: "An error occured and prevented the email to be send."
          }
        });
      });
  };

  decrypt = () => {
    this.setState({ isEncrypting: true });
    this.dispatch(
      UserActions.updateServerEncryption(
        this.state.token,
        this.state.newCipher,
        this.state.oldCipher
      )
    )
      .then(() => {
        this.setState({ isEncrypting: false, decrypted: true });
      })
      .catch(() => {
        this.setState({ isEncrypting: false, decrypted: false });
      });
  };

  handlePassword1 = event => {
    this.setState({ new_password1: event.target.value });
  };

  handlePassword2 = event => {
    this.setState({ new_password2: event.target.value });
  };

  handleOldCipher = event => {
    this.setState({ oldCipher: event.target.value });
  };

  render() {
    return (
      <form onSubmit={this.handleSaveChange}>
        <h2>Reset password</h2>
        <div>
          {this.state.isEncrypting ? (
            <div>
              <p>Decrypting</p>
              <LinearProgress style={styles.fullWidth} />
            </div>
          ) : (
            ""
          )}
          {!this.state.isEncrypting &&
          this.state.done &&
          this.state.decrypted ? (
            <div>
              <p>
                All done, you can now access you account as usual threw the
                login page.
              </p>
            </div>
          ) : (
            ""
          )}
          {!this.state.isEncrypting &&
          this.state.done &&
          !this.state.decrypted ? (
            <div>
              <p>
                <ActionCheckCircle style={styles.icon} /> Password has
                successfuly been modified.
              </p>
              <p>
                We now need to decrypt your data and re-encrypt them with your
                new password. We need you to provide us your encryption key
                which we asked you to save when creating your account:
              </p>
              <TextField
                label="Recovery encryption key"
                type="text"
                style={styles.fullWidth}
                value={this.state.oldCipher}
                error={Boolean(this.state.error.oldCipher)}
                helperText={this.state.error.oldCipher}
                onChange={this.handleOldCipher}
                margin="normal"
                fullWidth
              />
            </div>
          ) : (
            ""
          )}
          {!this.isEncrypting && !this.state.done && !this.state.decrypted ? (
            <div>
              <TextField
                label="New password"
                type="password"
                style={styles.fullWidth}
                value={this.state.new_password1}
                error={Boolean(this.state.error.new_password1)}
                helperText={this.state.error.new_password1}
                onChange={this.handlePassword1}
                margin="normal"
                fullWidth
              />
              <TextField
                label="Repeat new password"
                type="password"
                style={styles.fullWidth}
                value={this.state.new_password2}
                error={Boolean(this.state.error.new_password2)}
                helperText={this.state.error.new_password2}
                onChange={this.handlePassword2}
                margin="normal"
                fullWidth
              />
            </div>
          ) : (
            ""
          )}
        </div>
        <div style={styles.actions}>
          {this.state.done &&
          this.state.decrypted &&
          !this.state.isEncrypting ? (
            <div>
              <Link to="/login">
                <Button>Try to login</Button>
              </Link>
            </div>
          ) : (
            ""
          )}
          {this.state.done &&
          !this.state.decrypted &&
          !this.state.isEncrypting ? (
            <div>
              <Button onClick={this.decrypt}>Decrypt your data</Button>
            </div>
          ) : (
            ""
          )}
          {!this.state.done && !this.state.decrypted ? (
            <div>
              {this.state.loading ? (
                <CircularProgress size={20} style={styles.loading} />
              ) : (
                <Button type="submit" disabled={this.state.done}>
                  Reset password
                </Button>
              )}
            </div>
          ) : (
            ""
          )}
        </div>
      </form>
    );
  }
}

ForgottenPasswordForm.propTypes = {
  dispatch: PropTypes.func.isRequired
};

export default connect()(ForgottenPasswordForm);
