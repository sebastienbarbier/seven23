import React, {Component} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {Tabs, Tab} from 'material-ui/Tabs';
import {Link} from 'react-router-dom';

import muiThemeable from 'material-ui/styles/muiThemeable';
import lightTheme from '../themes/light';

import { Card, CardText } from 'material-ui/Card';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn}
  from 'material-ui/Table';

import {blue500, lightBlue700, lightBlue900, lightBlue800, green700, red700, white, red50, green500, red500, green50} from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import NavigateBefore from 'material-ui/svg-icons/image/navigate-before';
import NavigateNext from 'material-ui/svg-icons/image/navigate-next';
import DateRangeIcon from 'material-ui/svg-icons/action/date-range';
import TrendingDownIcon from 'material-ui/svg-icons/action/trending-down';
import TrendingFlatIcon from 'material-ui/svg-icons/action/trending-flat';
import TrendingUpIcon from 'material-ui/svg-icons/action/trending-up';
import CompareArrowsIcon from 'material-ui/svg-icons/action/compare-arrows';


import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

import MonthLineGraph from './charts/MonthLineGraph';
import PieGraph from './charts/PieGraph';

import AccountStore from '../stores/AccountStore';
import CurrencyStore from '../stores/CurrencyStore';
import CategoryStore from '../stores/CategoryStore';
import CategoryActions from '../actions/CategoryActions';
import TransactionActions from '../actions/TransactionActions';
import TransactionStore from '../stores/TransactionStore';

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
      color: 'black',
      paddingLeft: '20px',
      paddingRight: '20px'
    },
    tabItemContainer: {
      background: 'transparent'
    }
  },
  wrap: {
    flexWrap: 'wrap'
  }
};

class Dashboard extends Component {

  constructor(props, context) {
    super(props, context);
    let now = new Date();
    let year = now.getFullYear();
    if (props.match.params.year) {
       year = parseInt(props.match.params.year);
    }

    this.state = {
      stats: null,
      isLoading: true,
      categories: null,
      graph: null,
      trend: null,
      currentYear: null,
      menu: localStorage.getItem('dashboard') || 'LAST_12_MONTHS',
      primaryColor: props.muiTheme.palette.primary1Color,
      dateBegin: moment.utc().subtract(12, 'month').startOf('month'),
      dateEnd: moment.utc().subtract(1, 'month').endOf('month')
    };
    this.history = props.history;
    // Timer is a 300ms timer on read event to let color animation be smooth
    this.timer = null;
  }

  _updateData = (transactions) => {
    if (this.timer) {
      // calculate duration
      const duration = (new Date().getTime()) - this.timer;
      this.timer = null; // reset timer
      if (duration < 350) {
        setTimeout(() => {
          this._performUpdateData(transactions);
        }, 350 - duration);
      } else {
        this._performUpdateData(transactions);
      }
    } else {
      this._performUpdateData(transactions);
    }
  };

  _performUpdateData = (data) => {
    if (data &&
        data.transactions &&
        Array.isArray(data.transactions) &&
        this.state.dateBegin.isSame(data.dateBegin) &&
        this.state.dateEnd.isSame(data.dateEnd)) {

      // Get full year of data
      const year = data.dateBegin.getFullYear();
      let months = {};
      if (data.stats.perDates[year]) {
        months = data.stats.perDates[year].months;
      }

      // Order transactions by date and calculate sum for graph
      let range = n => [...Array(n).keys()]; // [0, ..., ... n-1]

      // Generate Graph data
      let lineExpenses = {
        color: 'red',
        values: []
      };

      let lineIncomes = {
        values: []
      };

      Object.keys(data.stats.perDates).forEach((year) => {
        // For each month of year
       Object.keys(data.stats.perDates[year].months).forEach((month) => {
          if (data.stats.perDates[year].months[month]) {
            lineExpenses.values.push({
              date: new Date(year, month),
              value: +data.stats.perDates[year].months[month].expenses * -1
            });
            lineIncomes.values.push({
              date: new Date(year, month),
              value: data.stats.perDates[year].months[month].incomes
            });
          } else {
            lineExpenses.values.push({ date: new Date(year, month), value: 0 });
            lineIncomes.values.push({ date: new Date(year, month), value: 0 });
          }
        });
      });

      let pie = [];

      this.setState({
        isLoading: false,
        stats: data.stats,
        trend: data.trend || this.state.trend,
        currentYear: data.currentYear || this.state.currentYear,
        graph: [lineIncomes, lineExpenses],
        perCategories: Object.keys(data.stats.perCategories).map((id) => {
          return {
            id: id,
            name: this.state.categories.find((category) => { return ''+category.id === ''+id; }).name,
            incomes: data.stats.perCategories[id].incomes,
            expenses: data.stats.perCategories[id].expenses
          };
        }).sort((a, b) => {
          return a.expenses > b.expenses ? 1 : -1;
        })
      });
    }
  };

  _goYearBefore = () => {
    this.history.push('/dashboard/'+ moment(this.state.dateBegin).subtract(1, 'year').format('YYYY') +'/');
  };

  _goYearNext = () => {
    this.history.push('/dashboard/'+ moment(this.state.dateEnd).add(1, 'year').format('YYYY') +'/');
  };

  _updateCategories = (categories) => {
    if (categories && Array.isArray(categories)) {
      this.setState({
        categories: categories
      });
    }
  };

  _updateAccount = () => {
    this.setState({
      transactions: null,
      isLoading: true,
      graph: null,
      trend: null,
      currentYear: null
    });

    CategoryStore.onceChangeListener(() => {
      TransactionActions.read({
        includeCurrentYear: true,
        includeTrend: true,
        dateBegin: this.state.dateBegin.toDate(),
        dateEnd: this.state.dateEnd.toDate()
      });
    });

    CategoryActions.read();

  };

  handleGraphClick = (date) => {
    this.history.push('/transactions/'+ date.getFullYear() +'/' + (+date.getMonth()+1) + '/');
  };

  handleChangeMenu = (event, index, value) => {

    localStorage.setItem('dashboard', value);
    this.setState({
      menu: value
    });

    let dateBegin = null;
    let dateEnd = null;

    switch(value){
      case 'LAST_12_MONTHS':
        dateBegin = moment.utc().subtract(12, 'month').startOf('month');
        dateEnd = moment.utc().subtract(1, 'month').endOf('month');
        break;
      case 'LAST_6_MONTHS':
        dateBegin = moment.utc().subtract(6, 'month').startOf('month');
        dateEnd = moment.utc().subtract(1, 'month').endOf('month');
        break;
      case 'LAST_3_MONTHS':
        dateBegin = moment.utc().subtract(3, 'month').startOf('month');
        dateEnd = moment.utc().subtract(1, 'month').endOf('month');
        break;
      case 'CURRENT_YEAR':
        dateBegin = moment.utc().startOf('year');
        dateEnd = moment.utc().endOf('year');
        break;
      case 'LAST_YEAR':
        dateBegin = moment.utc().subtract(1, 'year').startOf('year');
        dateEnd = moment.utc().subtract(1, 'year').endOf('year');
        break;
      case 'LAST_2_YEAR':
        dateBegin = moment.utc().subtract(1, 'year').startOf('year');
        dateEnd = moment.utc().endOf('year');
        break;
    }

    this.setState({
      isLoading: true,
      stats : null,
      dateBegin: dateBegin,
      dateEnd: dateEnd
    });

    TransactionActions.read({
      includeCurrentYear: event ? false : true,
      includeTrend:  event ? false : true,
      dateBegin: dateBegin.toDate(),
      dateEnd: dateEnd.toDate()
    });
  };

  componentWillReceiveProps(nextProps) {
    // Should no longer be an option
  }

  componentWillMount() {
    AccountStore.addChangeListener(this._updateAccount);
    TransactionStore.addChangeListener(this._updateData);
    CategoryStore.addChangeListener(this._updateCategories);
  }

  componentDidMount() {
    // Timout allow allow smooth transition in navigation
    this.timer = (new Date()).getTime();

    CategoryStore.onceChangeListener(() => {
      this.handleChangeMenu(null, null, this.state.menu);
    });

    CategoryActions.read();
  }

  componentWillUnmount() {
    AccountStore.removeChangeListener(this._updateAccount);
    TransactionStore.removeChangeListener(this._updateData);
    CategoryStore.removeChangeListener(this._updateCategories);
  }

  render() {
    return (
      <div className="maxWidth" key="content">
        <div className="column">

          <div className="triptych">
            <div className="item wrapperMetrics">
              <div>
                <h2>{ moment().utc().format('YYYY') }</h2>

                <div className="metrics">
                  <p><small>Incomes</small><br/>
                    <span style={{color: green500}}>
                    { !this.state.currentYear ? <span className="loading w120"></span> :
                      CurrencyStore.format(this.state.currentYear.incomes)
                    }
                    </span>
                  </p>
                  <p><small>Expenses</small><br/>
                    <span style={{color: red500}}>
                    { !this.state.currentYear ? <span className="loading w120"></span> :
                      CurrencyStore.format(this.state.currentYear.expenses)
                    }
                    </span>
                  </p>
                  <p><small>Balance</small><br/>
                    <span style={{color: blue500}}>
                    { !this.state.currentYear ? <span className="loading w120"></span> :
                      CurrencyStore.format(this.state.currentYear.expenses + this.state.currentYear.incomes)
                    }
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <h2>{ moment().utc().format('MMMM') }</h2>
                <div className="metrics">
                  <p><small>Incomes</small><br/>
                    <span style={{color: green500}}>
                    { !this.state.currentYear ? <span className="loading w120"></span> :
                      CurrencyStore.format(this.state.currentYear.currentMonth.incomes)
                    }
                    </span>
                  </p>
                  <p><small>Expenses</small><br/>
                    <span style={{color: red500}}>
                    { !this.state.currentYear ? <span className="loading w120"></span> :
                      CurrencyStore.format(this.state.currentYear.currentMonth.expenses)
                    }
                    </span>
                  </p>
                  <p><small>Balance</small><br/>
                    <span style={{color: blue500}}>
                    { !this.state.currentYear ? <span className="loading w120"></span> :
                      CurrencyStore.format(this.state.currentYear.currentMonth.expenses + this.state.currentYear.currentMonth.incomes)
                    }
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="item">
              <h2>Trend on 30 days</h2>
              <div className={ this.state.isLoading ? 'noscroll wrapper' : 'wrapper'}>
                <table style={{width: '100%'}}>
                  <tbody>
                    <tr>
                      <th></th>
                      <th style={{textAlign: 'center', paddingBottom: '4px'}} colSpan="3">
                        { moment().utc().subtract((30 * 2) + 2, 'days').startOf('day').format('MMM Do') } - { moment().utc().subtract(30 + 2, 'days').endOf('day').format('MMM Do') }
                        <CompareArrowsIcon style={{verticalAlign: 'bottom', padding: '0 8px'}}></CompareArrowsIcon>
                        { moment().utc().subtract(30 + 1, 'days').startOf('day').format('MMM Do')} - {moment().utc().subtract(1, 'days').endOf('day').format('MMM Do') }
                      </th>
                      <th></th>
                    </tr>
                    { this.state.trend ? this.state.trend.map((trend) => {
                          return (
                            <tr key={trend.id}>
                              <td><Link to={`/categories/${trend.id}`}>{ this.state.categories.find((category) => { return ''+category.id === ''+trend.id; }).name }</Link></td>
                              <td style={{textAlign: 'right'}}>{ CurrencyStore.format(trend.oldiest) }</td>
                              <td style={{textAlign: 'center'}}>
                              { !trend.earliest ? <span style={{color: green500}}><TrendingDownIcon style={{color: green500, verticalAlign: 'bottom', padding: '0 8px'}}></TrendingDownIcon></span> : '' }
                              { trend.earliest && trend.oldiest && trend.diff < 1 ? <span style={{color: green500}}><TrendingDownIcon style={{color: green500, verticalAlign: 'bottom', padding: '0 8px'}}></TrendingDownIcon></span> : '' }
                              { trend.earliest && trend.oldiest && trend.diff == 1 ? <span> <TrendingFlatIcon style={{color: blue500, verticalAlign: 'bottom', padding: '0 8px'}}></TrendingFlatIcon></span> : '' }
                              { trend.earliest && trend.oldiest && trend.diff > 1 ? <span style={{color: red500}}><TrendingUpIcon style={{color: red500, verticalAlign: 'bottom', padding: '0 8px'}}></TrendingUpIcon></span> : '' }
                              { !trend.oldiest ? <span style={{color: red500}}><TrendingUpIcon style={{color: red500, verticalAlign: 'bottom', padding: '0 8px'}}></TrendingUpIcon></span> : '' }
                              </td>
                              <td style={{textAlign: 'left'}}>{ CurrencyStore.format(trend.earliest) }</td>
                              <td style={{textAlign: 'right'}}>
                              { trend.earliest && trend.oldiest && trend.diff < 1 ? <span style={{color: green500}}> - { parseInt((trend.diff - 1) * 100 * -1) }%</span> : '' }
                              { trend.earliest && trend.oldiest && trend.diff == 1 ? <span style={{color: blue500}}> 0%</span> : '' }
                              { trend.earliest && trend.oldiest && trend.diff > 1 ? <span style={{color: red500}}> + { parseInt((trend.diff - 1) * 100) }%</span> : '' }
                              </td>
                            </tr>
                          )
                        }) : ['w120', 'w120', 'w80', 'w120', 'w80', 'w150', 'w80', 'w20', 'w120'].map((value, i) => {
                          return (
                            <tr key={i}>
                              <td><span className={'loading ' + value}></span></td>
                              <td style={{textAlign: 'right'}}><span className={'loading w30'}></span></td>
                              <td style={{textAlign: 'center'}}><span className={'loading w20'}></span></td>
                              <td style={{textAlign: 'left'}}><span className={'loading w30'}></span></td>
                              <td style={{textAlign: 'right'}}><span className={'loading w30'}></span></td>
                            </tr>
                          )
                        }) }
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="monolith stickyDashboard">
            <h2><DateRangeIcon style={{width: '38px', height: '36px', verticalAlign: 'middle', marginBottom: '10px', marginRight: '6px'}}></DateRangeIcon>{ this.state.dateBegin.format('MMMM Do, YYYY') } - { this.state.dateEnd.format('MMMM Do, YYYY') }</h2>
            <div>
              <DropDownMenu
                value={this.state.menu}
                onChange={this.handleChangeMenu}
                disabled={this.state.isLoading}
                selectedMenuItemStyle={{color: this.state.primaryColor}}>
                <MenuItem value="LAST_12_MONTHS" primaryText="Last 12 months" />
                <MenuItem value="LAST_6_MONTHS" primaryText="Last 6 months" />
                <MenuItem value="LAST_3_MONTHS" primaryText="Last 3 months" />
                <MenuItem value="CURRENT_YEAR" primaryText={ moment().utc().format('YYYY') } />
                <MenuItem value="LAST_YEAR" primaryText={ moment().utc().subtract(1, 'year').format('YYYY') } />
                <MenuItem value="LAST_2_YEAR" primaryText={`${moment().utc().subtract(1, 'year').format('YYYY')} - ${moment().utc().format('YYYY')}`} />
              </DropDownMenu>
            </div>
          </div>

          <div className="monolith separator">
              <div style={{fontSize: '1.1em', paddingTop: '10px', paddingBottom: ' 20px'}}>
                <p>Total <strong>income</strong> of <span style={{color: green500}}>{ this.state.isLoading ? <span className="loading w80"></span> : CurrencyStore.format(this.state.stats.incomes) }</span> for a total of <span style={{color: red500}}>{ this.state.isLoading ? <span className="loading w80"></span> : CurrencyStore.format(this.state.stats.expenses) }</span> in <strong>expenses</strong>, leaving a <strong>balance</strong> of <span style={{color: blue500}}>{ this.state.isLoading ? <span className="loading w80"></span> : CurrencyStore.format(this.state.stats.expenses + this.state.stats.incomes) }</span>.</p>
                <p>For this period of <span style={{color: blue500}}>{ this.state.isLoading ? <span className="loading w20"></span> : this.state.dateEnd.diff(this.state.dateBegin, 'month')+1 }</span> months, <strong>average monthly income</strong> is <span style={{color: green500}}>{ this.state.isLoading ? <span className="loading w80"></span> : CurrencyStore.format(this.state.stats.incomes / this.state.dateEnd.diff(this.state.dateBegin, 'month')) }</span> and <strong>average monthly expense</strong> is <span style={{color: red500}}>{ this.state.isLoading ? <span className="loading w80"></span> : CurrencyStore.format(this.state.stats.expenses / this.state.dateEnd.diff(this.state.dateBegin, 'month')) }</span>.</p>
              </div>
          </div>

          <div className="monolith separator">
            <div style={{ width: '100%' }}>
              <MonthLineGraph values={this.state.graph || []} onClick={this.handleGraphClick} ratio="50%" isLoading={this.state.isLoading} />
            </div>
          </div>

          <div className="camembert">
            <div className="item" style={{position: 'relative'}}>
                <div style={{position: 'absolute', top: '0', bottom: '0', left: '0', right: '0'}}>
                  <PieGraph values={this.state.perCategories || []} isLoading={this.state.isLoading}></PieGraph>
                </div>
            </div>
            <div className="item">
                <Card className={ this.state.isLoading ? 'noscroll card' : 'card'}>
                  <Table style={{background: 'none'}}>
                    <TableHeader
                      displaySelectAll={false}
                      adjustForCheckbox={false}>
                      <TableRow>
                        <TableHeaderColumn></TableHeaderColumn>
                        <TableHeaderColumn style={styles.amount}>Expenses</TableHeaderColumn>
                      </TableRow>
                    </TableHeader>
                    <TableBody
                      displayRowCheckbox={false}
                      showRowHover={true}
                      stripedRows={false}
                    >
                    { this.state.perCategories ? this.state.perCategories.map((item) => {
                        return (
                          <TableRow key={item.id}>
                            <TableRowColumn><Link to={`/categories/${item.id}`}>{ this.state.categories.find((category) => { return ''+category.id === ''+item.id; }).name }</Link></TableRowColumn>
                            <TableRowColumn style={styles.amount}>{ CurrencyStore.format(item.expenses) }</TableRowColumn>
                          </TableRow>
                        );
                      })
                    :
                    ['w120', 'w80', 'w120', 'w120', 'w120', 'w80', 'w120', 'w120'].map((value, i) => {
                      return (
                        <TableRow key={i}>
                          <TableRowColumn><span className={`loading ${value}`}></span></TableRowColumn>
                          <TableRowColumn style={styles.amount}><span className="loading w30"></span></TableRowColumn>
                        </TableRow>
                      )
                    })
                    }
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

export default muiThemeable()(Dashboard);
