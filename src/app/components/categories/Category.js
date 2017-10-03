import React, {Component} from 'react';
import moment from 'moment';
import {Card, CardText} from 'material-ui/Card';

import CircularProgress from 'material-ui/CircularProgress';

import IconButton from 'material-ui/IconButton';
import NavigateBefore from 'material-ui/svg-icons/image/navigate-before';

import {green500, green600, white} from 'material-ui/styles/colors';

import AccountStore from '../../stores/AccountStore';
import CategoryStore from '../../stores/CategoryStore';
import CategoryActions from '../../actions/CategoryActions';
import CurrencyStore from '../../stores/CurrencyStore';
import TransactionStore from '../../stores/TransactionStore';
import TransactionActions from '../../actions/TransactionActions';

import TransactionTable from '../transactions/TransactionTable';
import TransactionChartMonthlySum from '../transactions/charts/TransactionChartMonthlySum';

const styles = {
  loading: {
    textAlign: 'center',
    padding: '50px 0',
  },
  button: {
    float: 'right',
    marginTop: '12px',
  },
  card: {
    width: '400px',
  },
  actions: {
    width: '30px',
  }
};

class Category extends Component {

  constructor(props, context) {
    super(props, context);
    this.history = props.history;
    this.state = {
      id: props.match.params.id,
      category: null,
      transactions: new Set(),
      stats: {},
      counter: 0,
      graph: {},
      loading: true,
      selectedTransaction: {},
      open: false,
      snackbar: {
        open: false,
        message: ''
      },
    };
    this.context = context;
  }

  updateCategory = (category) => {
    if (category && !Array.isArray(category)) {
      this.setState({
        category: category,
      });
    }
  };

  updateTransaction = () => {
    this.setState({
      loading: true,
      open: false,
    });
    TransactionActions.read({
      category: this.state.id
    });
  };

  changeTransactions = (args) => {
    if (args && Array.isArray(args)) {
      let statsIndexed = {};
      // For each transaction, we clean data and
      args.forEach((transaction) => {
        // Format date
        let dateObject = new Date(transaction.date);

        // Count per month
        if (!statsIndexed[dateObject.getFullYear()]) {
          statsIndexed[dateObject.getFullYear()] = {};
        }
        if (!statsIndexed[dateObject.getFullYear()][dateObject.getMonth()+1]) {
          statsIndexed[dateObject.getFullYear()][dateObject.getMonth()+1] = {
            counter: 0,
            sum: 0,
          };
        }
        var month = statsIndexed[dateObject.getFullYear()][dateObject.getMonth()+1];
        month.counter++;
        month.sum += transaction.amount;
      });

      // Generate array
      let statsList = [];
      let data = new Map();

      Object.keys(statsIndexed).forEach((year) => {
        Object.keys(statsIndexed[year]).forEach((month) => {
          statsList.push({
            date: year+'-'+month,
            sum: statsIndexed[year][month].sum,
          });
          data.set(moment(year+'-'+month, 'YYYY-MM').format('MMM YYYY'), parseFloat(statsIndexed[year][month].sum.toFixed(2))*-1);
        });
      });

      // Config graph
      let graph = {
        type: 'line',
        data: {
          labels: [...data.keys()],
          datasets: [
            {
              label: CurrencyStore.getIndexedCurrencies()[CurrencyStore.getSelectedCurrency()].name,
              fill: false,
              lineTension: 0.1,
              backgroundColor: green500,
              borderColor: green500,
              borderCapStyle: 'butt',
              borderDash: [],
              borderDashOffset: 0.0,
              borderJoinStyle: 'miter',
              pointBorderColor: green500,
              pointBackgroundColor: '#fff',
              pointBorderWidth: 2,
              pointHoverRadius: 5,
              pointHoverBackgroundColor: green500,
              pointHoverBorderColor: green500,
              pointHoverBorderWidth: 2,
              pointRadius: 2,
              pointHitRadius: 10,
              data: [...data.values()],
              spanGaps: false,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            display: false,
          },
        }
      };

      this.setState({
        loading: false,
        open: false,
        stats: statsList,
        graph: graph,
        transactions: args,
      });
    }
  };

  updateAccount = (args) => {
    this.setState({
      loading: true,
      open: false,
    });
    TransactionActions.read({
      category: this.state.id
    });
  };

  _deleteData = (deletedItem) => {
    let list = this.state.transactions.filter((item) => { return item.id != deletedItem.id });
    this.setState({
      transactions: list,
    });
    this.changeTransactions(list);
  };

  componentWillReceiveProps(nextProps) {
    window.scrollTo(0, 0);

    this.setState({
      id: nextProps.match.params.id,
      category: null,
      transactions: new Set(),
      stats: {},
      counter: 0,
      open: false,
      loading: true,
    });
    CategoryActions.read({
      id: nextProps.match.params.id
    });
    TransactionActions.read({
      category: nextProps.match.params.id
    });
  }

  componentWillMount() {
    AccountStore.addChangeListener(this.updateAccount);
    TransactionStore.addChangeListener(this.changeTransactions);
    TransactionStore.addAddListener(this.updateTransaction);
    TransactionStore.addUpdateListener(this.updateTransaction);
    TransactionStore.addDeleteListener(this._deleteData);
    CategoryStore.addChangeListener(this.updateCategory);
  }

  componentDidMount() {
    CategoryActions.read({
      id: this.state.id
    });
    TransactionActions.read({
      category: this.state.id
    });
  }

  componentWillUnmount() {
    AccountStore.removeChangeListener(this.updateAccount);
    TransactionStore.removeChangeListener(this.changeTransactions);
    TransactionStore.removeAddListener(this.updateTransaction);
    TransactionStore.removeUpdateListener(this.updateTransaction);
    TransactionStore.removeDeleteListener(this._deleteData);
    CategoryStore.removeChangeListener(this.updateCategory);
  }

  render() {
    return (
      <div className="categoryLayout">
        <Card className="title">
          <header className="primaryColorBackground">
            <h1>{ this.state.category ? this.state.category.name : '' }</h1>
            <IconButton
              className="previous"
              onTouchTap={() => {
                this.context.router.push('/categories');
              }}><NavigateBefore color={white} /></IconButton>
          </header>
        </Card>
        <Card className="graph">
          { this.state.loading || !this.state.category ?
            <div style={styles.loading}>
              <CircularProgress />
            </div>
          :
            <div className="graphCanvas">
              <TransactionChartMonthlySum config={this.state.graph} ref="chart"></TransactionChartMonthlySum>
            </div>
          }
        </Card>
        <Card className="list">
          { this.state.loading || !this.state.category ?
            <div style={styles.loading}>
              <CircularProgress />
            </div>
          :
            <div>
              {this.state.transactions.length === 0 ?
                <p>You have no transaction</p>
                :
                <p>Broken</p>
              }
            </div>
          }
        </Card>
      </div>
    );
  }
}

// <TransactionTable
// transactions={this.state.transactions}
// categories={[this.state.category]}
// dateFormat="DD MMM YY">
// </TransactionTable>

export default Category;
