import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import moment from "moment";

import TextField from "@material-ui/core/TextField";

import Button from "@material-ui/core/Button";
import LinearProgress from "@material-ui/core/LinearProgress";
import Checkbox from "@material-ui/core/Checkbox";

import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";

import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";

import TransactionActions from "../../actions/TransactionActions";
import ChangeActions from "../../actions/ChangeActions";
import AutoCompleteSelectField from "../forms/AutoCompleteSelectField";
import DateFieldWithButtons from "../forms/DateFieldWithButtons";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import { generateRecurrences } from "../../workers/utils/recurrency";
import { ColoredAmount, Amount } from "../currency/Amount";

const styles = {
  form: {
    textAlign: "center",
    padding: "0 60px",
  },
  radioGroup: {
    display: "flex",
    flexDirection: "row",
    paddingTop: "20px",
  },
  radioButton: {
    flex: "50%",
    marginRight: 0,
    paddingLeft: "12px",
  },
  amountIcon: {
    width: "30px",
    height: "30px",
    padding: "34px 14px 0 0",
  },
  amountField: {
    display: "flex",
    flexDirection: "row",
  },
};

const PAGINATION = 10;
const DURATION_MAX = 365;

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(2),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

export default function TransactionForm(props) {
  const dispatch = useDispatch();
  const classes = useStyles();

  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const isSyncing = useSelector((state) => state.state.isSyncing);

  const currencies = useSelector((state) =>
    state.currencies.filter((currency) => {
      if (state.account && state.account.currencies) {
        return (
          state.account.currencies.indexOf(currency.id) != -1 ||
          currency.id == props.transaction.currency ||
          currency.id == props.transaction.originalCurrency
        );
      } else {
        return currency.id == state.account.currency;
      }
    })
  );
  const categories = useSelector((state) => state.categories.list);
  const account = useSelector((state) => state.account);
  const transactions = useSelector((state) => state.transactions);

  const lastCurrencyUsed = useSelector((state) =>
    state.currencies.find((c) => c.id === state.user.lastCurrencyUsed)
  );
  const selectedCurrency = useSelector((state) =>
    state.currencies.find((c) => c.id === state.account.currency)
  );

  const [id, setId] = useState(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(lastCurrencyUsed);
  const [date, setDate] = useState(new Date());
  const [category, setCategory] = useState(null);

  const [changeOpen, setChangeOpen] = useState(false);
  const [changeAmount, setChangeAmount] = useState("");
  const [changeCurrency, setChangeCurrency] = useState(selectedCurrency);

  const [isRecurrent, setIsRecurrent] = useState(false);
  const [duration, setDuration] = useState(2);
  const [frequency, setFrequency] = useState("M");
  const [recurrentDates, setRecurrentDates] = useState([]);
  const [pagination, setPagination] = useState(PAGINATION);

  useEffect(() => {
    let transaction = props.transaction;
    if (transaction.isRecurrent) {
      transaction = transactions.find(
        (t) => t.id === transaction.id && !t.isRecurrent
      );
      transaction.date = new Date(transaction.date);
    }
    setId(transaction.id);
    setName(transaction.name);
    if (transaction.originalAmount) {
      if (transaction.originalAmount > 0) {
        setType("income");
        setAmount(transaction.originalAmount);
      } else {
        setType("expense");
        setAmount(transaction.originalAmount * -1);
      }
    }
    setCurrency(
      currencies.find((c) => c.id === transaction.originalCurrency) ||
        lastCurrencyUsed ||
        selectedCurrency
    );
    setDate(transaction.date || new Date());
    setCategory(categories.find((c) => c.id === transaction.category));

    // Update is recursive values
    setIsRecurrent(Boolean(transaction.frequency && transaction.duration));
    if (Boolean(transaction.frequency && transaction.duration)) {
      setDuration(transaction.duration);
      setFrequency(transaction.frequency);
    } else {
      setDuration("");
      setFrequency("M");
    }
    setPagination(PAGINATION);
  }, [props.transaction]);

  // Generate recurrences
  useEffect(() => {
    if (date && frequency && (duration || duration == "")) {
      const t = {
        id: id,
        account: account.id,
        name,
        date: new Date(
          Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
        ),
        local_amount:
          type == "income"
            ? parseFloat(amount || 0)
            : parseFloat(amount || 0) * -1,
        local_currency: currency.id,
        category: category ? category.id : null,
        frequency,
        duration,
      };
      // Generate temporary transaction from data same as onSave event
      setRecurrentDates([t, ...generateRecurrences(t)]);
    }
  }, [duration, frequency, date, amount, type]);

  // If transactions update when form edit is open, we check if current edited transaction has a new id (issue #33)
  useEffect(() => {
    const new_version = transactions.find((t) => t.old_id && t.old_id == id);
    if (new_version) {
      setId(new_version.id);
    }
  }, [transactions]);

  const more = () => {
    setPagination(pagination + PAGINATION);
  };

  const onSave = (e) => {
    if (e) {
      e.preventDefault();
    }
    if (isSyncing) {
      return;
    }

    if (
      !name ||
      !amount ||
      !currency ||
      (duration && duration > DURATION_MAX) ||
      (changeOpen && changeAmount != null && currency.id == changeCurrency.id)
    ) {
      setError({
        name: !name ? "This field is required" : undefined,
        local_amount: !amount ? "This field is required" : undefined,
        currency: !currency ? "This field is required" : undefined,
        duration:
          duration && duration > DURATION_MAX
            ? `Max ${DURATION_MAX}`
            : undefined,
        changeCurrency:
          currency.id == changeCurrency.id
            ? "Need to be a different currency"
            : undefined,
      });
    } else {
      let that = this;

      setError({});
      setIsLoading(true);
      let transaction = {
        id: id,
        account: account.id,
        name,
        date: new Date(
          Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
        ),
        local_amount:
          type == "income" ? parseFloat(amount) : parseFloat(amount) * -1,
        local_currency: currency.id,
        category: category ? category.id : null,
      };

      if (isRecurrent) {
        transaction.frequency = frequency;
        transaction.duration = duration;
      }

      const promises = [];
      promises.push(
        dispatch(
          transaction.id
            ? TransactionActions.update(transaction)
            : TransactionActions.create(transaction, changeOpen ? true : false)
        )
      );

      if (changeOpen) {
        let change = {
          account: account.id,
          name: name,
          date: new Date(
            Date.UTC(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
              0,
              0,
              0
            )
          ),
          new_amount: Math.abs(parseFloat(amount)),
          new_currency: currency.id,
          local_amount: Math.abs(parseFloat(changeAmount)),
          local_currency: changeCurrency.id,
        };

        promises.push(dispatch(ChangeActions.create(change)));
      }

      Promise.all(promises)
        .then(() => {
          if (props.onSubmit) {
            props.onSubmit();
          }
          setIsLoading(false);
        })
        .catch((error) => {
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
          onChange={(event) => setName(event.target.value)}
          value={name || ""}
          fullWidth
          autoFocus={true}
          margin="normal"
        />
        <RadioGroup
          aria-label="type"
          name="type"
          value={type}
          onChange={(event) => setType(event.target.value)}
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
            type="text"
            label="Amount"
            inputProps={{ lang: "en", inputMode: "decimal" }}
            fullWidth
            disabled={isLoading}
            onChange={(event) =>
              setAmount(event.target.value.replace(",", "."))
            }
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
              onChange={(currency) => setCurrency(currency)}
              maxHeight={400}
              margin="normal"
            />
          </div>
        </div>
        <DateFieldWithButtons
          label="Date"
          disabled={isLoading}
          value={date}
          onChange={(date) => setDate(moment(date).toDate())}
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
          onChange={(category) => setCategory(category)}
          maxHeight={400}
          style={{ textAlign: "left" }}
        />

        {!id ? (
          <div
            style={{
              borderTop: "solid 1px var(--divider-color)",
              marginTop: 20,
            }}
          >
            <FormControlLabel
              disabled={isLoading}
              control={
                <Checkbox
                  checked={changeOpen}
                  onChange={() => setChangeOpen(!changeOpen)}
                  color="primary"
                />
              }
              label="Add an exchange price"
            />
            {changeOpen && (
              <div style={styles.amountField}>
                <TextField
                  type="text"
                  label="Amount paid with"
                  inputProps={{ lang: "en", inputMode: "decimal" }}
                  fullWidth
                  disabled={isLoading}
                  onChange={(event) =>
                    setChangeAmount(event.target.value.replace(",", "."))
                  }
                  value={changeAmount}
                  error={Boolean(error.changeAmount)}
                  helperText={error.changeAmount}
                  margin="normal"
                  style={{ flexGrow: 1 }}
                />
                <div style={{ flex: "100%", flexGrow: 1 }}>
                  <AutoCompleteSelectField
                    label="Currency"
                    disabled={isLoading}
                    value={changeCurrency}
                    values={currencies || []}
                    error={Boolean(error.changeCurrency)}
                    helperText={error.changeCurrency}
                    onChange={(currency) => setChangeCurrency(currency)}
                    maxHeight={400}
                    margin="normal"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          ""
        )}
        <div
          style={{
            marginTop: 5,
            paddingBottom: 40,
          }}
        >
          <FormControlLabel
            disabled={isLoading}
            control={
              <Checkbox
                checked={isRecurrent}
                onChange={() => setIsRecurrent(!isRecurrent)}
                color="primary"
              />
            }
            label="Is a recurrent transaction"
          />
          {isRecurrent && (
            <div>
              <div style={styles.amountField}>
                <TextField
                  type="text"
                  label="Duration"
                  inputProps={{ lang: "en", inputMode: "numeric" }}
                  fullWidth
                  disabled={isLoading}
                  onChange={(event) => {
                    if (event.target.value <= DURATION_MAX) {
                      setError({});
                      setDuration(event.target.value);
                    } else {
                      setError({ duration: `Max ${DURATION_MAX}` });
                    }
                  }}
                  value={duration}
                  error={Boolean(error.duration)}
                  helperText={error.duration}
                  margin="normal"
                  style={{ flexGrow: 1 }}
                />
                <div style={{ flex: "100%", flexGrow: 1 }}>
                  <FormControl className={classes.formControl}>
                    <InputLabel
                      id="transaction_frequency"
                      style={{ flex: "100%", flexGrow: 1 }}
                    >
                      Frequency
                    </InputLabel>
                    <Select
                      labelId="transaction_frequency"
                      className={classes.selectEmpty}
                      disabled={isLoading}
                      value={frequency}
                      onChange={(event) => setFrequency(event.target.value)}
                    >
                      <MenuItem value={"D"}>Days</MenuItem>
                      <MenuItem value={"W"}>Weeks</MenuItem>
                      <MenuItem value={"M"}>Months</MenuItem>
                      <MenuItem value={"Y"}>Years</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </div>
              {recurrentDates && recurrentDates.length > 0 && (
                <Table size="small" aria-label="Recurrent transaction created">
                  <TableHead>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recurrentDates &&
                      recurrentDates.length > 0 &&
                      recurrentDates
                        .filter((item, index) => index < pagination - 1)
                        .map((value, i) => {
                          return (
                            <TableRow key={i}>
                              <TableCell component="th" scope="row">
                                {value.counter || 1}
                              </TableCell>
                              <TableCell>
                                {moment(value.date).format("LL")}
                              </TableCell>
                              <TableCell align="right">
                                <ColoredAmount
                                  tabularNums
                                  value={value.local_amount}
                                  currency={currency}
                                  accurate={value.isConversionAccurate}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                  </TableBody>
                </Table>
              )}
              {recurrentDates.length > pagination - 1 && (
                <Button style={{ marginTop: 10 }} fullWidth onClick={more}>
                  {recurrentDates.length - pagination + 1} More
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      <footer>
        <Button onClick={() => (props.onClose ? props.onClose() : "")}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={isLoading || isSyncing}
          style={{ marginLeft: "8px" }}
        >
          Submit
        </Button>
      </footer>
    </form>
  );
}
