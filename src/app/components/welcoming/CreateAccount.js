import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import Button from "@mui/material/Button";

import TextField from "@mui/material/TextField";

import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";

import CircularProgress from "@mui/material/CircularProgress";

import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { Link } from "react-router-dom";

import AccountActions from "../../actions/AccountsActions";
import AppActions from "../../actions/AppActions";
import UserActions from "../../actions/UserActions";
import AutoCompleteSelectField from "../forms/AutoCompleteSelectField";

export default function CreateAccount(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currencies = useSelector((state) => state.currencies);

  const isLogged = useSelector((state) => state.server.isLogged);
  const [isLocal, setIsLocal] = useState(!isLogged || false);
  const loading = false;

  const [error, setError] = useState({});
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState(null);

  useEffect(() => {
    setIsLocal(!isLogged);
  }, [isLogged]);


  const handleSaveChange = (event) => {
    event.preventDefault();
    setError({});
    const error = {};
    if (!name) {
      error['name'] = 'A name is required to create an account';
    }
    if (!currency) {
      error['currency'] = 'A currency is required to create an account';
    }
    if (error.name || error.currency) {
      setError(error);
      return
    }
    dispatch(
      AccountActions.create({
        name: name,
        currency: currency.id,
        isLocal: isLocal,
      })
    )
      .then((account) => {
        dispatch(AccountActions.switchAccount(account));
        navigate("/dashboard");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const logout = () => {
    dispatch(UserActions.logout(true)).then(() => {
      navigate("/");
    });
  };

  return (
    <form className="layout dashboard mobile" onSubmit={(event) => handleSaveChange(event)}>
      <header className="layout_header">
        <Container className="layout_header_top_bar">
          <h2>New account</h2>
        </Container>
      </header>
      <main className="layout_content">
        <Container className="layout_content">
          <Stack spacing={1}>
            <TextField
              label="Name"
              value={name}
              error={Boolean(error.name)}
              helperText={error.name}
              onChange={(event) => setName(event.target.value)}
              autoFocus={true}
              variant="outlined"
            />
            <div className="selectCurrency">
              <AutoCompleteSelectField
                value={currency}
                values={currencies}
                error={Boolean(error.currency)}
                helperText={error.currency}
                onChange={(_currency) => setCurrency(_currency || null)}
                label="Currency"
                maxHeight={400}
                fullWidth={true}
                style={{ textAlign: "left" }}
              />
            </div>
            {isLogged && (
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Boolean(isLocal || !isLogged)}
                      disabled={Boolean(!isLogged)}
                      onChange={() => setIsLocal(!isLocal)}
                      value="isLocal"
                      color="primary"
                    />
                  }
                  label="Only save on device"
                />
              </FormGroup>
            )}
            </Stack>
        </Container>
      </main>
      <footer className="layout_footer">
        <Container>
          <Stack direction='row-reverse' spacing={2} style={{ justifyContent: 'space-between'}}>
            <Button
              variant="contained"
              type="submit"
              disableElevation
              color="primary"
              onClick={handleSaveChange}
            >
              Create new account
            </Button>
            {isLogged ? (
              <Button onClick={() => logout()}>Logout</Button>
            ) : (
              <Link to="/" tabIndex="-1"><Button color='inherit'>Cancel</Button></Link>
            )}
          </Stack>
        </Container>
      </footer>
    </form>
  );
}