import React, { Component } from 'react';
import moment from 'moment';

import { Card } from 'material-ui/Card';
import CircularProgress from 'material-ui/CircularProgress';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn}
  from 'material-ui/Table';

import {blue500, blue700, green700, red700, white, red50, green50} from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import NavigateBefore from 'material-ui/svg-icons/image/navigate-before';
import NavigateNext from 'material-ui/svg-icons/image/navigate-next';

import TransactionChartMonthlySum from './transactions/charts/TransactionChartMonthlySum';

import AccountStore from '../stores/AccountStore';
import CurrencyStore from '../stores/CurrencyStore';
import CategoryStore from '../stores/CategoryStore';
import CategoryActions from '../actions/CategoryActions';
import TransactionActions from '../actions/TransactionActions';
import TransactionStore from '../stores/TransactionStore';

const styles = {
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
};

class Dashboard extends Component {

  constructor(props, context) {
    super(props, context);
    let now = new Date();
    this.state = {
      transactions: null,
      isLoading: true,
      categories: null,
      year: props.params.year ? parseInt(props.params.year) : now.getFullYear(),
    };
    this.context = context;
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

  _performUpdateData = (transactions) => {
    if (transactions && Array.isArray(transactions)) {

      let dailyExpensesIndexed = {};
      let dailyIncomesIndexed = {};
      let categories = [];
      let income = 0;
      let outcome = 0;

      // Generate dailyExpensesIndexed and categories data set
      transactions.forEach((transaction) => {

        const month = transaction.date.getUTCFullYear() + '-' + ("0" + (transaction.date.getUTCMonth()+1)).slice(-2);

        if (transaction.amount <= 0) {
          outcome += transaction.amount;

          if (!dailyExpensesIndexed[month]) {
            dailyExpensesIndexed[month] = 0;
          }
          dailyExpensesIndexed[month] += transaction.amount;
          // Update price per category
          if (transaction.category) {
            if (!categories[transaction.category]) {
              categories[transaction.category] = 0;
            }
            categories[transaction.category] += transaction.amount;
          }
        } else {
          income += transaction.amount;

          if (!dailyIncomesIndexed[month]) {
            dailyIncomesIndexed[month] = 0;
          }
          dailyIncomesIndexed[month] += transaction.amount;
        }
      });

      // Order transactions by date and calculate sum for graph
      let dataLabel1 = new Map();
      Object.keys(dailyExpensesIndexed).sort((a, b) => { return a < b ? -1 : 1; }).forEach((day) => {
        dataLabel1.set(moment(day, 'YYYY-MM').format('MMM'), parseFloat(dailyExpensesIndexed[day].toFixed(2))*-1);
      });

      let dataLabel2 = new Map();
      Object.keys(dailyIncomesIndexed).sort((a, b) => { return a < b ? -1 : 1; }).forEach((day) => {
        dataLabel2.set(moment(day, 'YYYY-MM').format('MMM'), parseFloat(dailyIncomesIndexed[day].toFixed(2)));
      });

      let graph = {
        type: 'line',
        data: {
          labels: [...dataLabel1.keys()],
          datasets: [{
            label: CurrencyStore.getIndexedCurrencies()[CurrencyStore.getSelectedCurrency()].name,
            data: [...dataLabel1.values()],
            borderColor: red700,
            borderWidth: 2,
            backgroundColor: red50,
            fill: false
          },{
            label: CurrencyStore.getIndexedCurrencies()[CurrencyStore.getSelectedCurrency()].name,
            data: [...dataLabel2.values()],
            borderColor: green700,
            borderWidth: 2,
            backgroundColor: green50,
            fill: false
          }]
        },
        options: {
          legend: {
            display: false,
          },
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero:true
              }
            }]
          }
        }
      };

      this.setState({
        isLoading: false,
        graph: graph,
        transactions: transactions,
        outcome: outcome,
        income: income,
        categoriesSummed: Object.keys(categories).map((id) => {
          return {category: id, amount: categories[id]};
        }).sort((a, b) => {
          return a.amount > b.amount ? 1 : -1;
        })
      });
    }
  };

  _goYearBefore = () => {
    this.context.router.push('/dashboard/'+ (parseInt(this.state.year) - 1) +'/');
  };

  _goYearNext = () => {
    this.context.router.push('/dashboard/'+ (parseInt(this.state.year) + 1) +'/');
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
      dateBegin: moment.utc(this.state.year, 'YYYY').startOf('year').toDate(),
      dateEnd: moment.utc(this.state.year, 'YYYY').endOf('year').toDate()
    });
  };

  componentWillReceiveProps(nextProps) {
    let now = new Date();
    let year = nextProps.params.year ? parseInt(nextProps.params.year) : now.getFullYear();
    this.setState({
      year: year,
      isLoading: true,
    });

    TransactionActions.read({
      dateBegin: moment.utc(year, 'YYYY').startOf('year').toDate(),
      dateEnd: moment.utc(year, 'YYYY').endOf('year').toDate()
    });
  }

  componentWillMount() {
    AccountStore.addChangeListener(this._updateAccount);
    CurrencyStore.addChangeListener(this._updateData);
    TransactionStore.addChangeListener(this._updateData);
    CategoryStore.addChangeListener(this._updateCategories);
  }

  componentDidMount() {
    // Timout allow allow smooth transition in navigation
    this.timer = (new Date()).getTime();

    CategoryActions.read();
    TransactionActions.read({
      dateBegin: moment.utc(this.state.year, 'YYYY').startOf('year').toDate(),
      dateEnd: moment.utc(this.state.year, 'YYYY').endOf('year').toDate()
    });
  }

  componentWillUnmount() {
    AccountStore.removeChangeListener(this._updateAccount);
    CurrencyStore.removeChangeListener(this._updateData);
    TransactionStore.removeChangeListener(this._updateData);
    CategoryStore.removeChangeListener(this._updateCategories);
  }


  render() {
    return (
      <div>
        <div className="dashboardLayout">
          <Card className="graph">
            <div className="columnHeader">
              <header className="primaryColorBackground small">
                <h1 style={styles.headerTitle}>Dashboard - { this.state.year }</h1>
                <div className="navigationButtons">
                  <IconButton
                    tooltip={moment(this.state.year, 'YYYY').subtract(1, 'year').format('YYYY')}
                    tooltipPosition="bottom-right"
                    touch={false}
                    className="previous"
                    onTouchTap={this._goYearBefore}><NavigateBefore color={white} /></IconButton>
                  <IconButton
                    tooltip={moment(this.state.year, 'YYYY').add(1, 'year').format('YYYY')}
                    tooltipPosition="bottom-left"
                    touch={false}
                    className="next"
                    onTouchTap={this._goYearNext}><NavigateNext color={white} /></IconButton>
                </div>
              </header>
              {
                this.state.isLoading ?
                <div style={styles.loading}>
                  <CircularProgress />
                </div>
                :
                <article>
                  <TransactionChartMonthlySum config={this.state.graph}></TransactionChartMonthlySum>
                </article>
              }
            </div>
          </Card>
          <Card className="stats">
            <div className="columnHeader">
              <header className="primaryColorBackground small">
                <h1 style={styles.headerTitle}>Stats</h1>
              </header>
              {
                this.state.isLoading ?
                <div style={styles.loading}>
                  <CircularProgress />
                </div>
                :
                <article>
                  <div className="indicators">
                    <div className="total">
                      <h6>Transactions</h6>
                      <p>{ this.state.transactions.length }</p>
                    </div>
                    <div className="income">
                      <h6>Income</h6>
                      <p>{ CurrencyStore.format(this.state.income) }</p>
                    </div>
                    <div className="outcome">
                      <h6>Outcome</h6>
                      <p>{ CurrencyStore.format(this.state.outcome) }</p>
                    </div>
                  </div>
                </article>
              }
            </div>
          </Card>
          <Card className="stats">
            <div className="columnHeader">
              <header className="primaryColorBackground small">
                <h1 style={styles.headerTitle}>Categories</h1>
              </header>
              {
                this.state.isLoading ?
                <div style={styles.loading}>
                  <CircularProgress />
                </div>
                :
                <article>
                  <Table>
                    <TableHeader
                      displaySelectAll={false}
                      adjustForCheckbox={false}>
                      <TableRow>
                        <TableHeaderColumn>Category</TableHeaderColumn>
                        <TableHeaderColumn style={styles.amount}>Amount</TableHeaderColumn>
                      </TableRow>
                    </TableHeader>
                    <TableBody
                      displayRowCheckbox={false}
                      showRowHover={true}
                      stripedRows={false}
                    >
                    { this.state.categoriesSummed.map((item) => {
                      return (
                          <TableRow key={item.category}>
                            <TableRowColumn>{ this.state.categories.find((category) => { return ''+category.id === ''+item.category; }).name }</TableRowColumn>
                            <TableRowColumn style={styles.amount}>{ CurrencyStore.format(item.amount) }</TableRowColumn>
                          </TableRow>
                      );
                    })
                    }
                    </TableBody>
                  </Table>
                </article>
              }
            </div>
          </Card>
        </div>
      </div>
    );
  }
}

// Inject router in context
Dashboard.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default Dashboard;
