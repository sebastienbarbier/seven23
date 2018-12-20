import './Dashboard.scss';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import moment from 'moment';

import { withTheme } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';

import Paper from '@material-ui/core/Paper';
import Toolbar from '@material-ui/core/Toolbar';

import SyncButton from './accounts/SyncButton';
import AccountSelector from './accounts/AccountSelector';
import CurrencySelector from './currency/CurrencySelector';

import Button from '@material-ui/core/Button';
import ExpandMore from '@material-ui/icons/ExpandMore';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import red from '@material-ui/core/colors/red';
import blue from '@material-ui/core/colors/blue';
import green from '@material-ui/core/colors/green';

import DateRangeIcon from '@material-ui/icons/DateRange';
import TrendingDownIcon from '@material-ui/icons/TrendingDown';
import TrendingFlatIcon from '@material-ui/icons/TrendingFlat';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import CompareArrowsIcon from '@material-ui/icons/CompareArrows';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import MonthLineGraph from './charts/MonthLineGraph';
import PieGraph from './charts/PieGraph';

import StatisticsActions from '../actions/StatisticsActions';

import { Amount, BalancedAmount, ColoredAmount } from './currency/Amount';

const styles = theme => ({
  card: {
    margin: '0 10px 20px 10px',
  },
  cardHeader: {
    background: theme.palette.cardheader
  },
});

// Todo: replace localStorage item dashboard with redux
class Dashboard extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      stats: null,
      isLoading: true,
      graph: null,
      trend: null,
      currentYear: null,
    };
    this.history = props.history;
    // Timer is a 300ms timer on read event to let color animation be smooth
    this.timer = null;
  }

  handleGraphClick = date => {
    this.history.push(
      '/transactions/' +
        date.getFullYear() +
        '/' +
        (+date.getMonth() + 1) +
        '/',
    );
  };

  _handleChangeMenu = () => {

    this.setState({
      isLoading: true,
      stats: null,
      currentYear: null,
      trend: null,
      graph: null,
      perCategories: null,
      open: false,
    });

    this._processData();
  };

  _processData = () => {
    const { dispatch, categories } = this.props;

    dispatch(StatisticsActions.dashboard()).then((result) => {

      // Generate Graph data
      let lineExpenses = {
        color: 'red',
        values: [],
      };

      let lineIncomes = {
        values: [],
      };

      Object.keys(result.stats.perDates).forEach(year => {
        // For each month of year
        Object.keys(result.stats.perDates[year].months).forEach(month => {
          if (result.stats.perDates[year].months[month]) {
            lineExpenses.values.push({
              date: new Date(year, month),
              value: +result.stats.perDates[year].months[month].expenses * -1,
            });
            lineIncomes.values.push({
              date: new Date(year, month),
              value: result.stats.perDates[year].months[month].incomes,
            });
          } else {
            lineExpenses.values.push({ date: new Date(year, month), value: 0 });
            lineIncomes.values.push({ date: new Date(year, month), value: 0 });
          }
        });
      });

      this.setState({
        isLoading: false,
        currentYear: result.currentYear,
        trend: result.trend,
        stats: result.stats,
        graph: [lineIncomes, lineExpenses],
        open: false,
        perCategories: Object.keys(result.stats.perCategories)
          .map(id => {
            return {
              id: id,
              name: categories.find(category => {
                return '' + category.id === '' + id;
              }).name,
              incomes: result.stats.perCategories[id].incomes,
              expenses: result.stats.perCategories[id].expenses,
            };
          })
          .sort((a, b) => {
            return a.expenses > b.expenses ? 1 : -1;
          }),
      });

    }).catch((error) => {
      console.error(error);
    });
  };

  componentDidMount() {
    this._handleChangeMenu();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isSyncing != nextProps.isSyncing && nextProps.isSyncing === false) {
      this._handleChangeMenu();
    }
  }

  render() {
    const { theme, user, selectedCurrency, categories, isSyncing, classes } = this.props;
    const { anchorEl, open, currentYear, isLoading } = this.state;
    return (
      <div className="dashboard">
        { user.accounts && user.accounts.length != 0 ? (
          <Paper square id="toolbar" >
            <Toolbar
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <SyncButton />
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-end',
              }}>
                <AccountSelector disabled={isLoading || isSyncing} />
                <CurrencySelector history={history} disabled={isLoading || isSyncing} />
              </div>
            </Toolbar>
          </Paper>
        ) : (
          ''
        )}
        <div>
          <Paper square className="aside">

          </Paper>
          <div className="board">
            <Paper square className="header">
              <div>
                <h2>
                  {moment()
                    .utc()
                    .format('YYYY')}
                </h2>

                <div className="metrics">
                  <p>
                    <small>Incomes</small>
                    <br />
                    <span style={{ color: green[500] }}>
                      {!currentYear || isSyncing ? (
                        <span className="loading w120" />
                      ) : (
                        <ColoredAmount value={currentYear.incomes} currency={selectedCurrency} />
                      )}
                    </span>
                  </p>
                  <p>
                    <small>Expenses</small>
                    <br />
                    <span style={{ color: red[500] }}>
                      {!currentYear || isSyncing ? (
                        <span className="loading w120" />
                      ) : (
                        <ColoredAmount value={currentYear.expenses} currency={selectedCurrency} />
                      )}
                    </span>
                  </p>
                  <p>
                    <small>Balance</small>
                    <br />
                    <span style={{ color: blue[500] }}>
                      {!currentYear || isSyncing ? (
                        <span className="loading w120" />
                      ) : (
                        <BalancedAmount value={currentYear.expenses +
                            currentYear.incomes} currency={selectedCurrency} />
                      )}
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <h2>
                  {moment()
                    .utc()
                    .format('MMMM')}
                </h2>
                <div className="metrics">
                  <p>
                    <small>Incomes</small>
                    <br />
                    <span style={{ color: green[500] }}>
                      {!currentYear || isSyncing ? (
                        <span className="loading w120" />
                      ) : (
                        <ColoredAmount value={currentYear.currentMonth.incomes} currency={selectedCurrency} />
                      )}
                    </span>
                  </p>
                  <p>
                    <small>Expenses</small>
                    <br />
                    <span style={{ color: red[500] }}>
                      {!currentYear || isSyncing ? (
                        <span className="loading w120" />
                      ) : (
                        <ColoredAmount value={currentYear.currentMonth.expenses} currency={selectedCurrency} />
                      )}
                    </span>
                  </p>
                  <p>
                    <small>Balance</small>
                    <br />
                    <span style={{ color: blue[500] }}>
                      {!currentYear || isSyncing ? (
                        <span className="loading w120" />
                      ) : (
                        <BalancedAmount value={currentYear.currentMonth.expenses +
                            currentYear.currentMonth.incomes} currency={selectedCurrency} />
                      )}
                    </span>
                  </p>
                </div>
              </div>
            </Paper>

            <Card className={classes.card}>
              <MonthLineGraph
                values={this.state.graph || []}
                onClick={this.handleGraphClick}
                ratio="30%"
                isLoading={isLoading || isSyncing}
                color={theme.palette.text.primary}
              />
            </Card>
            <Card className={classes.card}>
              <CardHeader title="Trend on 30 days" className={classes.cardHeader} />
              <CardContent>
                <div
                  className={
                    isLoading || isSyncing ? 'noscroll wrapper' : 'wrapper'
                  }
                >
                  <table style={{ width: '100%' }}>
                    <tbody>
                      <tr>
                        <th
                          style={{ textAlign: 'center', paddingBottom: '4px' }}
                          colSpan="5"
                        >
                          {moment()
                            .utc()
                            .subtract(30 * 2 + 2, 'days')
                            .startOf('day')
                            .format('MMM Do')}{' '}
                          -{' '}
                          {moment()
                            .utc()
                            .subtract(30 + 2, 'days')
                            .endOf('day')
                            .format('MMM Do')}
                          <CompareArrowsIcon
                            style={{ verticalAlign: 'bottom', padding: '0 8px' }}
                          />
                          {moment()
                            .utc()
                            .subtract(30 + 1, 'days')
                            .startOf('day')
                            .format('MMM Do')}{' '}
                          -{' '}
                          {moment()
                            .utc()
                            .subtract(1, 'days')
                            .endOf('day')
                            .format('MMM Do')}
                        </th>
                      </tr>
                      {this.state.trend && !isSyncing
                        ? this.state.trend.map(trend => {
                          return (
                            <tr key={trend.id}>
                              <td>
                                <Link to={`/categories/${trend.id}`}>
                                  {
                                    categories.find(category => {
                                      return '' + category.id === '' + trend.id;
                                    }).name
                                  }
                                </Link>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <Amount value={trend.oldiest} currency={selectedCurrency} />
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                {!trend.earliest ? (
                                  <span style={{ color: green[500] }}>
                                    <TrendingDownIcon
                                      style={{
                                        color: green[500],
                                        verticalAlign: 'bottom',
                                      }}
                                    />
                                  </span>
                                ) : (
                                  ''
                                )}
                                {trend.earliest &&
                                  trend.oldiest &&
                                  trend.diff < 1 ? (
                                    <span style={{ color: green[500] }}>
                                      <TrendingDownIcon
                                        style={{
                                          color: green[500],
                                          verticalAlign: 'bottom',
                                        }}
                                      />
                                    </span>
                                  ) : (
                                    ''
                                  )}
                                {trend.earliest &&
                                  trend.oldiest &&
                                  trend.diff == 1 ? (
                                    <span>
                                      {' '}
                                      <TrendingFlatIcon
                                        style={{
                                          color: blue[500],
                                          verticalAlign: 'bottom',
                                        }}
                                      />
                                    </span>
                                  ) : (
                                    ''
                                  )}
                                {trend.earliest &&
                                  trend.oldiest &&
                                  trend.diff > 1 ? (
                                    <span style={{ color: red[500] }}>
                                      <TrendingUpIcon
                                        style={{
                                          color: red[500],
                                          verticalAlign: 'bottom',
                                        }}
                                      />
                                    </span>
                                  ) : (
                                    ''
                                  )}
                                {!trend.oldiest ? (
                                  <span style={{ color: red[500] }}>
                                    <TrendingUpIcon
                                      style={{
                                        color: red[500],
                                        verticalAlign: 'bottom',
                                      }}
                                    />
                                  </span>
                                ) : (
                                  ''
                                )}
                              </td>
                              <td style={{ textAlign: 'left' }}>
                                <Amount value={trend.earliest} currency={selectedCurrency} />
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                {trend.earliest &&
                                  trend.oldiest &&
                                  trend.diff < 1 ? (
                                    <span style={{ color: green[500] }}>
                                      {' '}
                                      - {parseInt((trend.diff - 1) * 100 * -1)}%
                                    </span>
                                  ) : (
                                    ''
                                  )}
                                {trend.earliest &&
                                  trend.oldiest &&
                                  trend.diff == 1 ? (
                                    <span style={{ color: blue[500] }}> 0%</span>
                                  ) : (
                                    ''
                                  )}
                                {trend.earliest &&
                                  trend.oldiest &&
                                  trend.diff > 1 ? (
                                    <span style={{ color: red[500] }}>
                                      {' '}
                                      + {parseInt((trend.diff - 1) * 100)}%
                                    </span>
                                  ) : (
                                    ''
                                  )}
                              </td>
                            </tr>
                          );
                        })
                        : [
                          'w120',
                          'w120',
                          'w80',
                          'w120',
                          'w80',
                          'w150',
                          'w80',
                          'w20',
                          'w120',
                          'w120',
                          'w80',
                          'w150',
                        ].map((value, i) => {
                          return (
                            <tr key={i}>
                              <td>
                                <span className={'loading ' + value} />
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <span className={'loading w30'} />
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <span className={'loading w20'} />
                              </td>
                              <td style={{ textAlign: 'left' }}>
                                <span className={'loading w30'} />
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <span className={'loading w30'} />
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
}

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  user: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
  categories: PropTypes.array.isRequired,
  isSyncing: PropTypes.bool.isRequired,
  selectedCurrency: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    categories: state.categories.list,
    user: state.user,
    isSyncing: state.server.isSyncing,
    selectedCurrency: state.currencies.find((c) => c.id === state.account.currency),
  };
};

export default connect(mapStateToProps)(withTheme()(withStyles(styles)(Dashboard)));
