import React, {Component} from 'react';
import moment from 'moment';
import {Card, CardText} from 'material-ui/Card';

import CircularProgress from 'material-ui/CircularProgress';

import {green500, green600} from 'material-ui/styles/colors';

import AccountStore from '../../stores/AccountStore';
import CategoryStore from '../../stores/CategoryStore';
import CurrencyStore from '../../stores/CurrencyStore';
import TransactionStore from '../../stores/TransactionStore';
import TransactionActions from '../../actions/TransactionActions';

import TransactionTable from '../transactions/TransactionTable';
import TransactionChartMonthlySum from '../transactions/charts/TransactionChartMonthlySum';

const styles = {
  container: {
    textAlign: 'left',
    float: 'right',
    marginLeft: '430px',
  },
  header: {
    margin: '5px 0px',
    color: 'white',
    background: green600,
    padding: '0px 0px 0px 10px',
    position: 'relative',
  },
  headerTitle: {
    color: 'white',
    fontSize: '2.5em',
    paddingBottom: '0px',
  },
  headerText: {
    color: 'white',
  },
  paddingBottom: {
    marginBottom: '10px',
  },
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
  },
};

class Category extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      category: CategoryStore.getIndexedCategories()[props.params.id],
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

  updateData = (category) => {
    if (category && category.id !== null) {
      this.setState({
        category: CategoryStore.getIndexedCategories()[this.state.category.id],
      });
    } else {
      if (category && category.id === null) {
        this.context.router.push('/categories/');
      }
    }
  };

  updateTransaction = () => {
    this.setState({
      loading: true,
      open: false,
    });
    TransactionActions.requestByCategory(this.state.category.id);
  };

  changeTransactions = (args) => {
    if (args && args instanceof Set) {

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
          legend: {
            display: false,
          },
        }
      };
       // graph.xAxis.categories = categories;
       // graph.series = [{
       //   data: data,
       //   name: 'Spending',
       // }];

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
    TransactionActions.requestByCategory(this.props.params.id);
  };

  _deleteData = (deletedItem) => {
    this.state.transactions.delete(deletedItem);
    this.changeTransactions(this.state.transactions);
  };

  componentWillReceiveProps(nextProps) {
    window.scrollTo(0, 0);

    this.setState({
      category: CategoryStore.getIndexedCategories()[nextProps.params.id],
      transactions: new Set(),
      stats: {},
      counter: 0,
      open: false,
      loading: true,
    });
    TransactionActions.requestByCategory(nextProps.params.id);
  }

  componentWillMount() {
    window.scrollTo(0, 0);
    AccountStore.addChangeListener(this.updateAccount);
    TransactionStore.addChangeListener(this.changeTransactions);
    TransactionStore.addAddListener(this.updateTransaction);
    TransactionStore.addUpdateListener(this.updateTransaction);
    TransactionStore.addDeleteListener(this._deleteData);
    CategoryStore.addChangeListener(this.updateData);
  }

  componentDidMount() {
    TransactionActions.requestByCategory(this.state.category.id);
  }

  componentWillUnmount() {
    AccountStore.removeChangeListener(this.updateAccount);
    TransactionStore.removeChangeListener(this.changeTransactions);
    TransactionStore.removeAddListener(this.updateTransaction);
    TransactionStore.removeUpdateListener(this.updateTransaction);
    TransactionStore.removeDeleteListener(this._deleteData);
    CategoryStore.removeChangeListener(this.updateData);
  }

  render() {
    return (
      <div>
        <Card style={styles.header}>
          <CardText style={styles.headerText}>
            <h1 style={styles.headerTitle}>{ this.state.category.name }</h1>
          </CardText>
        </Card>
        <Card style={styles.paddingBottom}>
          <CardText>
            { this.state.loading ?
              <div style={styles.loading}>
                <CircularProgress />
              </div>
            :
              <div>
                <TransactionChartMonthlySum config={this.state.graph} ref="chart"></TransactionChartMonthlySum>
              </div>
            }
          </CardText>
        </Card>
        <Card>
          <CardText>
            { this.state.loading ?
              <div style={styles.loading}>
                <CircularProgress />
              </div>
            :

              <div>
              {this.state.transactions.length === 0 ?
                <p>You have no transaction</p>
                :
                <TransactionTable
                  transactions={this.state.transactions}
                  dateFormat="DD MMM YYYY"
                  maxHeight="300px">
                </TransactionTable>
              }
              </div>
            }
          </CardText>
        </Card>
      </div>
    );
  }
}

// Inject router in context
Category.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default Category;
