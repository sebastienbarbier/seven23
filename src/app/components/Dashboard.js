import React, {Component} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {Tabs, Tab} from 'material-ui/Tabs';

import muiThemeable from 'material-ui/styles/muiThemeable';
import lightTheme from '../themes/light';

import { Card, CardText } from 'material-ui/Card';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn}
  from 'material-ui/Table';

import {blue500, lightBlue700, lightBlue900, lightBlue800, green700, red700, white, red50, green500, red500, green50} from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import NavigateBefore from 'material-ui/svg-icons/image/navigate-before';
import NavigateNext from 'material-ui/svg-icons/image/navigate-next';

import MonthLineGraph from './charts/MonthLineGraph';

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
  metrics: {
    display: 'flex',
    fontSize: '1.4em'
  },
  metricsContent: {
    flex: '33%',
    textAlign: 'center',
    fontSize: '1.9em',
    fontWeight: '200'
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
      transactions: null,
      isLoading: true,
      categories: null,
      graph: [],
      primaryColor: props.muiTheme.palette.primary1Color,
      dateBegin: moment.utc([year]).startOf('year'),
      dateEnd: moment.utc([year]).endOf('year')
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
        range(12).forEach((month) => {
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

      this.setState({
        isLoading: false,
        transactions: data.transactions,
        stats: data.stats,
        graph: [lineIncomes, lineExpenses],
        perCategories: Object.keys(data.stats.perCategories).map((id) => {
          return {
            id: id,
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
      categories: null,
      isLoading: true
    });

    CategoryActions.read();

    TransactionActions.read({
      dateBegin: this.state.dateBegin.toDate(),
      dateEnd: this.state.dateEnd.toDate()
    });
  };

  componentWillReceiveProps(nextProps) {
    let year =
      nextProps.match.params.year ?
      parseInt(nextProps.match.params.year) :
      (new Date()).getFullYear();

    const dateBegin = moment.utc(year, 'YYYY').startOf('year');
    const dateEnd = moment.utc(year, 'YYYY').endOf('year');

    this.setState({
      isLoading: true,
      stats : null,
      dateBegin: dateBegin,
      dateEnd: dateEnd,
      primaryColor: nextProps.muiTheme.palette.primary1Color
    });

    TransactionActions.read({
      dateBegin: dateBegin.toDate(),
      dateEnd: dateEnd.toDate()
    });
  }

  componentWillMount() {
    AccountStore.addChangeListener(this._updateAccount);
    TransactionStore.addChangeListener(this._updateData);
    CategoryStore.addChangeListener(this._updateCategories);
  }

  componentDidMount() {
    // Timout allow allow smooth transition in navigation
    this.timer = (new Date()).getTime();

    CategoryActions.read();
    TransactionActions.read({
      dateBegin: this.state.dateBegin.toDate(),
      dateEnd: this.state.dateEnd.toDate()
    });
  }

  componentWillUnmount() {
    AccountStore.removeChangeListener(this._updateAccount);
    TransactionStore.removeChangeListener(this._updateData);
    CategoryStore.removeChangeListener(this._updateCategories);
  }

  render() {
    return (
      <div key="content" className="columnContent">
        <div className="column">
          <Card className="card">
            <div className="cardContainer">
              <header className="padding">
                <h2>Report { this.state.dateBegin.format('YYYY') }</h2>
                <IconButton
                  tooltip={moment(this.state.dateBegin, 'YYYY').subtract(1, 'year').format('YYYY')}
                  tooltipPosition="bottom-right"
                  touch={false}
                  iconStyle={{color: white}}
                  onTouchTap={this._goYearBefore}><NavigateBefore /></IconButton>
                <IconButton
                  tooltip={moment(this.state.dateEnd, 'YYYY').add(1, 'year').format('YYYY')}
                  tooltipPosition="bottom-left"
                  touch={false}
                  iconStyle={{color: white}}
                  onTouchTap={this._goYearNext}><NavigateNext /></IconButton>
              </header>
            </div>
          </Card>

          <div className="row" style={{padding: '0px 0px 20px 0'}}>
            <Card style={{ width: '100%' }}>
              {
              this.state.isLoading ?
              <div style={styles.loading}>
              </div>
              :
              <div style={styles.metrics}>
                <p style={styles.metricsContent}><span style={{color: green500}}>{ CurrencyStore.format(this.state.stats.incomes) }</span></p>
                <p style={styles.metricsContent}><span style={{color: red500}}>{ CurrencyStore.format(this.state.stats.expenses) }</span></p>
                <p style={styles.metricsContent}><span style={{color: blue500}}>{ CurrencyStore.format(this.state.stats.expenses + this.state.stats.incomes) }</span></p>
              </div>
              }
            </Card>
          </div>

          <div className="row" style={{padding: '0px 0px 20px 0'}}>
            <Card style={{ width: '100%' }}>
              <CardText style={{ height: '50vh' }}>
                <MonthLineGraph values={this.state.graph} />
              </CardText>
            </Card>
          </div>

          <div className="row padding" style={{padding: '0px 0px 20px 0'}}>
            <div className="thirdWidth">
            </div>
            <div className="thirdWidth">
            </div>
            <div className="thirdWidth">
              {
                this.state.isLoading ?
                <div style={styles.loading}>
                </div>
                :
                <Card>
                  <Table style={{background: 'none'}}>
                    <TableHeader
                      displaySelectAll={false}
                      adjustForCheckbox={false}>
                      <TableRow>
                        <TableHeaderColumn>Category</TableHeaderColumn>
                        <TableHeaderColumn style={styles.amount}>Expenses</TableHeaderColumn>
                      </TableRow>
                    </TableHeader>
                    <TableBody
                      displayRowCheckbox={false}
                      showRowHover={true}
                      stripedRows={false}
                    >
                    { this.state.perCategories.map((item) => {
                      return (
                        <TableRow key={item.id}>
                          <TableRowColumn>{ this.state.categories.find((category) => { return ''+category.id === ''+item.id; }).name }</TableRowColumn>
                          <TableRowColumn style={styles.amount}>{ CurrencyStore.format(item.expenses) }</TableRowColumn>
                        </TableRow>
                      );
                    })
                    }
                    </TableBody>
                  </Table>
                </Card>
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default muiThemeable()(Dashboard);
