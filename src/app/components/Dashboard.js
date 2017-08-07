import React, { Component } from 'react';
import moment from 'moment';

import { Card } from 'material-ui/Card';
import CircularProgress from 'material-ui/CircularProgress';

import {blue500, blue700, white} from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import NavigateBefore from 'material-ui/svg-icons/image/navigate-before';
import NavigateNext from 'material-ui/svg-icons/image/navigate-next';

import TransactionChartMonthlySum from './transactions/charts/TransactionChartMonthlySum';
import CurrencyStore from '../stores/CurrencyStore';
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
      isLoading: true,
      year: props.params.year ? parseInt(props.params.year) : now.getFullYear(),
    };
    this.context = context;
  }

  _updateData = (transactions) => {
    if (transactions && Array.isArray(transactions)) {

      let dailyExpensesIndexed = {};
      let categories = [];
      let income = 0;
      let outcome = 0;

      // Generate dailyExpensesIndexed and categories data set
      transactions.forEach((transaction) => {

        if (transaction.amount <= 0) {
          outcome += transaction.amount;
        } else {
          income += transaction.amount;
        }
        if (transaction.amount <= 0) {
          if (!dailyExpensesIndexed[transaction.date.slice(0, 7)]) {
            dailyExpensesIndexed[transaction.date.slice(0, 7)] = 0;
          }
          if (transaction.amount <= 0) {
            dailyExpensesIndexed[transaction.date.slice(0, 7)] += transaction.amount;
            // Update price per category
            if (transaction.category) {
              if (!categories[transaction.category]) {
                categories[transaction.category] = 0;
              }
              categories[transaction.category] += transaction.amount;
            }
          }
        }
      });

      // Order transactions by date and calculate sum for graph
      let dataLabel = new Map();
      Object.keys(dailyExpensesIndexed).sort((a, b) => { return a < b ? -1 : 1; }).forEach((day) => {
        dataLabel.set(moment(day, 'YYYY-MM').format('MMM'), parseFloat(dailyExpensesIndexed[day].toFixed(2))*-1);
      });

      let graph = {
        type: 'line',
        data: {
          labels: [...dataLabel.keys()],
          datasets: [{
            label: CurrencyStore.getIndexedCurrencies()[CurrencyStore.getSelectedCurrency()].name,
            data: [...dataLabel.values()],
            borderColor: blue700,
            borderWidth: 1
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
        }),
        snackbar: {
          open: false,
          message: '',
        }
      });
    }
  };

  _goYearBefore = () => {
    this.context.router.push('/dashboard/'+ (parseInt(this.state.year) - 1) +'/');
  };

  _goYearNext = () => {
    this.context.router.push('/dashboard/'+ (parseInt(this.state.year) + 1) +'/');
  };

  componentWillReceiveProps(nextProps) {
    let now = new Date();
    let year = nextProps.params.year ? parseInt(nextProps.params.year) : now.getFullYear();
    this.setState({
      year: year,
      isLoading: true,
    });
    TransactionActions.read({
      year: year
    });
  }

  componentWillMount() {
    TransactionStore.addChangeListener(this._updateData);
  }

  componentDidMount() {
    // Timout allow allow smooth transition in navigation
    setTimeout(() => {
      // CategoryActions.read();
      TransactionActions.read({
        year: this.state.year
      });
    }, 350);
  }

  componentWillUnmount() {
    TransactionStore.removeChangeListener(this._updateData);
  }


  render() {
    return (
      <div>
        <div className="dashboardLayout">
          <Card className="graph">
            <div className="columnHeader">
              <header className="primaryColorBackground small">
                <h1 style={styles.headerTitle}>{ this.state.year }</h1>
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
