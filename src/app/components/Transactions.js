/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import './Transactions.scss';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';

import { withStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import Toolbar from '@material-ui/core/Toolbar';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';

import Fab from '@material-ui/core/Fab';

import CurrencySelector from './currency/CurrencySelector';

import Chip from '@material-ui/core/Chip';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';


import red from '@material-ui/core/colors/red';
import blue from '@material-ui/core/colors/blue';
import green from '@material-ui/core/colors/green';

import IconButton from '@material-ui/core/IconButton';

import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';
import ContentAdd from '@material-ui/icons/Add';

import BarGraph from './charts/BarGraph';

import TransactionForm from './transactions/TransactionForm';
import TransactionTable from './transactions/TransactionTable';
import StatisticsActions from '../actions/StatisticsActions';

import { Amount, BalancedAmount, ColoredAmount } from './currency/Amount';

const styles = theme => ({
  fab: {
    margin: theme.spacing.unit,
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  aside: {

  },
  cardHeader: {
    background: theme.palette.cardheader
  }
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
      tabs: 'overview',
      open: false
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
      this.setState({
        filters: filters,
        tabs: 'transactions',
      });
    }
  };

  _handleDeleteFilter = (filter, index) => {
    const filters = Array.from(this.state.filters);
    filters.splice(index, 1);
    this.setState({
      filters: filters,
      tabs: 'transactions',
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
        const year = parseInt(moment(dateBegin).format('YYYY'));
        const month = parseInt(moment(dateEnd).format('MM'));

        let days = {};
        if (result.stats.perDates && result.stats.perDates[year]) {
          days = result.stats.perDates[year].months[month - 1].days;
        }

        let lineExpenses = {
          values: [],
        };

        lineExpenses.values = Object.keys(days).map(key => {
          return {
            date: moment.utc([year, month - 1, key]).toDate(),
            value: days[key].expenses * -1,
          };
        });

        this.setState({
          isLoading: false,
          transactions: result.transactions,
          stats: result.stats,
          graph: [lineExpenses],
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

    const dateChange = this.state.dateBegin != dateBegin || this.state.dateEnd != dateEnd;
    this.setState({
      dateBegin: dateBegin,
      dateEnd: dateEnd,
      graph: null,
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
    if (dateChange || (this.props.isSyncing && !nextProps.isSyncing)) {
      this._processData(dateBegin, dateEnd);
    }
  }

  render() {
    const { classes, selectedCurrency, categories, isSyncing } = this.props;
    return [
      <div
        key="modal"
        className={'modalContent ' + (this.state.open ? 'open' : 'close')}
      >
        <Card>{this.state.component}</Card>
      </div>,
      <div key="content" className="transactions_layout">
        <header className="toolbar">
          <Paper square>
            <Toolbar
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                }}>
                <IconButton
                  className="previous"
                  onClick={this._goMonthBefore}
                >
                  <NavigateBefore />
                </IconButton>
                <IconButton
                  className="next"
                  onClick={this._goMonthNext}
                >
                  <NavigateNext />
                </IconButton>
                <h2 style={{ paddingLeft: 20 }}>{this.state.dateBegin.format('MMMM YYYY')}</h2>
              </div>
              <div className="hideMobile" style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-end',
              }}>
                <CurrencySelector history={history} />
              </div>
            </Toolbar>
          </Paper>
        </header>
        <div>
          <aside
            className={
              (this.state.isLoading || isSyncing ? 'noscroll' : '') + classes.aside
            }>
            <div className="left">
              <div className="indicators">
                <Card className="indicator">
                  <small>Incomes</small>
                  <span style={{ color: green[500] }}>
                    {!this.state.stats || isSyncing ? (
                      <span className="loading w80" />
                    ) : (
                      <ColoredAmount value={this.state.stats.incomes} currency={selectedCurrency} />
                    )}
                  </span>
                </Card>
                <Card className="indicator">
                  <small>Expenses</small>
                  <span style={{ color: red[500] }}>
                    {!this.state.stats || isSyncing ? (
                      <span className="loading w80" />
                    ) : (
                      <ColoredAmount value={this.state.stats.expenses} currency={selectedCurrency} />
                    )}
                  </span>
                </Card>
                <Card className="indicator">
                  <small>Balance</small>
                  <span style={{ color: blue[500] }}>
                    {!this.state.stats || isSyncing ? (
                      <span className="loading w80" />
                    ) : (
                      <BalancedAmount value={this.state.stats.expenses +
                          this.state.stats.incomes} currency={selectedCurrency} />
                    )}
                  </span>
                </Card>
              </div>

              <Card className="graph">
                <BarGraph
                  values={this.state.graph}
                  onSelection={date => {
                    this._handleAddFilter({
                      type: 'date',
                      value: date,
                    });
                  }}
                  isLoading={this.state.isLoading || isSyncing}
                />
              </Card>
            </div>

            <Card className="categories">
              <CardHeader
                title={ (this.state.isLoading || isSyncing ? ' ' : this.state.perCategories.length + ' categories')}
                className={classes.cardHeader}/>
              <Table
                style={{ background: 'transparent' }}
              >
                <TableBody>
                  {this.state.perCategories && !this.state.isLoading && !isSyncing && !this.state.isLoading && categories
                    ? this.state.perCategories.map(item => {
                      return (
                        <TableRow
                          key={item.id}
                          onClick={_ => {
                            this._handleAddFilter({
                              type: 'category',
                              value: item.id,
                            });
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <TableCell>
                            {
                              categories.find(category => {
                                return '' + category.id === '' + item.id;
                              }).name
                            }
                          </TableCell>
                          <TableCell>
                            <Amount value={item.expenses} currency={selectedCurrency} />
                          </TableCell>
                        </TableRow>
                      );
                    })
                    : ['w120', 'w80', 'w120', 'w120', 'w80', 'w120'].map(
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
            </Card>
          </aside>
          <div className={(this.state.isLoading || isSyncing ? 'noscroll' : '')}>
            { this.state.filters.length && !this.state.isLoading && !isSyncing ?
              <div>
                <Toolbar className="toolbar_filters">
                  <div className="filters">
                    {this.state.perCategories && !this.state.isLoading && !isSyncing
                      ? this.state.filters.map((filter, index) => {
                        return (
                          <Chip
                            label={filter.type === 'category' && categories
                              ? categories.find(category => {
                                return '' + category.id === '' + filter.value;
                              }).name
                              : moment(filter.value).format('ddd D MMM')}
                            onDelete={() => {
                              this._handleDeleteFilter(filter, index);
                            }}
                            key={index}
                            className="filter"
                          />
                        );
                      })
                      : ''}
                  </div>
                </Toolbar>
              </div> : ''}
            <div style={{ display: 'flex', padding: '0 8px 8px 8px' }}>
              <TransactionTable
                transactions={this.state.transactions}
                filters={this.state.filters}
                isLoading={this.state.isLoading || isSyncing}
                onEdit={this.handleOpenTransaction}
                onDuplicate={this.handleOpenDuplicateTransaction}
              />
            </div>
          </div>
        </div>
        <Fab color="primary"
          aria-label="Add"
          className={classes.fab}
          disabled={this.state.isLoading || isSyncing}
          onClick={this.handleOpenTransaction}>
          <ContentAdd />
        </Fab>
      </div>,
    ];
  }
}

Transactions.propTypes = {
  classes: PropTypes.object.isRequired,
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
    isSyncing: state.server.isSyncing,
    account: state.account,
    selectedCurrency: state.currencies.find((c) => c.id === state.account.currency)
  };
};

export default connect(mapStateToProps)(withStyles(styles)(Transactions));
