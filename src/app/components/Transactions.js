/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import './Transactions.scss';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';

import SwipeableViews from 'react-swipeable-views';

import { withTheme } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';

import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';

import Fab from '@material-ui/core/Fab';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import blue from '@material-ui/core/colors/blue';
import red from '@material-ui/core/colors/red';
import green from '@material-ui/core/colors/green';

import Chip from '@material-ui/core/Chip';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import IconButton from '@material-ui/core/IconButton';

import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';
import ContentAdd from '@material-ui/icons/Add';
import ContentRemove from '@material-ui/icons/Remove';

import TransactionForm from './transactions/TransactionForm';
import TransactionTable from './transactions/TransactionTable';
import StatisticsActions from '../actions/StatisticsActions';
import UserButton from './settings/UserButton';

import { filteringCategoryFunction, filteringDateFunction } from './transactions/TransactionUtils';

import { BalancedAmount, ColoredAmount, Amount } from './currency/Amount';

const styles = theme => ({
  fab: {
    margin: theme.spacing.unit,
  },
});

class Transactions extends Component {
  constructor(props, context) {
    super(props, context);

    this.location = props.location;
    this.history = props.history;

    this.state = {
      dateBegin: moment
        .utc([props.match.params.year, props.match.params.month - 1])
        .startOf('month'),
      dateEnd: moment
        .utc([props.match.params.year, props.match.params.month - 1])
        .endOf('month'),
      isLoading: true,
      transaction: null,
      transactions: null,
      filters: [],
      stats: null,
      graph: null,
      open: false,
      tabs: 'transactions',
    };
    this.context = context;
    // Timer is a 300ms timer on read event to let color animation be smooth
    this.timer = null;
  }

  handleOpenTransaction = (item = {}) => {
    const component = (
      <TransactionForm
        transaction={item}
        categories={this.props.categories}
        onSubmit={this.handleCloseTransaction}
        onClose={this.handleCloseTransaction}
      />
    );
    this.setState({
      component: component,
      open: true,
      transaction: item,
    });
  };

  handleOpenDuplicateTransaction = (item = {}) => {
    let duplicatedItem = {};
    for (var key in item) {
      duplicatedItem[key] = item[key];
    }
    delete duplicatedItem.id;
    delete duplicatedItem.date;
    this.handleOpenTransaction(duplicatedItem);
  };

  handleCloseTransaction = () => {
    this.setState({
      open: false,
      transaction: null,
    });
    setTimeout(() => {
      this.setState({
        component: null,
      });
    }, 400);
  };

  _handleAddFilter = filter => {
    const filters = Array.from(this.state.filters);
    if (
      !filters.find(item => {
        return item.type === filter.type && item.value === filter.value;
      })
    ) {
      filters.push(filter);

      const filtered_transactions = this.state.transactions.filter(
        transaction =>
          filteringCategoryFunction(transaction, filters) &&
          filteringDateFunction(transaction, filters),
      );

      const filtered_stats = {
        incomes: 0,
        expenses: 0,
      };
      filtered_transactions.forEach((transaction) => {
        if (transaction.amount >= 0) {
          filtered_stats.incomes = filtered_stats.incomes + transaction.amount;
        } else {
          filtered_stats.expenses = filtered_stats.expenses + transaction.amount;
        }
      });
      this.setState({
        filters: filters,
        filtered_transactions,
        filtered_stats,
      });
    }
  };

  _handleDeleteFilter = (index) => {
    const filters = Array.from(this.state.filters);
    filters.splice(index, 1);
    const filtered_transactions = this.state.transactions.filter(
      transaction =>
        filteringCategoryFunction(transaction, filters) &&
        filteringDateFunction(transaction, filters),
    );

    const filtered_stats = {
      incomes: 0,
      expenses: 0,
    };
    filtered_transactions.forEach((transaction) => {
      if (transaction.amount >= 0) {
        filtered_stats.incomes = filtered_stats.incomes + transaction.amount;
      } else {
        filtered_stats.expenses = filtered_stats.expenses + transaction.amount;
      }
    });

    this.setState({
      filters: filters,
      filtered_transactions,
      filtered_stats,
    });
  };

  _goMonthBefore = () => {
    this.history.push(
      '/transactions/' +
        moment(this.state.dateBegin)
          .subtract(1, 'month')
          .format('YYYY/M'),
    );
  };

  _goMonthNext = () => {
    this.history.push(
      '/transactions/' +
        moment(this.state.dateBegin)
          .add(1, 'month')
          .format('YYYY/M'),
    );
  };

  _onTabChange = (event, value) => {
    this.setState({
      tabs: value,
    });
  };

  _processData = (dateBegin = this.state.dateBegin, dateEnd = this.state.dateEnd) => {
    const { dispatch } = this.props;
    dispatch(StatisticsActions.perDate(dateBegin.toDate(), dateEnd.toDate())).then((result) => {
      if (
        result &&
        result.transactions &&
        Array.isArray(result.transactions)
      ) {

        // Was processing data for graph
        //
        // const year = parseInt(moment(dateBegin).format('YYYY'));
        // const month = parseInt(moment(dateEnd).format('MM'));
        // let days = {};
        // if (result.stats.perDates && result.stats.perDates[year]) {
        //   days = result.stats.perDates[year].months[month - 1].days;
        // }
        // let lineExpenses = {
        //   values: [],
        // };
        // lineExpenses.values = Object.keys(days).map(key => {
        //   return {
        //     date: moment.utc([year, month - 1, key]).toDate(),
        //     value: days[key].expenses * -1,
        //   };
        // });
        //

        const filtered_transactions = result.transactions.filter(
          transaction =>
            filteringCategoryFunction(transaction, this.state.filters) &&
            filteringDateFunction(transaction, this.state.filters),
        );

        const filtered_stats = {
          incomes: 0,
          expenses: 0,
        };
        filtered_transactions.forEach((transaction) => {
          if (transaction.amount >= 0) {
            filtered_stats.incomes = filtered_stats.incomes + transaction.amount;
          } else {
            filtered_stats.expenses = filtered_stats.expenses + transaction.amount;
          }
        });

        this.setState({
          isLoading: false,
          transactions: result.transactions,
          stats: result.stats,
          filtered_transactions,
          filtered_stats,
          // graph: [lineExpenses],
          goals: result.goals,
          open: false,
          perCategories: Object.keys(result.stats.perCategories)
            .map(id => {
              return {
                id: id,
                incomes: result.stats.perCategories[id].incomes,
                expenses: result.stats.perCategories[id].expenses,
              };
            })
            .sort((a, b) => {
              return a.expenses > b.expenses ? 1 : -1;
            }),
        });
      }
    });
  };

  componentDidMount() {
    this._processData(this.state.dateBegin, this.state.dateEnd);
  }

  componentWillReceiveProps(nextProps) {
    let dateBegin = moment
      .utc([nextProps.match.params.year, nextProps.match.params.month - 1])
      .startOf('month');
    let dateEnd = moment
      .utc([nextProps.match.params.year, nextProps.match.params.month - 1])
      .endOf('month');

    const dateChange = !this.state.dateBegin.isSame(dateBegin) || !this.state.dateEnd.isSame(dateEnd);
    const transactionsChange = this.props.transactions.length != nextProps.transactions.length;
    this.setState({
      dateBegin: dateBegin,
      dateEnd: dateEnd,
      // graph: null,
      stats: null,
      perCategories: null,
      open: false,
      isLoading: true,
    });
    if (this.props.account.id != nextProps.account.id) {
      this.setState({
        filters: []
      });
    }
    // If syncing is done, we refresh statistics
    if (transactionsChange || dateChange || (this.props.isSyncing === true && nextProps.isSyncing === false)) {
      this._processData(dateBegin, dateEnd);
    }
  }

  render() {
    const { selectedCurrency, categories, isSyncing } = this.props;
    const { isLoading } = this.state;

    const label_tab_transactions = (isLoading || isSyncing ?
      'Transactions' :
      `${this.state.filtered_transactions.length} transaction${this.state.filtered_transactions.length <= 1 ? '' : 's'}`);
    const label_tab_categories = (isLoading || isSyncing ?
      'Categories' :
      `${this.state.perCategories.length} categor${this.state.perCategories.length <= 1 ? 'y' : 'ies'}`);

    return (
      <div className="layout">
        <div className={'modalContent ' + (this.state.open ? 'open' : '')}>
          <Card square className="modalContentCard">
            {this.state.component}
          </Card>
        </div>
        <header className="layout_header showMobile">
          <div
            className="layout_header_top_bar"
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: 4,
            }}>
            <IconButton
              className="previous"
              style={{ color: 'white' }}
              onClick={this._goMonthBefore}
            >
              <NavigateBefore fontSize="small" />
            </IconButton>
            <IconButton
              className="next"
              style={{ color: 'white' }}
              onClick={this._goMonthNext}
            >
              <NavigateNext fontSize="small" />
            </IconButton>
            <h2>{this.state.dateBegin.format('MMMM YYYY')}</h2>
            <div className='showMobile'><UserButton history={this.history} type="button" color="white" /></div>
          </div>
          <div className="indicators showModalSize wrapperMobile">
            <div className="view">
              <span>Balance&nbsp;</span>
              <span>
                {!this.state.filtered_stats || isSyncing ? (
                  <span className="loading w80" />
                ) : (
                  <Amount value={this.state.filtered_stats.expenses +
                      this.state.filtered_stats.incomes} currency={selectedCurrency} />
                )}
              </span>
            </div>
            <div className="view">
              <span>Expenses&nbsp;</span>
              <span>
                {!this.state.filtered_stats || isSyncing ? (
                  <span className="loading w80" />
                ) : (
                  <Amount value={this.state.filtered_stats.expenses} currency={selectedCurrency} />
                )}
              </span>
            </div>
            <div className="view">
              <span>Incomes&nbsp;</span>
              <span>
                {!this.state.filtered_stats || isSyncing ? (
                  <span className="loading w80" />
                ) : (
                  <Amount value={this.state.filtered_stats.incomes} currency={selectedCurrency} />
                )}
              </span>
            </div>
          </div>
          <div className="indicators hideModalSize">
            <SwipeableViews enableMouseEvents style={{ padding: '0 50vw 0 24px' }}  slideStyle={{ padding: '0 0px' }} >
              <div className="view">
                <span>Balance&nbsp;</span>
                <span>
                  {!this.state.filtered_stats || isSyncing || isLoading ? (
                    <span className="loading w80" />
                  ) : (
                    <Amount value={this.state.filtered_stats.expenses +
                        this.state.filtered_stats.incomes} currency={selectedCurrency} />
                  )}
                </span>
              </div>
              <div className="view">
                <span>Incomes&nbsp;</span>
                <span>
                  {!this.state.filtered_stats || isSyncing || isLoading ? (
                    <span className="loading w80" />
                  ) : (
                    <Amount value={this.state.filtered_stats.incomes} currency={selectedCurrency} />
                  )}
                </span>
              </div>
              <div className="view">
                <span>Expenses&nbsp;</span>
                <span>
                  {!this.state.filtered_stats || isSyncing || isLoading ? (
                    <span className="loading w80" />
                  ) : (
                    <Amount value={this.state.filtered_stats.expenses} currency={selectedCurrency} />
                  )}
                </span>
              </div>
            </SwipeableViews>
          </div>
          <div className="layout_header_tabs wrapperMobile">
            <Tabs
              centered
              variant="fullWidth"
              value={this.state.tabs}
              onChange={this._onTabChange}
            >
              <Tab label={ label_tab_transactions } value="transactions" disabled={isLoading || isSyncing} />
              <Tab label={ label_tab_categories } value="categories" disabled={isLoading || isSyncing} />
            </Tabs>
          </div>

        </header>

        <div className="transactions_two_columns">

          <div className="transactions_aside hideMobile">
            <div style={{ display: 'flex', alignItems: 'center'}}>
              <IconButton
                className="previous"
                onClick={this._goMonthBefore}
              >
                <NavigateBefore fontSize="small" />
              </IconButton>
              <IconButton
                className="next"
                onClick={this._goMonthNext}
              >
                <NavigateNext fontSize="small" />
              </IconButton>
              <h2 style={{ paddingLeft: 10 }}>{this.state.dateBegin.format('MMMM YYYY')}</h2>
            </div>

            <div className="metrics">
              <div className="metric">
                <h3 className="title">
                  Balance
                </h3>
                <div className="balance">
                  <p>
                    <span style={{ color: blue[500] }}>
                      {!this.state.filtered_stats || isSyncing || isLoading ? (
                        <span className="loading w120" />
                      ) : (
                        <BalancedAmount value={this.state.filtered_stats.expenses +
                        this.state.filtered_stats.incomes} currency={selectedCurrency} />
                      )}
                    </span>
                  </p>
                </div>
                <div className="incomes_expenses">
                  <p>
                    <small>Incomes</small>
                    <br />
                    <span style={{ color: green[500] }}>
                      {!this.state.filtered_stats || isSyncing || isLoading ? (
                        <span className="loading w120" />
                      ) : (
                        <ColoredAmount value={this.state.filtered_stats.incomes} currency={selectedCurrency} />
                      )}
                    </span>
                  </p>
                  <p>
                    <small>Expenses</small>
                    <br />
                    <span style={{ color: red[500] }}>
                      {!this.state.filtered_stats || isSyncing || isLoading ? (
                        <span className="loading w120" />
                      ) : (
                        <ColoredAmount value={this.state.filtered_stats.expenses} currency={selectedCurrency} />
                      )}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div>
              { !isLoading && !isSyncing && categories && this.state.perCategories &&
                <div className='categories layout_content wrapperMobile'>
                  <Table style={{ background: 'transparent' }} >
                    <TableBody>
                      { this.state.perCategories.map(item => {
                        const filterIndex = this.state.filters.findIndex((filter) => filter.value === item.id);
                        return (
                          <TableRow
                            key={item.id}
                            onClick={_ => {
                              filterIndex === -1 ?
                                this._handleAddFilter({ type: 'category', value: item.id, }) :
                                this._handleDeleteFilter(filterIndex) ;
                            }}
                            className={filterIndex != -1 ? 'isFilter' : ''}
                            style={{ cursor: 'pointer' }}
                          >
                            <TableCell className="category_dot">
                              {
                                categories.find(category => {
                                  return '' + category.id === '' + item.id;
                                }).name
                              }
                            </TableCell>
                            <TableCell align='right'>
                              <Amount value={item.expenses} currency={selectedCurrency} />
                            </TableCell>
                            <TableCell style={{ width: 40, padding: '4px 10px 4px 4px' }}>
                              { filterIndex != -1 ? <ContentRemove color="disabled" /> : <ContentAdd color="disabled" /> }
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              }
            </div>
          </div>

          <div className="layout_noscroll">
            { this.state.filters && this.state.filters.length ?
              <div className="layout_content_filters wrapperMobile">
                { this.state.filters.map((filter, index) => {
                  return (
                    <Chip
                      label={filter.type === 'category' && categories
                        ? categories.find(category => {
                          return '' + category.id === '' + filter.value;
                        }).name
                        : moment(filter.value).format('ddd D MMM')}
                      onDelete={() => {
                        this._handleDeleteFilter(index);
                      }}
                      key={index}
                      className="filter"
                    />
                  );
                })}
              </div>
            : '' }
            <div className="layout_content">
              { this.state.tabs === 'categories' && !isLoading && !isSyncing && categories && this.state.perCategories &&
                <div className='categories layout_content wrapperMobile'>
                  <Table style={{ background: 'transparent' }} >
                    <TableBody>
                      { this.state.perCategories.map(item => {
                        const filterIndex = this.state.filters.findIndex((filter) => filter.value === item.id);
                        return (
                          <TableRow
                            key={item.id}
                            onClick={_ => {
                              filterIndex === -1 ?
                                this._handleAddFilter({ type: 'category', value: item.id, }) :
                                this._handleDeleteFilter(filterIndex) ;
                            }}
                            className={filterIndex != -1 ? 'isFilter' : ''}
                            style={{ cursor: 'pointer' }}
                          >
                            <TableCell className="category_dot">
                              {
                                categories.find(category => {
                                  return '' + category.id === '' + item.id;
                                }).name
                              }
                            </TableCell>
                            <TableCell align='right'>
                              <Amount value={item.expenses} currency={selectedCurrency} />
                            </TableCell>
                            <TableCell style={{ width: 40, padding: '4px 10px 4px 4px' }}>
                              { filterIndex != -1 ? <ContentRemove color="disabled" /> : <ContentAdd color="disabled" /> }
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              }

              { this.state.tabs === 'categories' && (isLoading || isSyncing || !categories || !this.state.perCategories) &&
                <div className='noscroll categories layout_content wrapperMobile'>
                  <Table style={{ background: 'transparent' }} >
                    <TableBody>
                      { ['w120', 'w80', 'w120', 'w120', 'w80', 'w120'].map(
                        (value, i) => {
                          return (
                            <TableRow key={i}>
                              <TableCell>
                                <span className={`loading ${value}`} />
                              </TableCell>
                              <TableCell>
                                <span className="loading w30" />
                              </TableCell>
                            </TableRow>
                          );
                        },
                      )}
                    </TableBody>
                  </Table>
                </div>
              }

              { this.state.tabs === 'transactions' && !isLoading && !isSyncing &&
                <div className='transactions layout_content wrapperMobile'>
                  <div className="transactions_list" style={{ display: 'flex' }}>
                    <TransactionTable
                      transactions={this.state.filtered_transactions}
                      onEdit={this.handleOpenTransaction}
                      onDuplicate={this.handleOpenDuplicateTransaction}
                    />
                  </div>

                  { this.state.transactions && this.state.transactions.length ?
                    <div className="buttonPreviousMonth">
                      <Button
                        onClick={this._goMonthBefore}
                        disabled={isLoading || isSyncing}>
                        <NavigateBefore />
                        See previous month
                      </Button>
                    </div>
                    : '' }
                </div>
              }

              { this.state.tabs === 'transactions' && (isLoading || isSyncing) &&
                <div className='noscroll transactions layout_content wrapperMobile'>
                  <div className="transactions_list" style={{ display: 'flex' }}>
                    <TransactionTable isLoading={true} />
                  </div>
                </div>
              }

              <Fab color="primary"
                className={
                  (this.state.tabs === 'transactions' ? 'show ' : '') +
                  'layout_fab_button' }
                aria-label="Add"
                disabled={isLoading || isSyncing}
                onClick={this.handleOpenTransaction}>
                <ContentAdd />
              </Fab>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Transactions.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  transactions: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired,
  isSyncing: PropTypes.bool.isRequired,
  account: PropTypes.object.isRequired,
  selectedCurrency: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    transactions: state.transactions,
    categories: state.categories.list,
    isSyncing: state.state.isSyncing,
    account: state.account,
    selectedCurrency: state.currencies.find((c) => c.id === state.account.currency)
  };
};

export default connect(mapStateToProps)(withTheme()(withStyles(styles)(Transactions)));