/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import LinearProgress from "@material-ui/core/LinearProgress";
import Tooltip from "@material-ui/core/Tooltip";

import AccountActions from "../../../actions/AccountsActions";

export default function AccountForm(props) {
  const dispatch = useDispatch();
  const selectedCurrencyId = useSelector(state => state.account.currency);

  const [error, setError] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [id, setId] = useState(null);
  const [name, setName] = useState("");
  const [isLocal, setIsLocal] = useState(false);

  useEffect(() => {
    if (props.account) {
      setId(props.account.id);
      setName(props.account.name || "");
      setIsLocal(props.account.isLocal || false);
    } else {
      setId(null);
      setName("");
      setIsLocal(false);
    }
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
      name,
      isLocal
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
        <FormGroup style={{ paddingTop: 20 }}>
          <Tooltip
            title="Can't be edited. Use migration process to move an account's location."
            disableTouchListener={!Boolean(id)}
            disableFocusListener={!Boolean(id)}
            disableHoverListener={!Boolean(id)}
          >
            <span>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={Boolean(isLocal)}
                    disabled={Boolean(id)}
                    onChange={() => setIsLocal(!isLocal)}
                    value="isLocal"
                    color="primary"
                  />
                }
                label="Only save on device"
              />
            </span>
          </Tooltip>
        </FormGroup>
        <p>
          Accounts saved on device will not be sync. They will only be stored on
          this device and not retrieved if lost.
        </p>
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
