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
import CardContent from '@material-ui/core/CardContent';

import red from '@material-ui/core/colors/red';
import orange from '@material-ui/core/colors/orange';
import blue from '@material-ui/core/colors/blue';
import green from '@material-ui/core/colors/green';

import TrendingDownIcon from '@material-ui/icons/TrendingDown';
import TrendingFlatIcon from '@material-ui/icons/TrendingFlat';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import CompareArrowsIcon from '@material-ui/icons/CompareArrows';

import MonthLineGraph from './charts/MonthLineGraph';

import GoalActions from '../actions/GoalActions';
import StatisticsActions from '../actions/StatisticsActions';

import GoalForm from './goals/GoalForm.js';

import UserButton from './settings/UserButton';

import { Amount, BalancedAmount, ColoredAmount } from './currency/Amount';

const styles = theme => ({
  card: {
    margin: '0 10px 20px 10px',
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
      goals: null,
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

  handleOpenGoal = (item = {}) => {
    const component = (
      <GoalForm
        goal={item}
        categories={this.props.categories}
        onSubmit={this.handleCloseGoal}
        onClose={this.handleCloseGoal}
      />
    );
    this.setState({
      component: component,
      open: true,
      goal: item,
    });
  };

  handleCloseGoal = () => {
    this.setState({
      open: false,
      goal: null,
    });
    setTimeout(() => {
      this.setState({
        component: null,
      });
    }, 400);
  };

  _handleChangeMenu = () => {

    this.setState({
      isLoading: true,
      stats: null,
      currentYear: null,
      trend: null,
      graph: null,
      goals: null,
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
        goals: result.goals,
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

  _handleDeleteGoal = (goal) => {
    const { dispatch } = this.props;
    dispatch(GoalActions.delete(goal));
  };

  componentDidMount() {
    this._handleChangeMenu();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isSyncing != nextProps.isSyncing && nextProps.isSyncing === false) {
      this._handleChangeMenu();
    } else if (this.props.goals != nextProps.goals && nextProps.isSyncing === false) {
      this._handleChangeMenu();
    }
  }

  render() {
    const { theme, selectedCurrency, categories, isSyncing, classes, transactions_length,
      categories_length, changes_length } = this.props;
    const { currentYear, isLoading, open } = this.state;

    console.log(theme);

    return (
      <div className="layout dashboard">
        <div className={'modalContent ' + (open ? 'open' : '')}>
          <Card square className="modalContentCard">{this.state.component}</Card>
        </div>
        <header className="layout_header">
          <div className="layout_header_top_bar">
            <h2>Dashboard</h2>
            <div className='showMobile'><UserButton history={this.history} type="button" color="white" /></div>
          </div>
        </header>
        <div className="layout_content">
          <div className="board">
            <div className="header">
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
            </div>

            <div>
              <MonthLineGraph
                values={this.state.graph || []}
                onClick={this.handleGraphClick}
                ratio="50%"
                isLoading={isLoading || isSyncing}
                color={theme.palette.text.primary}
              />
            </div>

            <div style={{ padding: '10px 20px 40px 10px'}}>
              <h3>Trend on 30 days</h3>
              <div
                style={{ fontSize: '0.8rem' }}
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
            </div>

            <div style={{ padding: '10px 20px 40px 20px', fontSize: '0.9rem' }}>
              <p>
                This account contains {' '}
                <span style={{ color: theme.palette.transactions.main }}>
                  {isLoading || isSyncing ? (
                    <span className="loading w80" />
                  ) : transactions_length}
                </span>{' '}<strong>transactions</strong>
                ,{' '}
                <span style={{ color: theme.palette.changes.main }}>
                  {isLoading || isSyncing ? (
                    <span className="loading w80" />
                  ) : changes_length}
                </span>{' '}<strong>changes</strong>
                , and{' '}
                <span style={{ color: theme.palette.categories.main }}>
                  {isLoading || isSyncing ? (
                    <span className="loading w80" />
                  ) : categories_length}
                </span>{' '}<strong>categories</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  transactions_length: PropTypes.number.isRequired,
  categories_length: PropTypes.number.isRequired,
  changes_length: PropTypes.number.isRequired,
  user: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
  categories: PropTypes.array.isRequired,
  goals: PropTypes.array.isRequired,
  isSyncing: PropTypes.bool.isRequired,
  selectedCurrency: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    categories: state.categories.list,
    transactions_length: state.transactions ? state.transactions.length : 0,
    categories_length: state.categories ? state.categories.list.length : 0,
    changes_length: state.changes ? state.changes.list.length : 0,
    goals: state.goals,
    user: state.user,
    isSyncing: state.state.isSyncing,
    selectedCurrency: state.currencies.find((c) => c.id === state.account.currency),
  };
};

export default connect(mapStateToProps)(withTheme()(withStyles(styles)(Dashboard)));