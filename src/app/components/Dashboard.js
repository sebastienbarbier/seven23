import './Dashboard.scss';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';

import { withTheme } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';

import Card from '@material-ui/core/Card';
import SwipeableViews from 'react-swipeable-views';

import IconButton from '@material-ui/core/IconButton';
import Close from '@material-ui/icons/Close';

import red from '@material-ui/core/colors/red';
import blue from '@material-ui/core/colors/blue';
import green from '@material-ui/core/colors/green';


import MonthLineGraph from './charts/MonthLineGraph';

import GoalActions from '../actions/GoalActions';
import StatisticsActions from '../actions/StatisticsActions';

import GoalForm from './goals/GoalForm.js';

import UserButton from './settings/UserButton';
import Trends from './trends/TrendsView';

import { BalancedAmount, ColoredAmount } from './currency/Amount';

const styles = theme => ({
  card: {
    margin: '0 10px 20px 10px',
  }
});

// Todo: replace localStorage item dashboard with redux
class Dashboard extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      stats: null,
      isLoading: true,
      graph: null,
      trend7: null,
      trend30: null,
      openTrend: false,
      currentYear: null,
    };
    this.history = props.history;
    // Timer is a 300ms timer on read event to let color animation be smooth
    this.timer = null;
  }

  handleGraphClick = date => {
    // this.history.push(
    //   '/transactions/' +
    //     date.getFullYear() +
    //     '/' +
    //     (+date.getMonth() + 1) +
    //     '/',
    // );
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

  handleToggleTrend = (trend) => {
    this.setState({
      component: trend && trend.component ? trend.component : this.state.component,
      openTrend: !this.state.openTrend
    });
  }

  _handleChangeMenu = () => {

    this.setState({
      isLoading: true,
      stats: null,
      currentYear: null,
      trend7: null,
      trend30: null,
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
        trend7: result.trend7,
        trend30: result.trend30,
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
    if (this.props.accounts.length >= 1) {
      this._handleChangeMenu();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.accounts.length >= 1) {
      if (this.props.isSyncing != nextProps.isSyncing && nextProps.isSyncing === false) {
        this._handleChangeMenu();
      } else if (this.props.goals != nextProps.goals && nextProps.isSyncing === false) {
        this._handleChangeMenu();
      }
    }
  }

  render() {
    const { theme, selectedCurrency, isSyncing, transactions_length,
      categories_length, changes_length } = this.props;
    const { currentYear, isLoading, open, trend7, trend30, openTrend } = this.state;

    return (
      <div className="layout dashboard">
        <div className={'modalContent ' + (open ? 'open' : '')}>
          <Card square className="modalContentCard">{this.state.component}</Card>
        </div>
        <header className="layout_header showMobile">
          <div className="layout_header_top_bar">
            <h2>Dashboard</h2>
            <div className='showMobile'><UserButton history={this.history} type="button" color="white" /></div>
          </div>
        </header>
        <div className="layout_content">

          <div className={(openTrend ? 'open' : '') + ' trendModal'}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton
                onClick={this.handleToggleTrend}>
                <Close color="action" />
              </IconButton>
            </div>
            {this.state.component}
          </div>
          <div className="layout_dashboard layout_content wrapperMobile">
            <div className="column">
              <h2>Balance</h2>
              <SwipeableViews
                enableMouseEvents
                className="metrics"
                style={{ padding: '0 calc(100% - 300px) 0 10px' }}
                slideStyle={{ padding: '8px 5px' }}
              >
                <Card className="metric">
                  <h3 className="title">
                    {moment()
                      .utc()
                      .format('MMMM')}
                  </h3>
                  <div className="balance">
                    <p>
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
                  <div className="incomes_expenses">
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
                  </div>
                </Card>
                <Card className="metric">
                  <h3 className="title">
                    {moment()
                      .utc()
                      .format('YYYY')}
                  </h3>
                  <div className="balance">
                    <p>
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
                  <div className="incomes_expenses">
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
                  </div>
                </Card>
              </SwipeableViews>
              <div>
                <MonthLineGraph
                  values={this.state.graph || []}
                  onClick={this.handleGraphClick}
                  ratio="50%"
                  isLoading={isLoading || isSyncing}
                  color={theme.palette.text.primary}
                />
              </div>
            </div>

            <div className="column">
              <div>
                <h2>Trends</h2>
              </div>

              <Trends
                trend30={trend30}
                trend7={trend7}
                isLoading={isLoading || isSyncing}
                onOpenTrend={this.handleToggleTrend}
              />

              <div style={{ padding: '40px 20px 40px 20px', fontSize: '0.9rem' }}>
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
  profile: PropTypes.object.isRequired,
  accounts: PropTypes.array.isRequired,
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
    profile: state.user.profile,
    accounts: state.user.accounts,
  };
};

export default connect(mapStateToProps)(withTheme()(withStyles(styles)(Dashboard)));