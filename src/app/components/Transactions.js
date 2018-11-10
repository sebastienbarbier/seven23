/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import './Transactions.scss';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';

import { withTheme } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';

import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import red from '@material-ui/core/colors/red';
import blue from '@material-ui/core/colors/blue';
import green from '@material-ui/core/colors/green';

import IconButton from '@material-ui/core/IconButton';

import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';
import DateRange from '@material-ui/icons/DateRange';
import ContentAdd from '@material-ui/icons/Add';

import BarGraph from './charts/BarGraph';

import TransactionForm from './transactions/TransactionForm';
import TransactionTable from './transactions/TransactionTable';
import StatisticsActions from '../actions/StatisticsActions';

import { Amount, BalancedAmount, ColoredAmount } from './currency/Amount';

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
      isLoading: true
    });
    // If syncing is done, we refresh statistics
    if (this.props.isSyncing && !nextProps.isSyncing) {
      this._processData(dateBegin, dateEnd);
    }
    if (dateChange) {
      this._processData(dateBegin, dateEnd);
    }
  }

  render() {
    const { theme, selectedCurrency, categories, isSyncing } = this.props;
    return [
      <div
        key="modal"
        className={'modalContent ' + (this.state.open ? 'open' : 'close')}
      >
        <Card>{this.state.component}</Card>
      </div>,
      <div key="content" className="twoColumnContent">
        <div className="column">
          <Card className="card">
            <div className="cardContainer">
              <Paper>
                <header className="padding">
                  <h2 style={{ color: 'white' }}>{this.state.dateBegin.format('MMMM YYYY')}</h2>
                  <aside>
                    <IconButton
                      tooltip={moment(this.state.dateBegin)
                        .subtract(1, 'month')
                        .format('MMMM YY')}
                      className="previous"
                      onClick={this._goMonthBefore}
                    >
                      <NavigateBefore  style={{ color: 'white' }} />
                    </IconButton>
                    <IconButton className="calendar">
                      <DateRange style={{ color: 'white' }} />
                    </IconButton>
                    <IconButton
                      tooltip={moment(this.state.dateBegin)
                        .add(1, 'month')
                        .format('MMMM YY')}
                      className="next"
                      onClick={this._goMonthNext}
                    >
                      <NavigateNext style={{ color: 'white' }} />
                    </IconButton>
                  </aside>
                  <div className="tabs">
                    <Tabs
                      fullWidth
                      centered
                      value={this.state.tabs}
                      onChange={this._onTabChange}
                    >
                      <Tab label="Overview" value="overview" style={{ color: 'white' }} />
                      <Tab label="Transactions" value="transactions" style={{ color: 'white' }} />
                    </Tabs>
                  </div>
                </header>
              </Paper>
              <article
                className={
                  (this.state.tabs != 'overview' ? 'hideOnMobile' : '') +
                  ' ' +
                  (this.state.isLoading || isSyncing ? 'noscroll' : '')
                }
              >
                <div>
                  <div className="indicators">
                    <p>
                      <small>Incomes</small>
                      <br />
                      <span style={{ color: green[500] }}>
                        {!this.state.stats || isSyncing ? (
                          <span className="loading w80" />
                        ) : (
                          <ColoredAmount value={this.state.stats.incomes} currency={selectedCurrency} />
                        )}
                      </span>
                    </p>
                    <p>
                      <small>Expenses</small>
                      <br />
                      <span style={{ color: red[500] }}>
                        {!this.state.stats || isSyncing ? (
                          <span className="loading w80" />
                        ) : (
                          <ColoredAmount value={this.state.stats.expenses} currency={selectedCurrency} />
                        )}
                      </span>
                    </p>
                    <p>
                      <small>Balance</small>
                      <br />
                      <span style={{ color: blue[500] }}>
                        {!this.state.stats || isSyncing ? (
                          <span className="loading w80" />
                        ) : (
                          <BalancedAmount value={this.state.stats.expenses +
                              this.state.stats.incomes} currency={selectedCurrency} />
                        )}
                      </span>
                    </p>
                  </div>

                  <div style={{ width: '100%' }}>
                    <BarGraph
                      values={this.state.graph}
                      onSelection={date => {
                        this._handleAddFilter({
                          type: 'date',
                          value: date,
                        });
                      }}
                      isLoading={this.state.isLoading || isSyncing}
                      color={theme.palette.text.primary}
                    />
                  </div>

                  <Table
                    style={{ background: 'transparent' }}
                  >
                    <TableHead
                    >
                      <TableRow>
                        <TableCell />
                        <TableCell>Expenses</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {this.state.perCategories && !isSyncing && !this.state.isLoading
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
                </div>
              </article>
            </div>
          </Card>
        </div>
        <div
          className={
            (this.state.tabs != 'transactions' ? 'hideOnMobile' : '') +
            ' column ' +
            (this.state.isLoading || isSyncing ? 'noscroll' : '')
          }
        >
          <div className="toolbar">
            <div className="filters">
              {this.state.perCategories && !this.state.isLoading && !isSyncing
                ? this.state.filters.map((filter, index) => {
                  return (
                    <Chip
                      label={filter.type === 'category'
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
            <Button
              color="primary"
              disabled={this.state.isLoading || isSyncing}
              onClick={this.handleOpenTransaction}
            ><ContentAdd style={{ marginRight: '6px' }}/> New transaction</Button>
          </div>
          <TransactionTable
            transactions={this.state.transactions}
            filters={this.state.filters}
            isLoading={this.state.isLoading || isSyncing}
            onEdit={this.handleOpenTransaction}
            onDuplicate={this.handleOpenDuplicateTransaction}
          />
        </div>
      </div>,
    ];
  }
}

Transactions.propTypes = {
  theme: PropTypes.object.isRequired,
  transactions: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired,
  isSyncing: PropTypes.bool.isRequired,
  selectedCurrency: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    transactions: state.transactions,
    categories: state.categories.list,
    isSyncing: state.server.isSyncing,
    selectedCurrency: state.currencies.find((c) => c.id === state.account.currency)
  };
};

export default connect(mapStateToProps)(withTheme()(Transactions));
