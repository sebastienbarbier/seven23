import React, {Component} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {Tabs, Tab} from 'material-ui/Tabs';

import muiThemeable from 'material-ui/styles/muiThemeable';
import lightTheme from '../themes/light';

import { Card } from 'material-ui/Card';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn}
  from 'material-ui/Table';

import {blue500, blue700, green700, red700, white, red50, green50} from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import NavigateBefore from 'material-ui/svg-icons/image/navigate-before';
import NavigateNext from 'material-ui/svg-icons/image/navigate-next';

import MonthLineBar from './charts/MonthLineBar';

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
      let dataLabel1 = new Map();
      let dataLabel2 = new Map();
      let range = n => [...Array(n).keys()];
      range(12).forEach((month) => {
        dataLabel1.set(moment([year, month]).format('MMM'), months[month] ? parseFloat(months[month].expenses.toFixed(2))*-1 : 0);
        dataLabel2.set(moment([year, month]).format('MMM'), months[month] ? parseFloat(months[month].incomes.toFixed(2)) : 0);
      });

      this.setState({
        isLoading: false,
        transactions: data.transactions,
        stats: data.stats,
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
      <div className="inlineContent">
        <header className="padding">
          <h2>Report { this.state.dateBegin.format('YYYY') }</h2>
          <IconButton
            tooltip={moment(this.state.dateBegin, 'YYYY').subtract(1, 'year').format('YYYY')}
            tooltipPosition="bottom-right"
            touch={false}
            onTouchTap={this._goYearBefore}><NavigateBefore /></IconButton>
          <IconButton
            tooltip={moment(this.state.dateEnd, 'YYYY').add(1, 'year').format('YYYY')}
            tooltipPosition="bottom-left"
            touch={false}
            onTouchTap={this._goYearNext}><NavigateNext /></IconButton>
          <Tabs
            tabItemContainerStyle={styles.tabs.rootElement}
            tabItemContainerStyle={styles.tabs.tabItemContainer}
            inkBarStyle={{backgroundColor: this.state.primaryColor}}>
            <Tab style={styles.tabs.rootElement} label="Full year" />
          </Tabs>
        </header>

        <div className="halfHeight separator">
          <MonthLineBar values={this.state.stats} />
        </div>
        <div className="row padding">
          <div className="thirdWidth">
            {
              this.state.isLoading ?
              <div style={styles.loading}>
              </div>
              :
              <article>
                <h3>Some statistics:</h3>
                <p>Transactions: { this.state.transactions.length }, Incomes: { CurrencyStore.format(this.state.stats.incomes) }, Expenses: { CurrencyStore.format(this.state.stats.expenses) }</p>
              </article>
            }
          </div>
          <div className="thirdWidth">
          </div>
          <div className="thirdWidth">
            {
              this.state.isLoading ?
              <div style={styles.loading}>
              </div>
              :
              <article>
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
              </article>
            }
          </div>
        </div>
      </div>
    );
  }
}

export default muiThemeable()(Dashboard);
