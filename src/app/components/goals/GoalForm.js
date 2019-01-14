import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';

import TextField from '@material-ui/core/TextField';

import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';

import GoalActions from '../../actions/GoalActions';
import AutoCompleteSelectField from '../forms/AutoCompleteSelectField';

const styles = {
  form: {
    textAlign: 'center',
    padding: '0 60px',
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'row',
    paddingTop: '20px',
  },
  radioButton: {
    flex: '50%',
    marginRight: 0,
    paddingLeft: '12px',
  },
  amountIcon: {
    width: '30px',
    height: '30px',
    padding: '34px 14px 0 0',
  },
  amountField: {
    display: 'flex',
    flexDirection: 'row',
  },
};

class GoalForm extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      transaction: null,
      id: props.goal && props.goal.id ? props.goal.id : '',
      amount:
        props.goal && props.goal.original_amount
          ? props.goal.original_amount > 0
            ? props.goal.original_amount
            : props.goal.original_amount * -1
          : '',
      currency:
        props.goal && props.goal.currency
          ? props.currencies.find(c => c.id === props.goal.currency)
          : props.lastCurrencyUsed,
      category: props.goal ? props.goal.category : null,
      loading: false,
      value: 0,
      onSubmit: props.onSubmit,
      onClose: props.onClose,
      error: {}, // error messages in form from WS
    };
  }

  componentWillReceiveProps(nextProps) {
    let goalObject = nextProps.goal;
    if (!goalObject) {
      goalObject = {};
    }
    this.setState({
      transaction: goalObject,
      id: goalObject.id,
      amount:
        goalObject && goalObject.original_amount
          ? goalObject.original_amount > 0
            ? goalObject.original_amount
            : goalObject.original_amount * -1
          : '',
      currency:
        nextProps.currencies.find(c => c.id === goalObject.currency) ||
        nextProps.lastCurrencyUsed,
      category: goalObject.category,
      onSubmit: nextProps.onSubmit,
      onClose: nextProps.onClose,
      loading: false,
      error: {}, // error messages in form from WS
    });
  }

  handleAmountChange = event => {
    this.setState({
      amount: event.target.value.replace(',', '.'),
    });
  };

  handleCurrencyChange = currency => {
    this.setState({
      currency: currency,
    });
  };

  handleCategoryChange = category => {
    this.setState({
      category: category ? category.id : null,
    });
  };

  handleSubmit = id => {
    this.setState({
      open: false,
      loading: false,
    });
  };

  save = e => {
    if (e) { e.preventDefault(); }

    const { account, dispatch } = this.props;
    let component = this;

    component.setState({
      error: {},
      loading: true,
    });

    let goal = {
      id: this.state.id,
      account: account.id,
      type: 'SPEND_LESS_THAN',
      amount: this.state.amount,
      currency: this.state.currency.id,
      category: this.state.category,
    };

    if (goal.id) {
      dispatch(GoalActions.update(goal)).then(() => {
        component.state.onSubmit();
      }).catch((error) => {
        component.setState({
          error: error,
          loading: false,
        });
      });
    } else {
      dispatch(GoalActions.create(goal)).then(() => {
        component.state.onSubmit();
      }).catch((error) => {
        component.setState({
          error: error,
          loading: false,
        });
      });
    }
  };

  render() {
    const { categories, currencies } = this.props;
    return (
      <div>
        {this.state.loading ? (
          <LinearProgress mode="indeterminate" />
        ) : (
          ''
        )}
        <form onSubmit={this.save} className="content">

          <header className="title">
            <h2 style={{ color: 'white' }}>Monthly Goal</h2>
          </header>
          <div className="form">
            <div>
              <div style={styles.amountField}>
                <TextField
                  label="Spend less than"
                  fullWidth
                  disabled={this.state.loading}
                  onChange={this.handleAmountChange}
                  value={this.state.amount}
                  error={Boolean(this.state.error.local_amount)}
                  helperText={this.state.error.local_amount}
                  margin="normal"
                  style={{ flexGrow: 1 }}
                />

                <div style={{ flex: '100%', flexGrow: 1 }}>
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

              <AutoCompleteSelectField
                label="Category (Optional)"
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
                style={{ textAlign: 'left' }}
              />
            </div>

          </div>
          <footer>
            <Button
              onClick={this.state.onClose}
            >Cancel</Button>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={this.state.loading}
              style={{ marginLeft: '8px' }}
            >Submit</Button>
          </footer>
        </form>
      </div>
    );
  }
}

GoalForm.propTypes = {
  dispatch: PropTypes.func.isRequired,
  change: PropTypes.object,
  currencies: PropTypes.array.isRequired,
  userId: PropTypes.number.isRequired,
  account: PropTypes.object.isRequired,
  lastCurrencyUsed:  PropTypes.object.isRequired,
  selectedCurrency: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    currencies: state.currencies.filter((currency) => {
      return state.user.profile.favoritesCurrencies.includes(currency.id);
    }),
    userId: state.user.profile.pk,
    account: state.account,
    lastCurrencyUsed: state.currencies.find(c => c.id === state.user.lastCurrencyUsed),
    selectedCurrency: state.currencies.find(c => c.id === state.account.currency),
  };
};

export default connect(mapStateToProps)(GoalForm);