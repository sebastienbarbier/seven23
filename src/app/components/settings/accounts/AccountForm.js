/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import LinearProgress from "@mui/material/LinearProgress";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";

import CurrencyMultiSelector from "../../currency/CurrencyMultiSelector";

import AccountActions from "../../../actions/AccountsActions";

import Container from "@mui/material/Container";
import ModalLayoutComponent from "../../layout/ModalLayoutComponent";

export default function AccountForm(props) {
  const dispatch = useDispatch();
  const selectedCurrencyId = useSelector(state => state.account.currency);
  const isLogged = useSelector(state => state.server.isLogged);

  const [error, setError] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [id, setId] = useState(null);
  const [name, setName] = useState("");
  const [isLocal, setIsLocal] = useState(Boolean(!isLogged));
  const [currencies, setCurrencies] = useState([]);

  useEffect(() => {
    if (props.account) {
      setId(props.account.id);
      setName(props.account.name || "");
      setIsLocal(Boolean(props.account.isLocal || !isLogged));
      setCurrencies(props.account.currencies);
    } else {
      setId(null);
      setName("");
      setIsLocal(Boolean(!isLogged));
      setCurrencies([]);
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
      isLocal,
      currencies,
      preferences:
        props.account && props.account.preferences
          ? props.account.preferences
          : null
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
        setTimeout(() => {
          setId(null);
          setName("");
          setCurrencies([]);
        }, 500);
      })
      .catch(error => {
        if (error && error.name) {
          setError(error);
          setIsLoading(false);
        }
      });
  };

  return (
    <ModalLayoutComponent
      title={'Account'}
      content={<>
        <Container>
          <form onSubmit={onSubmit}>
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
            <div style={{ marginTop: 20 }}>
              <CurrencyMultiSelector
                value={currencies}
                onChange={values =>
                  setCurrencies(values ? values.map(c => c.value) : [])
                }
              />
            </div>
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
                        checked={Boolean(isLocal || !isLogged)}
                        disabled={Boolean(id || !isLogged)}
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
            {!Boolean(id) && (
              <p>
                Accounts saved on device will not be sync. They will only be stored
                on this device and not retrieved if lost.{" "}
                {!id ? "To create a remote account, login to a server entity." : ""}
              </p>
            )}
          </form>
        </Container>
      </>}
      footer={<>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row', width: '100%' }}>
          <Button color='inherit' disableElevation onClick={() => props.onClose()}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            disableElevation
            onClick={() => onSubmit()}
            disabled={isLoading}
          >
            Submit
          </Button>
        </Box>
      </>}
      isLoading={isLoading}
    />
  );
}