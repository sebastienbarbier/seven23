import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';

import { withTheme } from '@material-ui/core/styles';

import IconButton from '@material-ui/core/IconButton';

import Divider from '@material-ui/core/Divider';

import { Amount, ColoredAmount, BalancedAmount } from '../currency/Amount';
import MonthLineGraph from '../charts/MonthLineGraph';

import StatisticsActions from '../../actions/StatisticsActions';
import TransactionTable from '../transactions/TransactionTable';

const styles = {
  loading: {
    textAlign: 'center',
    padding: '50px 0',
  },
  button: {
    float: 'right',
    marginTop: '12px',
  },
  card: {
    width: '400px',
  },
  actions: {
    width: '30px',
  },
  graph: {
    width: '100%',
  },
  indicators: {
    fontSize: '1.4em',
    padding: '10px 40px 10px 27px',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  }
};

class Category extends Component {
  constructor(props, context) {
    super(props, context);
    this.history = props.history;
    this.state = {
      category: props.category,
      categories: props.categories,
      onEditTransaction: props.onEditTransaction,
      onDuplicationTransaction: props.onDuplicationTransaction,
      transactions: null,
      stats: null,
      graph: [],
      loading: true,
      snackbar: {
        open: false,
        message: '',
      },
    };
    this.context = context;
  }

  updateCategory = category => {
    if (category && !Array.isArray(category)) {
      this.setState({
        category: category,
      });
    }
  };

  _processData = (category = this.state.category) => {

    const { dispatch } = this.props;

    dispatch(StatisticsActions.perCategory(category.id)).then((args) => {

      if (args && args.transactions && Array.isArray(args.transactions)) {

        // Generate Graph data
        let lineExpenses = {
          // color: 'red',
          values: [],
        };

        let lineIncomes = {
          values: [],
        };

        Object.keys(args.stats.perDates).forEach(year => {
          // For each month of year
          Object.keys(args.stats.perDates[year].months).forEach(month => {
            if (args.stats.perDates[year].months[month]) {
              lineExpenses.values.push({
                date: new Date(year, month),
                value: +args.stats.perDates[year].months[month].expenses * -1,
              });
              lineIncomes.values.push({
                date: new Date(year, month),
                value: args.stats.perDates[year].months[month].incomes,
              });
            } else {
              lineExpenses.values.push({ date: new Date(year, month), value: 0 });
              lineIncomes.values.push({ date: new Date(year, month), value: 0 });
            }
          });
        });

        this.setState({
          loading: false,
          stats: args.stats,
          graph: [lineExpenses], // lineIncomes
          transactions: args.transactions,
        });
      }

    }).catch((error) => {
      console.error(error);
    });
  };

  handleGraphClick = date => {
    this.history.push(
      '/transactions/' +
        date.getFullYear() +
        '/' +
        (+date.getMonth() + 1) +
        '/',
    );
  };

  componentWillReceiveProps(newProps) {

    if (this.props.account.id !== newProps.account.id) {
      this.history.push('/categories');
    }

    if (newProps.category && newProps.category.id) {
      // TransactionActions.read({
      //   category: newProps.category.id,
      // });

      this.setState({
        category: newProps.category,
        categories: newProps.categories,
        onEditTransaction: newProps.onEditTransaction,
        onDuplicationTransaction: newProps.onDuplicationTransaction,
        transactions: null,
        stats: null,
        open: false,
        loading: true,
      });

      this._processData(newProps.category);
    }
  }

  componentDidMount() {
    this._processData();
  }

  render() {
    const { anchorEl } = this.state;
    const { theme, selectedCurrency, categories, isLoading } = this.props;
    return (
      <div>
        <div style={styles.graph}>
          <MonthLineGraph
            values={this.state.graph}
            isLoading={!this.state.transactions || isLoading}
            onClick={this.handleGraphClick}
            ratio="30%"
            color={theme.palette.text.primary}
          />
        </div>
        <div
          className="indicators separatorSandwitch"
          style={styles.indicators}
        >
          <p>
            <small>{moment().year()}</small>
            <br />
            {!this.state.stats || isLoading ? (
              <span className="loading w80" />
            ) : (
              <ColoredAmount value={this.state.stats.perDates[moment().year()]
                ? this.state.stats.perDates[moment().year()].expenses
                : 0} currency={selectedCurrency} />
            )}
          </p>
          <p>
            <small>Total</small>
            <br />
            {!this.state.stats || isLoading ? (
              <span className="loading w120" />
            ) : (
              <BalancedAmount value={this.state.stats.expenses} currency={selectedCurrency} />
            )}
          </p>
          <p>
            <small>Transactions</small>
            <br />
            {!this.state.stats || !this.state.transactions || isLoading ? (
              <span className="loading w50" />
            ) : (
              this.state.transactions.length
            )}
          </p>
          <p>
            <small>Average price</small>
            <br />
            {!this.state.stats || !this.state.transactions || isLoading ? (
              <span className="loading w120" />
            ) : (
              <Amount value={this.state.stats.expenses /
                  (this.state.transactions.length || 1)} currency={selectedCurrency} />
            )}
          </p>
        </div>

        <div style={{ paddingBottom: 20 }}>
          {this.state.transactions && this.state.transactions.length === 0 ? (
            <p>You have no transaction</p>
          ) : (
            <TransactionTable
              transactions={this.state.transactions}
              categories={categories}
              filters={[]}
              isLoading={!this.state.transactions || isLoading}
              onEdit={this.state.onEditTransaction}
              onDuplicate={this.state.onDuplicationTransaction}
              pagination="40"
              dateFormat="DD MMM YY"
            />
          )}
        </div>
      </div>
    );
  }
}

Category.propTypes = {
  theme: PropTypes.object.isRequired,
  account: PropTypes.object.isRequired,
  transactions: PropTypes.array.isRequired,
  selectedCurrency: PropTypes.object.isRequired,
  categories: PropTypes.array.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    account: state.account,
    transactions: state.transactions,
    selectedCurrency: state.currencies.find((c) => c.id === state.account.currency),
    categories: state.categories.list,
  };
};


export default connect(mapStateToProps)(withTheme()(Category));