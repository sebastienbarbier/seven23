import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import makeStyles from '@mui/styles/makeStyles';
import moment from "moment";

import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";

import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Checkbox from "@mui/material/Checkbox";
import Stack from "@mui/material/Stack";

import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";

import TransactionActions from "../../actions/TransactionActions";
import ChangeActions from "../../actions/ChangeActions";
import AutoCompleteSelectField from "../forms/AutoCompleteSelectField";
import DateFieldWithButtons from "../forms/DateFieldWithButtons";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import { generateRecurrences } from "../../utils/transaction";
import { dateToString, stringToDate } from "../../utils/date";
import { ColoredAmount, Amount } from "../currency/Amount";

const styles = {
  form: {
    textAlign: "center",
    padding: "0 60px",
  },
  radioGroup: {
    display: "flex",
    flexDirection: "row",
    paddingTop: "0px",
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
  amountFieldRecurrent: {
    display: "flex",
    flexDirection: "row",
    alignItems: 'end'
  }
};

const PAGINATION = 12;
const DURATION_MAX = 365;

const useStyles = makeStyles((theme) => ({
  formControl: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    marginBottom: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  deleted: {
    textDecoration: "line-through",
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  }
}));

function sortRecurrences(a, b) {
  if (a.date < b.date) {
    return -1;
  } else if (a.date > b.date) {
    return 1;
  } else if (a.isOriginal) {
    return 1;
  } else if (a.local_amount > b.local_amount) {
    return -1;
  }
  return 1;
}

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
  const [date, setDate] = useState(dateToString(new Date()));
  const [category, setCategory] = useState(null);
  const [adjustments, setAdjustments] = useState({});

  const [changeOpen, setChangeOpen] = useState(false);
  const [changeAmount, setChangeAmount] = useState("");
  const [changeCurrency, setChangeCurrency] = useState(selectedCurrency);

  const [isRecurrent, setIsRecurrent] = useState(false);
  const [duration, setDuration] = useState(2);
  const [frequency, setFrequency] = useState("M");
  const [originalRecurrentDates, setOriginalRecurrentDates] = useState(null);
  const [originalAdjustments, setOriginalAdjustments] = useState(null);
  const [recurrentDates, setRecurrentDates] = useState([]);
  const [pagination, setPagination] = useState(PAGINATION);

  const [edit, setEdit] = useState(null);
  const [editAmount, setEditAmount] = useState(null);
  const [editDate, setEditDate] = useState(null);
  const [editError, setEditError] = useState(null);

  useEffect(() => {
    let transaction = Object.assign({}, props.transaction);
    if (transaction.isRecurrent && transaction.id) {
      transaction = transactions.find(
        (t) => t.id === transaction.id && !t.isRecurrent
      );
    }
    if (transaction.id) {
      setId(transaction.id);
    }
    setName(transaction.name);
    if (transaction.originalAmount) {
      if (transaction.originalAmount > 0) {
        setType("income");
        if (transaction.beforeAdjustmentAmount) {
          setAmount(transaction.beforeAdjustmentAmount);
        } else {
          setAmount(transaction.originalAmount);
        }
      } else {
        setType("expense");
        if (transaction.beforeAdjustmentAmount) {
          setAmount(transaction.beforeAdjustmentAmount * -1);
        } else {
          setAmount(transaction.originalAmount * -1);
        }
      }
    } else {
      setAmount("");
    }
    setCurrency(
      currencies.find((c) => c.id === transaction.originalCurrency) ||
        lastCurrencyUsed ||
        selectedCurrency
    );
    if (transaction.beforeAdjustmentDate) {
      setDate(transaction.beforeAdjustmentDate);
    } else {
      setDate(transaction.date ? transaction.date : dateToString(new Date()));
    }
    setCategory(categories.find((c) => c.id === transaction.category));

    // Update is recursive values
    setIsRecurrent(Boolean(transaction.frequency && transaction.duration));
    setAdjustments(transaction.adjustments);
    if (Boolean(transaction.frequency && transaction.duration)) {
      setDuration(transaction.duration);
      setFrequency(transaction.frequency);
    } else {
      setDuration("");
      setFrequency("M");
    }
    setPagination(PAGINATION);

    const t = {
      id: transaction.id,
      account: account.id,
      name: transaction.name,
      date: transaction.date
        ? dateToString(transaction.date)
        : dateToString(new Date()),
      local_amount: transaction.beforeAdjustmentAmount,
      local_currency: transaction.originalCurrency,
      beforeAdjustmentDate: transaction.beforeAdjustmentDate,
      beforeAdjustmentAmount: transaction.beforeAdjustmentAmount,
      category: transaction.category,
      frequency: transaction.frequency,
      duration: transaction.duration,
      adjustments: transaction.adjustments,
    };

    if (transaction.beforeAdjustmentDate) {
      t.date = dateToString(transaction.beforeAdjustmentDate);
    }

    if (moment(transaction.date).isValid()) {
      const res = generateRecurrences(t);
      res.forEach((transaction) => {
        transaction.isOriginal = true;
      });

      if (transaction.id) {
        setOriginalRecurrentDates(res);
        setOriginalAdjustments(transaction.adjustments);
      }
    }
  }, [props.transaction]);

  // Generate recurrences
  useEffect(() => {
    if (date && frequency && (duration || duration == "")) {
      const t = {
        id: id,
        account: account.id,
        name,
        date: date ? dateToString(date) : dateToString(new Date()),
        local_amount:
          type == "income"
            ? parseFloat(amount || 0)
            : parseFloat(amount || 0) * -1,
        local_currency: currency.id,
        category: category ? category.id : null,
        frequency,
        duration,
        adjustments,
      };
      // Generate temporary transaction from data same as onSave event
      if (moment(date).isValid()) {
        const res = generateRecurrences(t);
        setRecurrentDates(res);
      }
    }
  }, [duration, frequency, date, amount, type, adjustments]);

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

  const recurrencesHaveChanged = () => {
    let result = false;
    if (originalRecurrentDates.length > recurrentDates.length) {
      result = true;
    } else {
      originalRecurrentDates.forEach((transaction) => {
        if (!result) {
          const t = recurrentDates.find(
            (t) => t.date == dateToString(transaction.date)
          );
          if (!t) {
            result = true;
          } else if (
            t.beforeAdjustmentAmount != transaction.beforeAdjustmentAmount
          ) {
            result = true;
          } else if (t.local_amount != transaction.local_amount) {
            result = true;
          }
        }
      });
    }
    return result;
  };

  const saveAdjustement = () => {
    if (Number.isNaN(Number.parseFloat(editAmount))) {
      setEditError("This is not a valid amount");
    } else if (!moment(editDate).isValid()) {
      setEditError("This is not a valid date");
    } else {
      const newAssignments = Object.assign({}, adjustments);
      newAssignments[edit - 1] = {
        local_amount:
          type == "income"
            ? parseFloat(editAmount)
            : parseFloat(editAmount) * -1,
        date: editDate,
      };
      setAdjustments(newAssignments);
      setEditError(null);
      setEdit(null);
    }
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
      !date ||
      !moment(date).isValid() ||
      !currency ||
      (duration && duration > DURATION_MAX) ||
      (changeOpen && changeAmount != null && currency.id == changeCurrency.id)
    ) {
      setError({
        name: !name ? "This field is required" : undefined,
        local_amount: !amount ? "This field is required" : undefined,
        currency: !currency ? "This field is required" : undefined,
        date: !moment(date).isValid() ? `Invalid date format` : undefined,
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
        date: dateToString(date),
        local_amount:
          type == "income" ? parseFloat(amount) : parseFloat(amount) * -1,
        local_currency: currency.id,
        category: category ? category.id : null,
      };

      if (isRecurrent) {
        transaction.frequency = frequency;
        transaction.duration = duration;
        transaction.adjustments = adjustments;
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
          date: dateToString(date),
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

  const allRecurrences = [
    ...(originalRecurrentDates && recurrencesHaveChanged()
      ? originalRecurrentDates
      : []),
    ...recurrentDates,
  ];

  return (
    <form onSubmit={onSave} className="content" noValidate>
      <header>
        <h2>Transaction</h2>
      </header>

      {isLoading ? <LinearProgress mode="indeterminate" /> : ""}
      <div className="form">
        <Stack spacing={0}>
          <TextField
            label="Name"
            error={Boolean(error.name)}
            helperText={error.name}
            disabled={isLoading}
            onChange={(event) => setName(event.target.value)}
            value={name || ""}
            fullWidth
            autoFocus={true}
            id='cy_transaction_name'
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
            <Stack direction="row" spacing={2}>
              <TextField
                type="text"
                label="Amount"
                inputProps={{ lang: "en", inputMode: "decimal" }}
                fullWidth
                id='cy_transaction_amount'
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
            </Stack>
          </div>
          <DateFieldWithButtons
            label="Date"
            disabled={isLoading}
            value={date}
            onChange={(date) => {
              setDate(date.toDate());
            }}
            error={Boolean(error.date)}
            helperText={error.date}
            fullWidth
            id="cy_transaction_date"
            autoOk={true}
          />
          <AutoCompleteSelectField
            label="Category"
            id="cy_transaction_category"
            disabled={isLoading}
            value={category}
            values={categories || []}
            error={Boolean(error.category)}
            helperText={error.category}
            onChange={(category) => setCategory(category)}
            maxHeight={400}
          />
          {/*  */}
          <Divider  className={classes.divider}/>
          {!id &&
            <div
              style={{
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

                  <Stack direction="row" spacing={2}>
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
                  </Stack>
                </div>
              )}
            </div>
          }
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
            {isRecurrent && 
              <div style={{
                marginTop: 10,
              }}>
                <Stack spacing={2} direction="row">
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
                  <FormControl fullWidth className={classes.formControl}>
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
                </Stack>
                {recurrentDates && recurrentDates.length > 0 && (
                  <Table size="small" aria-label="Recurrent transaction created">
                    <TableHead>
                      <TableRow>
                        <TableCell></TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recurrentDates &&
                        recurrentDates.length > 0 &&
                        allRecurrences
                          .sort(sortRecurrences)
                          .filter((item, index) => index < pagination - 1)
                          .map((value, i) => {
                            if (
                              edit === (value.counter || 1) &&
                              !value.isOriginal
                            ) {
                              return (
                                <TableRow key={i}>
                                  <TableCell
                                    colSpan="4"
                                    align="right"
                                    style={{ paddingLeft: 8, paddingRight: 4 }}
                                    scope="row"
                                  >
                                    <div style={{ display: "flex" }}>
                                      <DateFieldWithButtons
                                        label="Date"
                                        disabled={isLoading}
                                        value={editDate}
                                        onChange={(date) =>
                                          setEditDate(date.toDate())
                                        }
                                        fullWidth
                                        autoOk={true}
                                        disableYestedayButton
                                      />
                                      <TextField
                                        type="text"
                                        label="Amount"
                                        inputProps={{
                                          lang: "en",
                                          inputMode: "decimal",
                                        }}
                                        fullWidth
                                        disabled={isLoading}
                                        onChange={(event) =>
                                          setEditAmount(
                                            event.target.value.replace(",", ".")
                                          )
                                        }
                                        value={editAmount}
                                        margin="normal"
                                        style={{ flexGrow: 1, marginLeft: 12 }}
                                      />
                                    </div>
                                    {editError && (
                                      <Typography align="left" color="error">
                                        {editError}
                                      </Typography>
                                    )}
                                    <Button
                                      size="small"
                                      color='inherit'
                                      onClick={() => setEdit(null)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      size="small"
                                      color="primary"
                                      onClick={saveAdjustement}
                                    >
                                      Save
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            } else {
                              return (
                                <TableRow
                                  key={i}
                                  className={
                                    value.isOriginal ? classes.deleted : ""
                                  }
                                >
                                  <TableCell
                                    component="th"
                                    scope="row"
                                    style={{ paddingLeft: 4, paddingRight: 8 }}
                                  >
                                    {value.counter || 1}
                                  </TableCell>
                                  <TableCell>
                                    {moment(stringToDate(value.date)).format(
                                      "LL"
                                    )}
                                  </TableCell>
                                  <TableCell
                                    align="right"
                                    style={{ paddingLeft: 8, paddingRight: 4 }}
                                  >
                                    <ColoredAmount
                                      tabularNums
                                      value={value.local_amount}
                                      currency={currency}
                                      accurate={value.isConversionAccurate}
                                    />
                                  </TableCell>
                                  <TableCell
                                    align="right"
                                    style={{ paddingLeft: 8, paddingRight: 4 }}
                                  >
                                    {!value.isOriginal && (
                                      <Button
                                        size="small"
                                        color='inherit'
                                        onClick={() => {
                                          setEdit(value.counter || 1);
                                          setEditAmount(
                                            Math.abs(value.local_amount)
                                          );
                                          setEditDate(value.date);
                                        }}
                                      >
                                        Edit
                                      </Button>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            }
                          })}
                    </TableBody>
                  </Table>
                )}
                { allRecurrences.length > pagination - 1 && (
                  <Button color='inherit' style={{ marginTop: 10 }} fullWidth onClick={more}>
                    {allRecurrences.length - pagination + 1} More
                  </Button>
                )}
              </div>
            }
          </div>
        </Stack>
      </div>
      <footer>
        <Stack direction="row-reverse" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={isLoading || isSyncing || !!edit}
          >
            Submit
          </Button>
          <Button color='inherit' onClick={() => (props.onClose ? props.onClose() : "")}>
            Cancel
          </Button>
        </Stack>
      </footer>
    </form>
  );
}