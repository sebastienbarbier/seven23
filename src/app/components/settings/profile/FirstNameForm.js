/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import LinearProgress from "@material-ui/core/LinearProgress";

import UserActions from "../../../actions/UserActions";

class FirstNameForm extends Component {
  constructor(props, context) {
    super(props, context);
    // Set default values
    this.state = {
      first_name: props.first_name,
      loading: false,
      onSubmit: props.onSubmit,
      onClose: props.onClose,
      error: {} // error messages in form from WS
    };
  }

  handleFirstnameChange = event => {
    this.setState({
      first_name: event.target.value
    });
  };

  save = e => {
    if (e) {
      e.preventDefault();
    }

    this.setState({
      error: {},
      loading: true
    });

    const { first_name } = this.state;
    const { dispatch } = this.props;

    dispatch(UserActions.update({ first_name }))
      .then(() => {
        this.props.onSubmit();
      })
      .catch(error => {
        if (error && error["first_name"]) {
          this.setState({
            error: error,
            loading: false
          });
        }
      });
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.email !== nextProps.email) {
      nextProps.onSubmit();
    } else {
      this.setState({
        loading: false,
        onSubmit: nextProps.onSubmit,
        onClose: nextProps.onClose,
        error: {} // error messages in form from WS
      });
    }
  }

  componentDidMount() {}

  render() {
    const { onClose } = this.state;
    return (
      <form onSubmit={this.save} className="content">
        <header>
          <h2 style={{ color: "white" }}>Firstname</h2>
        </header>
        {this.state.loading ? <LinearProgress mode="indeterminate" /> : ""}
        <div className="form">
          <TextField
            label="Firstname"
            onChange={this.handleFirstnameChange}
            disabled={this.state.loading}
            defaultValue={this.state.first_name}
            error={Boolean(this.state.error.first_name)}
            helperText={this.state.error.first_name}
            fullWidth
            margin="normal"
          />
        </div>
        <footer>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            style={{ marginLeft: "8px" }}
          >
            Submit
          </Button>
        </footer>
      </form>
    );
  }
}

FirstNameForm.propTypes = {
  dispatch: PropTypes.func.isRequired,
  first_name: PropTypes.string.isRequired
};

const mapStateToProps = (state, ownProps) => {
  return {
    first_name: state.user.profile.first_name
  };
};

export default connect(mapStateToProps)(FirstNameForm);
