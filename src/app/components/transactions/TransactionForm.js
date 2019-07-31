import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";

import TextField from "@material-ui/core/TextField";

import Button from "@material-ui/core/Button";
import LinearProgress from "@material-ui/core/LinearProgress";

import FormControlLabel from "@material-ui/core/FormControlLabel";

import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";

import TransactionActions from "../../actions/TransactionActions";
import AutoCompleteSelectField from "../forms/AutoCompleteSelectField";
import DateFieldWithButtons from "../forms/DateFieldWithButtons";

const styles = {
  form: {
    textAlign: "center",
    padding: "0 60px"
  },
  radioGroup: {
    display: "flex",
    flexDirection: "row",
    paddingTop: "20px"
  },
  radioButton: {
    flex: "50%",
    marginRight: 0,
    paddingLeft: "12px"
  },
  amountIcon: {
    width: "30px",
    height: "30px",
    padding: "34px 14px 0 0"
  },
  amountField: {
    display: "flex",
    flexDirection: "row"
  }
};

export default function TransactionForm(props) {
  const dispatch = useDispatch();
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const currencies = useSelector(state =>
    state.currencies.filter(currency => {
      if (state.account && state.account.currencies) {
        return (
          state.account.currencies.indexOf(currency.id) != -1 ||
          currency.id == props.transaction.currency
        );
      } else {
        return currency.id == state.account.currency;
      }
    })
  );
  const categories = useSelector(state => state.categories.list);
  const account = useSelector(state => state.account);

  const lastCurrencyUsed = useSelector(state =>
    state.currencies.find(c => c.id === state.user.lastCurrencyUsed)
  );
  const selectedCurrency = useSelector(state =>
    state.currencies.find(c => c.id === state.account.currency)
  );

  const [id, setId] = useState(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(lastCurrencyUsed);
  const [date, setDate] = useState(new Date());
  const [category, setCategory] = useState(null);

  useEffect(() => {
    const transaction = props.transaction;
    setId(transaction.id);
    setName(transaction.name);
    if (props.transaction.originalAmount > 0) {
      setType("income");
      setAmount(transaction.originalAmount);
    } else {
      setType("expense");
      setAmount(transaction.originalAmount * -1);
    }
    setCurrency(
      currencies.find(c => c.id === transaction.originalCurrency) ||
        lastCurrencyUsed ||
        selectedCurrency
    );
    setDate(transaction.date || new Date());
    setCategory(categories.find(c => c.id === transaction.category));
  }, [props.transaction]);

  const onSave = e => {
    if (e) {
      e.preventDefault();
    }

    if (!name || !amount || !currency) {
      setError({
        name: !name ? "This field is required" : undefined,
        local_amount: !amount ? "This field is required" : undefined,
        currency: !currency ? "This field is required" : undefined
      });
    } else {
      let that = this;

      setError({});
      setIsLoading(true);

      let transaction = {
        id: id,
        account: account.id,
        name: name,
        date: date,
        local_amount:
          type == "income" ? parseFloat(amount) : parseFloat(amount) * -1,
        local_currency: currency.id,
        category: category ? category.id : null
      };

      dispatch(
        transaction.id
          ? TransactionActions.update(transaction)
          : TransactionActions.create(transaction)
      )
        .then(() => {
          if (props.onSubmit) {
            props.onSubmit();
          }
          setIsLoading(false);
        })
        .catch(error => {
          setError(error);
          setIsLoading(false);
        });
    }
  };

  return (
    <form onSubmit={onSave} className="content" noValidate>
      <header>
        <h2>Transaction</h2>
      </header>

      {isLoading ? <LinearProgress mode="indeterminate" /> : ""}
      <div className="form">
        <TextField
          label="Name"
          error={Boolean(error.name)}
          helperText={error.name}
          disabled={isLoading}
          onChange={event => setName(event.target.value)}
          value={name}
          fullWidth
          autoFocus={true}
          margin="normal"
        />
        <RadioGroup
          aria-label="type"
          name="type"
          value={type}
          onChange={event => setType(event.target.value)}
          style={styles.radioGroup}
        >
          <FormControlLabel
            disabled={isLoading}
            style={styles.radioButton}
            value="income"
            control={<Radio color="primary" />}
            label="Income"
          />
          <FormControlLabel
            disabled={isLoading}
            style={styles.radioButton}
            value="expense"
            control={<Radio color="primary" />}
            label="Expense"
          />
        </RadioGroup>
        <div style={styles.amountField}>
          <TextField
            type="number"
            label="Amount"
            inputProps={{ step: 0.01, lang: "en" }}
            fullWidth
            disabled={isLoading}
            onChange={event => setAmount(event.target.value.replace(",", "."))}
            value={amount}
            error={Boolean(error.local_amount)}
            helperText={error.local_amount}
            margin="normal"
            style={{ flexGrow: 1 }}
          />
          <div style={{ flex: "100%", flexGrow: 1 }}>
            <AutoCompleteSelectField
              label="Currency"
              disabled={isLoading}
              value={currency}
              values={currencies || []}
              error={Boolean(error.local_currency)}
              helperText={error.local_currency}
              onChange={currency => setCurrency(currency)}
              maxHeight={400}
              margin="normal"
            />
          </div>
        </div>
        <DateFieldWithButtons
          label="Date"
          disabled={isLoading}
          value={date}
          onChange={date => setDate(moment(date).toDate())}
          error={Boolean(error.date)}
          helperText={error.date}
          fullWidth
          autoOk={true}
        />
        <AutoCompleteSelectField
          label="Category"
          disabled={isLoading}
          value={category}
          values={categories || []}
          error={Boolean(error.category)}
          helperText={error.category}
          onChange={category => setCategory(category)}
          maxHeight={400}
          style={{ textAlign: "left" }}
        />
      </div>
      <footer>
        <Button onClick={() => (props.onClose ? props.onClose() : "")}>
          Cancel
        </Button>
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
