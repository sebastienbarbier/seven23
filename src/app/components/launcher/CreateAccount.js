import Button from "@mui/material/Button";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useRouteTitle from "../../hooks/useRouteTitle";

import TextField from "@mui/material/TextField";

import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import { Link } from "react-router-dom";

import AccountActions from "../../actions/AccountsActions";
import UserActions from "../../actions/UserActions";
import AutoCompleteSelectField from "../forms/AutoCompleteSelectField";

import ModalLayoutComponent from "../layout/ModalLayoutComponent";

export default function CreateAccount(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const titleObject = useRouteTitle();
  const currencies = useSelector((state) => state.currencies);

  const isLogged = useSelector((state) => state.server.isLogged);
  const [isLocal, setIsLocal] = useState(!isLogged || false);

  const [error, setError] = useState(null);
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState(null);

  const [favoritesCurrencies] = useState(
    currencies.filter((item) =>
      ["EUR", "USD", "CHF", "GBP", "CNY"].includes(item.code)
    )
  );

  useEffect(() => {
    setIsLocal(!isLogged);
  }, [isLogged]);

  // Remove name and currency error onChange
  useEffect(() => {
    const newError = Object.assign({}, error);
    if (name) {
      delete newError.name;
    }
    if (currency) {
      delete newError.currency;
    }
    setError(newError);
  }, [name, currency]);

  const handleSaveChange = (event) => {
    event.preventDefault();
    setError({});
    const error = {};
    if (!name) {
      error["name"] = "A name is required to create an account";
    }
    if (!currency) {
      error["currency"] = "A currency is required to create an account";
    }
    if (error.name || error.currency) {
      setError(error);
      return;
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
    <ModalLayoutComponent
      title={titleObject.title}
      content={
        <>
          <form onSubmit={(event) => handleSaveChange(event)}>
            <main>
              <Container>
                <Stack spacing={2} sx={{ marginTop: 2 }}>
                  <Typography sx={{ pb: 1 }}>
                    Create your first account to start{" "}
                    <strong>tracking your spendings</strong>. You will be able
                    to have <strong>multiple account</strong> and easily{" "}
                    <strong>switch</strong> between them.
                  </Typography>
                  <TextField
                    label="Name"
                    id="cy_name"
                    value={name}
                    error={Boolean(error && error.name)}
                    helperText={error ? error.name : null}
                    onChange={(event) => setName(event.target.value)}
                    autoFocus={true}
                    variant="outlined"
                  />
                  <div className="selectCurrency" id="cy_select_currency">
                    <AutoCompleteSelectField
                      value={currency}
                      values={currencies}
                      error={Boolean(error && error.currency)}
                      helperText={error ? error.currency : null}
                      onChange={(_currency) => setCurrency(_currency || null)}
                      label="Currency"
                      maxHeight={400}
                      fullWidth={true}
                      favorites={favoritesCurrencies}
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
                            id="cy_only_on_device"
                            color="primary"
                          />
                        }
                        label="Only save on device"
                      />
                    </FormGroup>
                  )}
                  <input type="submit" style={{ visibility: "hidden" }} />
                </Stack>
              </Container>
            </main>
          </form>
        </>
      }
      footer={
        <>
          <Stack
            direction="row-reverse"
            spacing={2}
            style={{ justifyContent: "space-between" }}
          >
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
              <Link to="/" tabIndex="-1">
                <Button color="inherit">Cancel</Button>
              </Link>
            )}
          </Stack>
        </>
      }
    />
  );
}
