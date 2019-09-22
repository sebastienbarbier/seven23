import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import moment from "moment";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import LinearProgress from "@material-ui/core/LinearProgress";

import ChangeActions from "../../actions/ChangeActions";
import AutoCompleteSelectField from "../forms/AutoCompleteSelectField";
import DateFieldWithButtons from "../forms/DateFieldWithButtons";

const styles = {
  form: {
    textAlign: "center",
    padding: "0 60px"
  },
  amountField: {
    display: "flex"
  }
};

export default function ChangeForm(props) {
  const dispatch = useDispatch();
  const isSyncing = useSelector(state => state.state.isSyncing);

  const selectedCurrency = useSelector(state =>
    state.currencies.find(c => c.id === state.account.currency)
  );

  const [id, setId] = useState(null);
  const [name, setName] = useState("");
  const [date, setDate] = useState(
    props.change && props.change.date ? props.change.date : new Date()
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

  useEffect(() => {
    const change = props.change || {};

    setId(change.id || null);
    setName(change.name || "");
    setDate(change.date || new Date());
    setLocal_amount(change.local_amount || "");
    setLocal_currency(change.local_currency || selectedCurrency);
    setNew_amount(change.new_amount || "");
    setNew_currency(change.new_currency || props.currency || null);

    setLoading(false);
    setError({});
  }, [props.change, props.currency]);

  // List all account currencies
  const currencies = useSelector(state =>
    state.currencies.filter(currency => {
      if (state.account && state.account.currencies) {
        return (
          state.account.currencies.indexOf(currency.id) != -1 ||
          currency.id == selectedCurrency.id ||
          (props.currency && currency.id == props.currency.id)
        );
      } else {
        return (
          currency.id == state.account.currency ||
          (props.currency && currency.id == props.currency.id)
        );
      }
    })
  );

  const account = useSelector(state => state.account);

  const save = event => {
    if (event) {
      event.preventDefault();
    }
    if (isSyncing) {
      return;
    }

    if (!local_currency || !new_currency) {
      setError({
        local_currency: !local_currency ? "This field is required" : undefined,
        new_currency: !new_currency ? "This field is required" : undefined
      });
    } else {
      setError({});
      setLoading(true);

      let change = {
        id: id,
        account: account.id,
        name: name,
        date: moment(date).format("YYYY-MM-DD"),
        new_amount: new_amount,
        new_currency: new_currency.id,
        local_amount: local_amount,
        local_currency: local_currency.id
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
          props.onSubmit();
        })
        .catch(error => {
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
        <TextField
          fullWidth
          label="Name"
          disabled={loading}
          onChange={event => setName(event.target.value)}
          value={name}
          error={Boolean(error.name)}
          helperText={error.name}
          margin="normal"
        />
        <br />
        <DateFieldWithButtons
          label="Date"
          disabled={loading}
          value={date}
          onChange={date => setDate(date)}
          error={Boolean(error.date)}
          helperText={error.date}
          fullWidth
          fullWidth={true}
          autoOk={true}
        />
        <br />
        <div style={styles.amountField}>
          <TextField
            label="Amount"
            type="text"
            inputProps={{ lang: "en", inputMode: "decimal" }}
            disabled={loading}
            onChange={event =>
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
              value={currencies.find(
                c => local_currency && c.id == local_currency.id
              )}
              values={currencies}
              error={Boolean(error.local_currency)}
              helperText={error.local_currency}
              onChange={currency => setLocal_currency(currency)}
              label="From currency"
              maxHeight={400}
              margin="normal"
            />
          </div>
        </div>
        <div style={styles.amountField}>
          <TextField
            label="Amount"
            type="text"
            inputProps={{ lang: "en", inputMode: "decimal" }}
            disabled={loading}
            onChange={event =>
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
              value={currencies.find(
                c => new_currency && c.id == new_currency.id
              )}
              values={currencies}
              error={Boolean(error.new_currency)}
              helperText={error.new_currency}
              onChange={currency => setNew_currency(currency)}
              label="To currency"
              maxHeight={400}
              margin="normal"
            />
          </div>
        </div>
      </div>

      <footer>
        <Button onClick={() => props.onClose()}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={loading || isSyncing}
          style={{ marginLeft: "8px" }}
        >
          Submit
        </Button>
      </footer>
    </form>
  );
}
