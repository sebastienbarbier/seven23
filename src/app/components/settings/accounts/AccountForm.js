/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import LinearProgress from "@material-ui/core/LinearProgress";

import AccountActions from "../../../actions/AccountsActions";

export default function AccountForm(props) {
  const dispatch = useDispatch();
  const selectedCurrencyId = useSelector(state => state.account.currency);

  const [error, setError] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [id, setId] = useState(null);
  const [name, setName] = useState("");

  useEffect(() => {
    setId(props.account ? props.account.id : null);
    setName(props.account ? props.account.name || "" : "");
  }, [props.account]);

  const onSubmit = e => {
    if (e) {
      e.preventDefault();
    }

    setIsLoading(true);
    setError([]);

    let promise;

    let newAccount = {
      id,
      name
    };

    if (props.account && props.account.id) {
      newAccount.currency = props.account.currency;
      promise = dispatch(AccountActions.update(newAccount));
    } else {
      newAccount.currency = selectedCurrencyId;
      promise = dispatch(AccountActions.create(newAccount));
    }

    promise
      .then(() => {
        setIsLoading(false);
        props.onSubmit();
      })
      .catch(error => {
        if (error && error.name) {
          setError(error);
          setIsLoading(false);
        }
      });
  };

  return (
    <form onSubmit={onSubmit} className="content">
      <header>
        <h2 style={{ color: "white" }}>Account</h2>
      </header>
      {isLoading ? <LinearProgress mode="indeterminate" /> : ""}
      <div className="form">
        <TextField
          label="Name"
          disabled={isLoading}
          onChange={event => setName(event.target.value)}
          value={name}
          style={{ width: "100%" }}
          error={Boolean(error.name)}
          helperText={error.name}
          margin="normal"
        />
      </div>
      <footer>
        <Button onClick={() => props.onClose()}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={isLoading}
          style={{ marginLeft: "8px" }}
        >
          Submit
        </Button>
      </footer>
    </form>
  );
}
