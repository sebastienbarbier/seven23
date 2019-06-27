import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
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

class TransactionForm extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      transaction: null,
      id: props.transaction && props.transaction.id ? props.transaction.id : "",
      name:
        props.transaction && props.transaction.name
          ? props.transaction.name
          : "",
      amount:
        props.transaction && props.transaction.originalAmount
          ? props.transaction.originalAmount > 0
            ? props.transaction.originalAmount
            : props.transaction.originalAmount * -1
          : "",
      type:
        props.transaction && props.transaction.originalAmount
          ? props.transaction.originalAmount > 0
            ? "income"
            : "expense"
          : "expense",
      currency:
        props.transaction && props.transaction.originalCurrency
          ? props.currencies.find(
              c => c.id === props.transaction.originalCurrency
            )
          : props.lastCurrencyUsed,
      date: (props.transaction && props.transaction.date) || new Date(),
      category: props.transaction ? props.transaction.category : null,
      loading: false,
      openCategory: false,
      onSubmit: props.onSubmit,
      onClose: props.onClose,
      error: {} // error messages in form from WS
    };
  }

  _createNewCategory = () => {
    this.setState({
      openCategory: true
    });
  };

  componentWillReceiveProps(nextProps) {
    let transactionObject = nextProps.transaction;
    if (!transactionObject) {
      transactionObject = {};
    }
    this.setState({
      transaction: transactionObject,
      id: transactionObject.id,
      name: transactionObject.name || "",
      amount:
        transactionObject && transactionObject.originalAmount
          ? transactionObject.originalAmount > 0
            ? transactionObject.originalAmount
            : transactionObject.originalAmount * -1
          : "",
      type:
        transactionObject && transactionObject.originalAmount > 0
          ? "income"
          : "expense",
      currency:
        nextProps.currencies.find(
          c => c.id === transactionObject.originalCurrency
        ) || nextProps.lastCurrencyUsed,
      date: transactionObject.date || new Date(),
      category: transactionObject.category,
      onSubmit: nextProps.onSubmit,
      onClose: nextProps.onClose,
      loading: false,
      error: {} // error messages in form from WS
    });
  }

  handleNameChange = event => {
    this.setState({
      name: event.target.value
    });
  };

  handleTypeChange = event => {
    this.setState({
      type: event.target.value
    });
  };

  handleAmountChange = event => {
    this.setState({
      amount: event.target.value.replace(",", ".")
    });
  };

  handleCategoryChange = category => {
    this.setState({
      category: category ? category.id : null,
      openCategory: false
    });
  };

  handleCurrencyChange = currency => {
    this.setState({
      currency: currency,
      openCategory: false
    });
  };

  handleDateChange = date => {
    this.setState({
      date: moment(date).toDate(),
      openCategory: false
    });
  };

  handleSubmit = id => {
    this.setState({
      open: false,
      openCategory: false,
      loading: false
    });
  };

  save = e => {
    if (e) {
      e.preventDefault();
    }

    const { account, dispatch } = this.props;
    let component = this;

    component.setState({
      error: {},
      loading: true
    });

    let transaction = {
      id: this.state.id,
      account: account.id,
      name: this.state.name,
      date: this.state.date,
      local_amount:
        this.state.type === "income"
          ? parseFloat(this.state.amount)
          : this.state.amount * -1,
      local_currency: this.state.currency.id,
      category: this.state.category
    };

    if (transaction.id) {
      dispatch(TransactionActions.update(transaction))
        .then(() => {
          component.state.onSubmit();
        })
        .catch(error => {
          component.setState({
            error: error,
            loading: false
          });
        });
    } else {
      dispatch(TransactionActions.create(transaction))
        .then(() => {
          component.state.onSubmit();
        })
        .catch(error => {
          component.setState({
            error: error,
            loading: false
          });
        });
    }
  };

  render() {
    const { categories, currencies } = this.props;
    return (
      <form onSubmit={this.save} className="content" noValidate>
        <header>
          <h2>Transaction</h2>
        </header>

        {this.state.loading ? <LinearProgress mode="indeterminate" /> : ""}
        <div className="form">
          <TextField
            label="Name"
            error={Boolean(this.state.error.name)}
            helperText={this.state.error.name}
            disabled={this.state.loading}
            onChange={this.handleNameChange}
            value={this.state.name}
            fullWidth
            autoFocus={true}
            margin="normal"
          />
          <RadioGroup
            aria-label="type"
            name="type"
            value={this.state.type}
            onChange={this.handleTypeChange}
            style={styles.radioGroup}
          >
            <FormControlLabel
              disabled={this.state.loading}
              style={styles.radioButton}
              value="income"
              control={<Radio color="primary" />}
              label="Income"
            />
            <FormControlLabel
              disabled={this.state.loading}
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
              disabled={this.state.loading}
              onChange={this.handleAmountChange}
              value={this.state.amount}
              error={Boolean(this.state.error.local_amount)}
              helperText={this.state.error.local_amount}
              margin="normal"
              style={{ flexGrow: 1 }}
            />
            <div style={{ flex: "100%", flexGrow: 1 }}>
              <AutoCompleteSelectField
                label="Currency"
                disabled={this.state.loading}
                value={this.state.currency}
                values={currencies}
                error={Boolean(this.state.error.local_currency)}
                helperText={this.state.error.local_currency}
                onChange={this.handleCurrencyChange}
                maxHeight={400}
                margin="normal"
              />
            </div>
          </div>
          <DateFieldWithButtons
            label="Date"
            disabled={this.state.loading}
            value={this.state.date}
            onChange={this.handleDateChange}
            error={Boolean(this.state.error.date)}
            helperText={this.state.error.date}
            fullWidth
            autoOk={true}
          />
          <AutoCompleteSelectField
            label="Category"
            disabled={this.state.loading}
            value={
              categories
                ? categories.find(category => {
                    return category.id === this.state.category;
                  })
                : undefined
            }
            values={categories || []}
            error={Boolean(this.state.error.category)}
            helperText={this.state.error.category}
            onChange={this.handleCategoryChange}
            maxHeight={400}
            style={{ textAlign: "left" }}
          />
        </div>
        <footer>
          <Button onClick={this.state.onClose}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={this.state.loading}
            style={{ marginLeft: "8px" }}
          >
            Submit
          </Button>
        </footer>
      </form>
    );
  }
}

TransactionForm.propTypes = {
  dispatch: PropTypes.func.isRequired,
  change: PropTypes.object,
  currencies: PropTypes.array.isRequired,
  userId: PropTypes.number.isRequired,
  account: PropTypes.object.isRequired,
  lastCurrencyUsed: PropTypes.object.isRequired,
  selectedCurrency: PropTypes.object.isRequired
};

const mapStateToProps = (state, ownProps) => {
  let favoritesCurrencies = state.user.profile.favoritesCurrencies;
  if (favoritesCurrencies.length == 0) {
    favoritesCurrencies = [state.account.currency];
  }

  return {
    currencies: state.currencies.filter(currency => {
      return favoritesCurrencies.includes(currency.id);
    }),
    userId: state.user.profile.pk,
    account: state.account,
    lastCurrencyUsed: state.currencies.find(
      c => c.id === state.user.lastCurrencyUsed
    ),
    selectedCurrency: state.currencies.find(
      c => c.id === state.account.currency
    )
  };
};

export default connect(mapStateToProps)(TransactionForm);
