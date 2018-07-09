import './Dashboard.scss';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import moment from 'moment';

import { withTheme } from '@material-ui/core/styles';

import Card from '@material-ui/core/Card';

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

let styles = {
  alignRight: {
    textAlign: 'right',
  },
  actions: {
    width: '20px',
  },
  loading: {
    textAlign: 'center',
    padding: '50px 0',
  },
  tabs: {
    rootElement: {
      paddingLeft: '20px',
      paddingRight: '20px',
    },
    tabItemContainer: {
      background: 'transparent',
    },
  },
  wrap: {
    flexWrap: 'wrap',
  },
};

class Dashboard extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      stats: null,
      isLoading: true,
      graph: null,
      trend: null,
      currentYear: null,
      menu: localStorage.getItem('dashboard') || 'LAST_12_MONTHS',
      dateStr: '',
      dateBegin: moment
        .utc()
        .subtract(12, 'month')
        .startOf('month'),
      dateEnd: moment
        .utc()
        .subtract(1, 'month')
        .endOf('month'),
    };
    this.history = props.history;
    // Timer is a 300ms timer on read event to let color animation be smooth
    this.timer = null;
  }

  _goYearBefore = () => {
    this.history.push(
      '/dashboard/' +
        moment(this.state.dateBegin)
          .subtract(1, 'year')
          .format('YYYY') +
        '/',
    );
  };

  _goYearNext = () => {
    this.history.push(
      '/dashboard/' +
        moment(this.state.dateEnd)
          .add(1, 'year')
          .format('YYYY') +
        '/',
    );
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

  _handleChangeMenu = (value, fetchData = true) => {
    localStorage.setItem('dashboard', value);
    this.setState({
      menu: value,
    });

    let dateBegin = null;
    let dateEnd = null;
    let dateStr = '';

    switch (value) {
    case 'LAST_12_MONTHS':
      dateBegin = moment
        .utc()
        .subtract(12, 'month')
        .startOf('month');
      dateEnd = moment
        .utc()
        .subtract(1, 'month')
        .endOf('month');
      dateStr = 'Last 12 months';
      break;
    case 'LAST_6_MONTHS':
      dateBegin = moment
        .utc()
        .subtract(6, 'month')
        .startOf('month');
      dateEnd = moment
        .utc()
        .subtract(1, 'month')
        .endOf('month');
      dateStr = 'Last 6 months';
      break;
    case 'LAST_3_MONTHS':
      dateBegin = moment
        .utc()
        .subtract(3, 'month')
        .startOf('month');
      dateEnd = moment
        .utc()
        .subtract(1, 'month')
        .endOf('month');
      dateStr = 'Last 3 months';
      break;
    case 'NEXT_YEAR':
      dateBegin = moment
        .utc()
        .add(1, 'year')
        .startOf('year');
      dateEnd = moment
        .utc()
        .add(1, 'year')
        .endOf('year');
      dateStr = moment().utc().add(1, 'year').format('YYYY');
      break;
    case 'CURRENT_YEAR':
      dateBegin = moment.utc().startOf('year');
      dateEnd = moment.utc().endOf('year');
      dateStr = moment().utc().format('YYYY');
      break;
    case 'LAST_YEAR':
      dateBegin = moment
        .utc()
        .subtract(1, 'year')
        .startOf('year');
      dateEnd = moment
        .utc()
        .subtract(1, 'year')
        .endOf('year');
      dateStr = moment().utc().subtract(1, 'year').format('YYYY');
      break;
    case 'LAST_2_YEAR':
      dateBegin = moment
        .utc()
        .subtract(1, 'year')
        .startOf('year');
      dateEnd = moment.utc().endOf('year');
      dateStr = `${moment().utc().subtract(1, 'year').format('YYYY')} - ${moment().utc().format('YYYY')}`;
      break;
    }

    this.setState({
      isLoading: true,
      stats: null,
      open: false,
      dateStr,
      dateBegin,
      dateEnd,
    });

    this._processData(dateBegin.toDate(), dateEnd.toDate());
  };

  _processData = (begin = this.state.dateBegin.toDate(), end = this.state.dateEnd.toDate()) => {
    const { dispatch, categories } = this.props;

    dispatch(StatisticsActions.dashboard(begin, end)).then((result) => {

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
    this._handleChangeMenu(this.state.menu);
  }

  render() {
    const { theme, selectedCurrency, categories } = this.props;
    const { anchorEl, open } = this.state;

    return (
      <div className="maxWidth" key="content">
        <div className="column">
          <div className="triptych">
            <div className="item wrapperMetrics">
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
                      {!this.state.currentYear ? (
                        <span className="loading w120" />
                      ) : (
                        <ColoredAmount value={this.state.currentYear.incomes} currency={selectedCurrency} />
                      )}
                    </span>
                  </p>
                  <p>
                    <small>Expenses</small>
                    <br />
                    <span style={{ color: red[500] }}>
                      {!this.state.currentYear ? (
                        <span className="loading w120" />
                      ) : (
                        <ColoredAmount value={this.state.currentYear.expenses} currency={selectedCurrency} />
                      )}
                    </span>
                  </p>
                  <p>
                    <small>Balance</small>
                    <br />
                    <span style={{ color: blue[500] }}>
                      {!this.state.currentYear ? (
                        <span className="loading w120" />
                      ) : (
                        <BalancedAmount value={this.state.currentYear.expenses +
                            this.state.currentYear.incomes} currency={selectedCurrency} />
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
                      {!this.state.currentYear ? (
                        <span className="loading w120" />
                      ) : (
                        <ColoredAmount value={this.state.currentYear.currentMonth.incomes} currency={selectedCurrency} />
                      )}
                    </span>
                  </p>
                  <p>
                    <small>Expenses</small>
                    <br />
                    <span style={{ color: red[500] }}>
                      {!this.state.currentYear ? (
                        <span className="loading w120" />
                      ) : (
                        <ColoredAmount value={this.state.currentYear.currentMonth.expenses} currency={selectedCurrency} />
                      )}
                    </span>
                  </p>
                  <p>
                    <small>Balance</small>
                    <br />
                    <span style={{ color: blue[500] }}>
                      {!this.state.currentYear ? (
                        <span className="loading w120" />
                      ) : (
                        <BalancedAmount value={this.state.currentYear.currentMonth.expenses +
                            this.state.currentYear.currentMonth.incomes} currency={selectedCurrency} />
                      )}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="item">
              <h2>Trend on 30 days</h2>
              <div
                className={
                  this.state.isLoading ? 'noscroll wrapper' : 'wrapper'
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
                    {this.state.trend
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
                                      padding: '0 8px',
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
                                        padding: '0 8px',
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
                                        padding: '0 8px',
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
                                        padding: '0 8px',
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
                                      padding: '0 8px',
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
          </div>

          <div className="monolith stickyDashboard">
            <h2>
              <DateRangeIcon
                style={{
                  width: '38px',
                  height: '36px',
                  verticalAlign: 'middle',
                  marginBottom: '10px',
                  marginRight: '6px',
                }}
              />
              {this.state.dateBegin.format('MMMM Do, YYYY')} -{' '}
              {this.state.dateEnd.format('MMMM Do, YYYY')}
            </h2>
            <div>
              <Button
                ref={node => {
                  this.target1 = node;
                }}
                aria-owns={open ? 'menu-list-grow' : null}
                aria-haspopup="true"
                onClick={(event) => this.setState({ open: true, anchorEl: event.currentTarget })}
              >
                { this.state.dateStr }
                <ExpandMore color="action" />
              </Button>
              <Menu
                id="long-menu"
                anchorEl={anchorEl}
                open={Boolean(open)}
                value={this.state.menu}
                onClose={_ => this.setState({ open: false })}
                PaperProps={{
                  style: {
                    maxHeight: 48 * 4.5,
                    width: 200,
                  },
                }}
              >
                <MenuItem onClick={() => this._handleChangeMenu('LAST_12_MONTHS')}>Last 12 months</MenuItem>
                <MenuItem onClick={() => this._handleChangeMenu('LAST_6_MONTHS')}>Last 6 months</MenuItem>
                <MenuItem onClick={() => this._handleChangeMenu('LAST_3_MONTHS')}>Last 3 months</MenuItem>
                <MenuItem
                  onClick={() => this._handleChangeMenu('NEXT_YEAR')}
                >{moment().utc().add(1, 'year').format('YYYY')}</MenuItem>
                <MenuItem
                  onClick={() => this._handleChangeMenu('CURRENT_YEAR')}
                >{moment().utc().format('YYYY')}</MenuItem>
                <MenuItem
                  onClick={() => this._handleChangeMenu('LAST_YEAR')}
                >{moment().utc().subtract(1, 'year').format('YYYY')}</MenuItem>
                <MenuItem
                  onClick={() => this._handleChangeMenu('LAST_2_YEAR')}
                >{`${moment().utc().subtract(1, 'year').format('YYYY')} - ${moment().utc().format('YYYY')}`}</MenuItem>
              </Menu>
            </div>
          </div>

          <div className="monolith separator">
            <div
              style={{
                fontSize: '1.1em',
                paddingTop: '10px',
                paddingBottom: ' 20px',
              }}
            >
              <p>
                Total <strong>income</strong> of{' '}
                <span style={{ color: green[500] }}>
                  {this.state.isLoading ? (
                    <span className="loading w80" />
                  ) : (
                    <Amount value={this.state.stats.incomes} currency={selectedCurrency} />
                  )}
                </span>{' '}
                for a total of{' '}
                <span style={{ color: red[500] }}>
                  {this.state.isLoading ? (
                    <span className="loading w80" />
                  ) : (
                    <Amount value={this.state.stats.expenses} currency={selectedCurrency} />
                  )}
                </span>{' '}
                in <strong>expenses</strong>, leaving a <strong>balance</strong>{' '}
                of{' '}
                <span style={{ color: blue[500] }}>
                  {this.state.isLoading ? (
                    <span className="loading w80" />
                  ) : (
                    <Amount value={this.state.stats.expenses + this.state.stats.incomes} currency={selectedCurrency} />
                  )}
                </span>.
              </p>
              <p>
                For this period of{' '}
                <span style={{ color: blue[500] }}>
                  {this.state.isLoading ? (
                    <span className="loading w20" />
                  ) : (
                    this.state.dateEnd.diff(this.state.dateBegin, 'month') + 1
                  )}
                </span>{' '}
                months, <strong>average monthly income</strong> is{' '}
                <span style={{ color: green[500] }}>
                  {this.state.isLoading ? (
                    <span className="loading w80" />
                  ) : (
                    <Amount value={this.state.stats.incomes /
                      (this.state.dateEnd.diff( this.state.dateBegin, 'month', ) + 1)}
                    currency={selectedCurrency} />
                  )}
                </span>{' '}
                and <strong>average monthly expense</strong> is{' '}
                <span style={{ color: red[500] }}>
                  {this.state.isLoading ? (
                    <span className="loading w80" />
                  ) : (
                    <Amount value={this.state.stats.expenses /
                      (this.state.dateEnd.diff( this.state.dateBegin, 'month', ) + 1)}
                    currency={selectedCurrency} />
                  )}
                </span>.
              </p>
            </div>
          </div>

          <div className="monolith separator">
            <div style={{ width: '100%' }}>
              <MonthLineGraph
                values={this.state.graph || []}
                onClick={this.handleGraphClick}
                ratio="50%"
                isLoading={this.state.isLoading}
                color={theme.palette.text.primary}
              />
            </div>
          </div>

          <div className="camembert">
            <div className="item" style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  top: '0',
                  bottom: '0',
                  left: '0',
                  right: '0',
                }}
              >
                <PieGraph
                  values={this.state.perCategories || []}
                  isLoading={this.state.isLoading}
                />
              </div>
            </div>
            <div className="item">
              <Card className={this.state.isLoading ? 'noscroll card' : 'card'}>
                <Table style={{ background: 'none' }}>
                  <TableHead
                  >
                    <TableRow>
                      <TableCell />
                      <TableCell style={styles.amount}>
                        Expenses
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.perCategories
                      ? this.state.perCategories.map(item => {
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Link to={`/categories/${item.id}`}>
                                {
                                  categories.find(category => {
                                    return '' + category.id === '' + item.id;
                                  }).name
                                }
                              </Link>
                            </TableCell>
                            <TableCell style={styles.amount}>
                              <Amount value={item.expenses} currency={selectedCurrency} />
                            </TableCell>
                          </TableRow>
                        );
                      })
                      : [
                        'w120',
                        'w80',
                        'w120',
                        'w120',
                        'w120',
                        'w80',
                        'w120',
                        'w120',
                      ].map((value, i) => {
                        return (
                          <TableRow key={i}>
                            <TableCell>
                              <span className={`loading ${value}`} />
                            </TableCell>
                            <TableCell style={styles.amount}>
                              <span className="loading w30" />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Dashboard.propTypes = {
  theme: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  categories: PropTypes.array.isRequired,
  selectedCurrency: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    categories: state.categories.list,
    selectedCurrency: state.currencies.find((c) => c.id === state.account.currency)
  };
};

export default connect(mapStateToProps)(withTheme()(Dashboard));
