/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import Button from "@material-ui/core/Button";

import AccountActions from "../../../actions/AccountsActions";

class AccountDeleteForm extends Component {
  constructor(props, context) {
    super(props, context);
    // Set default values
    this.state = {
      account: props.account,
      onSubmit: props.onSubmit,
      onClose: props.onClose,
      loading: false,
      error: {} // error messages in form from WS
    };
  }

  handleCloseForm = () => {
    this.state.onClose();
  };

  delete = e => {
    if (e) {
      e.preventDefault();
    }
    const { dispatch, onSubmit } = this.props;

    dispatch(AccountActions.delete(this.state.account.id))
      .then(() => {
        onSubmit();
      })
      .catch(error => {
        console.error(error);
      });
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      account: nextProps.account,
      onSubmit: nextProps.onSubmit,
      onClose: nextProps.onClose,
      error: {} // error messages in form from WS
    });
  }

  render() {
    const { onClose } = this.props;
    return (
      <form onSubmit={this.delete} className="content">
        <header>
          <h2 style={{ color: "white" }}>Account</h2>
        </header>
        {this.state.loading ? <LinearProgress mode="indeterminate" /> : ""}

        <div className="form">
          <p>
            You are about to delete this account. All informations will be
            permanently lost.
          </p>
        </div>

        <footer>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            style={{ marginLeft: "8px" }}
            onClick={this.delete}
          >
            Delete this account
          </Button>
        </footer>
      </form>
    );
  }
}

AccountDeleteForm.propTypes = {
  dispatch: PropTypes.func.isRequired,
  accounts: PropTypes.array.isRequired
};

const mapStateToProps = (state, ownProps) => {
  return {
    accounts: state.user.accounts
  };
};

export default connect(mapStateToProps)(AccountDeleteForm);
