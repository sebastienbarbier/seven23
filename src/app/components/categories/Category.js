import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTheme } from '@material-ui/core/styles';

import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import Popover from '@material-ui/core/Popover';
import Button from '@material-ui/core/Button';
import ExpandMore from '@material-ui/icons/ExpandMore';

import { ColoredAmount } from '../currency/Amount';

import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';
import Card from '@material-ui/core/Card';
import SwipeableViews from 'react-swipeable-views';

import StatisticsActions from '../../actions/StatisticsActions';
import TransactionTable from '../transactions/TransactionTable';

import CategoryActions from '../../actions/CategoryActions';

class Category extends Component {
  constructor(props, context) {
    super(props, context);
    this.history = props.history;
    this.state = {
      category: props.category,
      categories: props.categories,
      onEditCategory: props.onEditCategory,
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

  handleDeleteCategory = (selectedCategory = {}) => {

    this.history.push('/categories/');

    const { dispatch } = this.props;
    dispatch(CategoryActions.delete(selectedCategory.id)).then(() => {
      this.setState({
        snackbar: {
          open: true,
          message: 'Deleted with success',
          deletedItem: selectedCategory,
        },
      });
    });
  };

  componentWillReceiveProps(newProps) {

    if (this.props.account.id !== newProps.account.id) {
      this.history.push('/categories');
    }

    if (newProps.category && newProps.category.id) {
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

  _openActionMenu = (event) => {
    this.setState({
      anchorEl: event.currentTarget
    });
  };

  _closeActionMenu = () => {
    this.setState({
      anchorEl: null
    });
  };



  render() {
    const { anchorEl, category, stats } = this.state;
    const { categories, isLoading, selectedCurrency, theme, isSyncing } = this.props;

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', margin: '8px 20px'}}>
          <h1 className="hideMobile" style={{ width: '100%', paddingLeft: 10 }}>{ category.name }</h1>
          <Button onClick={event => this._openActionMenu(event) }>
            Edit
            <ExpandMore color='action' />
          </Button>
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
        <Popover
          open={ Boolean(anchorEl) }
          anchorEl={ anchorEl }
          onClose={this._closeActionMenu}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem
            onClick={() => {
              this._closeActionMenu();
              this.state.onEditCategory(this.state.category);
            }}
          >
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              this._closeActionMenu();
              this.state.onEditCategory({ parent: this.state.category.id });
            }}
          >
            Add sub category
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              this._closeActionMenu();
              this.handleDeleteCategory(this.state.category);
            }}
          >
            Delete
          </MenuItem>
        </Popover>
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