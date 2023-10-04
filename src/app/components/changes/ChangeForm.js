import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import moment from "moment";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";

import ChangeActions from "../../actions/ChangeActions";
import AutoCompleteSelectField from "../forms/AutoCompleteSelectField";
import DateFieldWithButtons from "../forms/DateFieldWithButtons";
import { dateToString, stringToDate } from "../../utils/date";

const styles = {
  form: {
    textAlign: "center",
    padding: "0 60px",
  },
  amountField: {
    display: "flex",
  },
};

export default function ChangeForm(props) {
  const dispatch = useDispatch();
  const isSyncing = useSelector((state) => state.state.isSyncing);

  const selectedCurrency = useSelector((state) =>
    state.currencies.find((c) => c.id === state.account.currency)
  );

  const [id, setId] = useState(null);
  const [name, setName] = useState("");
  const [date, setDate] = useState(
    props.change && props.change.date
      ? stringToDate(props.change.date)
      : new Date()
  );
  const [local_amount, setLocal_amount] = useState("");
  const [local_currency, setLocal_currency] = useState(
    props.change && props.change.local_currency
      ? props.change.local_currency
      : selectedCurrency
  );
  const [new_amount, setNew_amount] = useState("");
  const [new_currency, setNew_currency] = useState(
    props.change && props.change.new_currency
      ? props.change.new_currency
      : props.currency
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});

  const [currencies, setCurrencies] = useState([]);

  const account = useSelector((state) => state.account);

  const allCurrencies = useSelector((state) => state.currencies);

  useEffect(() => {
    const change = props.change || {};

    setId(change.id || null);
    setName(change.name || "");
    setDate(change.date ? stringToDate(change.date) : new Date());
    setLocal_amount(change.local_amount || "");
    setLocal_currency(change.local_currency || selectedCurrency);
    setNew_amount(change.new_amount || "");
    setNew_currency(change.new_currency || props.currency || null);

    setLoading(false);
    setError({});

    setCurrencies(
      allCurrencies.filter((currency) => {
        if (account && account.currencies) {
          return (
            account.currencies.indexOf(currency.id) != -1 ||
            currency.id == selectedCurrency.id ||
            (props.currency && currency.id == props.currency.id) ||
            (props.change && currency.id == props.change.local_currency.id) ||
            (props.change && currency.id == props.change.new_currency.id)
          );
        } else {
          return (
            currency.id == account.currency ||
            (props.currency && currency.id == props.currency.id)
          );
        }
      })
    );
  }, [props.change, props.currency]);

  // const [currencies, setCurrencies] = useState(null);

  const save = (event) => {
    if (event) {
      event.preventDefault();
    }
    if (isSyncing) {
      return;
    }

    if (!local_currency || !new_currency) {
      setError({
        local_currency: !local_currency ? "This field is required" : undefined,
        new_currency: !new_currency ? "This field is required" : undefined,
      });
    } else {
      setError({});
      setLoading(true);

      let change = {
        id: id,
        account: account.id,
        name: name,
        date: dateToString(date),
        new_amount: new_amount,
        new_currency: new_currency.id,
        local_amount: local_amount,
        local_currency: local_currency.id,
      };

      let promise;

      if (change.id) {
        promise = dispatch(ChangeActions.update(change));
      } else {
        promise = dispatch(ChangeActions.create(change));
      }

      promise
        .then(() => {
          setLoading(false);

          setId(null);
          setName("");
          setDate(new Date());
          setLocal_amount("");
          setLocal_currency(selectedCurrency);
          setNew_amount("");
          setNew_currency(null);

          props.onSubmit();
        })
        .catch((error) => {
          if (error) {
            setError(error);
            setLoading(false);
          }
        });
    }
  };

  return (
    <form onSubmit={save} className="content" noValidate>
      <header>
        <h2 style={{ color: "white" }}>Change</h2>
      </header>
      {loading ? <LinearProgress mode="indeterminate" /> : ""}
      <div className="form">
        <Stack spacing={2} sx={{ marginTop: 2 }}>
          <TextField
            fullWidth
            label="Name"
            disabled={loading}
            onChange={(event) => setName(event.target.value)}
            value={name}
            error={Boolean(error.name)}
            helperText={error.name}
            margin="normal"
          />
          <DateFieldWithButtons
            label="Date"
            disabled={loading}
            value={date}
            onChange={(date) => setDate(date.toDate())}
            error={Boolean(error.date)}
            helperText={error.date}
            fullWidth
            fullWidth={true}
            autoOk={true}
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="Amount"
              type="text"
              inputProps={{ lang: "en", inputMode: "decimal" }}
              disabled={loading}
              onChange={(event) =>
                setLocal_amount(event.target.value.replace(",", "."))
              }
              value={local_amount}
              fullWidth
              error={Boolean(error.local_amount)}
              helperText={error.local_amount}
              margin="normal"
            />

            <div style={{ flex: "100%", flexGrow: 1 }}>
              <AutoCompleteSelectField
                disabled={loading}
                value={
                  currencies
                    ? currencies.find(
                        (c) => local_currency && c.id == local_currency.id
                      )
                    : null
                }
                values={currencies}
                error={Boolean(error.local_currency)}
                helperText={error.local_currency}
                onChange={(currency) => setLocal_currency(currency)}
                label="From currency"
                maxHeight={400}
                margin="normal"
              />
            </div>
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Amount"
              type="text"
              inputProps={{ lang: "en", inputMode: "decimal" }}
              disabled={loading}
              onChange={(event) =>
                setNew_amount(event.target.value.replace(",", "."))
              }
              value={new_amount}
              fullWidth
              error={Boolean(error.new_amount)}
              helperText={error.new_amount}
              margin="normal"
            />

            <div style={{ flex: "100%", flexGrow: 1 }}>
              <AutoCompleteSelectField
                disabled={loading}
                value={
                  currencies
                    ? currencies.find(
                        (c) => new_currency && c.id == new_currency.id
                      )
                    : null
                }
                values={currencies}
                error={Boolean(error.new_currency)}
                helperText={error.new_currency}
                onChange={(currency) => setNew_currency(currency)}
                label="To currency"
                maxHeight={400}
                margin="normal"
              />
            </div>
          </Stack>
        </Stack>
      </div>

      <footer>
        <Stack direction="row-reverse" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={loading || isSyncing}
          >
            Submit
          </Button>
          <Button color='inherit' onClick={() => props.onClose()}>Cancel</Button>
        </Stack>
      </footer>
    </form>
  );
}