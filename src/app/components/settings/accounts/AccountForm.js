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

import AccountActions from "../../../actions/AccountsActions";

class AccountForm extends Component {
  constructor(props, context) {
    super(props, context);
    // Set default values
    this.state = {
      account: props.account,
      name: props.account ? props.account.name : "",
      onSubmit: props.onSubmit,
      onClose: props.onClose,
      loading: false,
      error: {} // error messages in form from WS
    };
  }

  handleNameChange = event => {
    this.setState({
      name: event.target.value
    });
  };

  handleSubmit = () => {
    this.state.onSubmit();
  };

  handleCloseForm = () => {
    this.state.onClose();
  };

  save = e => {
    if (e) {
      e.preventDefault();
    }

    this.setState({
      error: {},
      loading: true
    });

    let promise;
    const { account, name } = this.state;
    const { dispatch, selectedCurrencyId } = this.props;
    let newAccount = {
      id: account && account.id ? account.id : null,
      name: name
    };

    if (account && account.id) {
      newAccount.currency = account.currency;
      promise = dispatch(AccountActions.update(newAccount));
    } else {
      newAccount.currency = selectedCurrencyId;
      promise = dispatch(AccountActions.create(newAccount));
    }

    promise
      .then(() => {
        this.handleSubmit();
      })
      .catch(error => {
        if (error && error.name) {
          this.setState({
            error: error,
            loading: false
          });
        }
      });
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      account: nextProps.account,
      name: nextProps.account ? nextProps.account.name : "",
      onSubmit: nextProps.onSubmit,
      onClose: nextProps.onClose,
      loading: false,
      error: {} // error messages in form from WS
    });
  }

  render() {
    return (
      <form onSubmit={this.save} className="content">
        <header>
          <h2 style={{ color: "white" }}>Account</h2>
        </header>
        {this.state.loading ? <LinearProgress mode="indeterminate" /> : ""}
        <div className="form">
          <TextField
            label="Name"
            disabled={this.state.loading}
            onChange={this.handleNameChange}
            value={this.state.name}
            style={{ width: "100%" }}
            error={Boolean(this.state.error.name)}
            helperText={this.state.error.name}
            margin="normal"
          />
        </div>
        <footer>
          <Button onClick={this.handleCloseForm}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={this.state.loading}
            style={{ marginLeft: "8px" }}
          >
            Submit
          </Button>
        </footer>
      </form>
    );
  }
}

AccountForm.propTypes = {
  dispatch: PropTypes.func.isRequired,
  selectedCurrencyId: PropTypes.number.isRequired
};

const mapStateToProps = (state, ownProps) => {
  return {
    selectedCurrencyId: state.account.currency
  };
};

export default connect(mapStateToProps)(AccountForm);
