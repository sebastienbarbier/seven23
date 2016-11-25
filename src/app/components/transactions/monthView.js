/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, {Component} from 'react';
import moment from 'moment';

import CircularProgress from 'material-ui/CircularProgress';
import {Card, CardText} from 'material-ui/Card';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn}
  from 'material-ui/Table';
import {cyan500, cyan700, white, grey100} from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import NavigateBefore from 'material-ui/svg-icons/image/navigate-before';
import NavigateNext from 'material-ui/svg-icons/image/navigate-next';
import DateRange from 'material-ui/svg-icons/action/date-range';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import AccountStore from '../../stores/AccountStore';
import CurrencyStore from '../../stores/CurrencyStore';
import CategoryStore from '../../stores/CategoryStore';
import TransactionActions from '../../actions/TransactionActions';
import TransactionStore from '../../stores/TransactionStore';
import TransactionModel from '../../models/Transaction';
import TransactionForm from './TransactionForm';
import TransactionTable from './TransactionTable';

import TransactionChartDailySum from './charts/TransactionChartDailySum';

const styles = {
  header: {
    margin: '5px',
    color: 'white',
    background: cyan700,
    padding: '20px 0px 30px 20px',
  },
  headerTitle: {
    color: 'white',
    fontSize: '4em',
  },
  headerText: {
    color: 'white',
  },
  buttonFloating: {
    position: 'absolute',
    right: '85px',
  },
  navigationButtons: {
    position: 'absolute',
    right: '35px',
    top: '30px',
  },
  container: {
    textAlign: 'left',
  },
  loading: {
    textAlign: 'center',
    padding: '50px 0',
  },
  loadingBig: {
    textAlign: 'center',
    padding: '245px 0',
  },
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  box1: {
    width: '40%',
    padding: '5px',
    boxSizing: 'border-box',
  },
  box2: {
    width: '60%',
    padding: '5px',
    boxSizing: 'border-box',
  },
  boxPadding: {
    marginBottom: '10px',
  },
  outcome: {
    textAlign: 'right',
  },
  outcomeValue: {
    textAlign: 'right',
    fontSize: '1.5em',
    color: 'red',
  },
  incomeValue: {
    textAlign: 'left',
    fontSize: '1.5em',
    color: 'green',
  },
};


class MonthView extends Component {
  constructor(props, context) {
    super(props, context);

    let now = new Date();
    this.state = {
      year: props.year ? parseInt(props.year) : now.getFullYear(),
      month: props.month ? parseInt(props.month) : (now.getMonth()%12+1),
      loading: true,
      transactions: new Set(),
      categories: {},
      outcome: 0,
      income: 0,
      selectedTransaction: {},
      graph: {},
      open: false,
    };
    this.context = context;
  }

  handleOpenTransaction = (item={}) => {
    this.setState({
      open: true,
      selectedTransaction: item,
    });
  };

  _updateTransaction = (oldObject, newObject) => {
    oldObject.update(newObject).then(() => {
      this._updateData(this.state.transactions);
    });
  };

  _updateData = (transactions) => {
    if (transactions && transactions instanceof Set) {

      let dailyExpensesIndexed = {};
      let categories = {};
      let income = 0;
      let outcome = 0;
      transactions.forEach((transaction) => {
        if (transaction.amount <= 0) {
          outcome += transaction.amount;
        } else {
          income += transaction.amount;
        }

        if (!dailyExpensesIndexed[transaction.date]) {
          dailyExpensesIndexed[transaction.date] = 0;
        }
        if (transaction.amount <= 0) {
          dailyExpensesIndexed[transaction.date] += transaction.amount;
          // Update price per category
          if (transaction.category) {
            if (!categories[transaction.category]) {
              categories[transaction.category] = 0;
            }
            categories[transaction.category] += transaction.amount;
          }
        }
      });

      let dataLabel = new Map();
      Object.keys(dailyExpensesIndexed).sort((a, b) => { return a < b ? -1 : 1; }).forEach((day) => {
        dataLabel.set(moment(day, 'YYYY-MM-DD').format('ddd DD'), parseFloat(dailyExpensesIndexed[day].toFixed(2))*-1);
      });

      let graph = {
        type: 'bar',
        data: {
          labels: [...dataLabel.keys()],
          datasets: [{
            label: CurrencyStore.getIndexedCurrencies()[CurrencyStore.getSelectedCurrency()].name,
            data: [...dataLabel.values()],
            backgroundColor: cyan500,
            borderColor: cyan500,
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
        loading: false,
        graph: graph,
        transactions: transactions,
        outcome: outcome,
        income: income,
        open: false,
        categories: Object.keys(categories).map((id) => {
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

  _addData = (transaction) => {
    if (transaction instanceof TransactionModel) {
      this.state.transactions.add(transaction);
      this._updateData(this.state.transactions);
    }
  };

  _updateAccount = () => {
    TransactionActions.requestByDate(this.state.year, this.state.month);
  };

  _deleteData = (transaction) => {
    if (transaction instanceof TransactionModel) {
      this.state.transactions.delete(transaction);
      this._updateData(this.state.transactions);
    }
  };

  _goMonthBefore = () => {
    let newYear = (this.state.month === 1 ? this.state.year-1 : this.state.year),
      newMonth = (this.state.month === 1 ? 12 : this.state.month-1);

    this.context.router.push('/transactions/'+newYear+'/'+newMonth);
  };

  _goMonthNext = () => {
    let newYear = (this.state.month === 12 ? this.state.year+1 : this.state.year),
      newMonth = (this.state.month === 12 ? 1 : this.state.month+1);

    this.context.router.push('/transactions/'+newYear+'/'+newMonth);
  };

  componentWillMount() {
    AccountStore.addChangeListener(this._updateAccount);
    TransactionStore.addAddListener(this._addData);
    TransactionStore.addUpdateListener(this._updateTransaction);
    TransactionStore.addChangeListener(this._updateData);
    TransactionStore.addDeleteListener(this._deleteData);
    CurrencyStore.addChangeListener(this._updateData);
    CategoryStore.addChangeListener(this._updateData);
  }

  componentDidMount() {
    TransactionActions.requestByDate(this.state.year, this.state.month);
  }

  componentWillUnmount() {
    AccountStore.removeChangeListener(this._updateAccount);
    TransactionStore.removeAddListener(this._addData);
    TransactionStore.removeChangeListener(this._updateData);
    TransactionStore.removeUpdateListener(this._updateTransaction);
    TransactionStore.removeDeleteListener(this._deleteData);
    CurrencyStore.removeChangeListener(this._updateData);
    CategoryStore.removeChangeListener(this._updateData);
  }

  componentWillReceiveProps(nextProps) {

    let now = new Date();
    let year = nextProps.year ? parseInt(nextProps.year) : now.getFullYear();
    let month = nextProps.month ? parseInt(nextProps.month) : (now.getMonth()%12+1);
    this.setState({
      year: year,
      month: month,
      open: false,
      loading: true,
    });
    TransactionActions.requestByDate(year, month);
  }

  render() {
    return (
      <div style={styles.container}>
        <Card style={styles.header}>
          <div style={styles.navigationButtons}>
            <IconButton
              tooltip={moment(this.state.year+'-'+this.state.month).subtract(1, 'month').format('MMMM YY')}
              tooltipPosition="bottom-left"
              touch={true}
              onTouchTap={this._goMonthBefore}><NavigateBefore color={white} /></IconButton>
            <IconButton touch={true}><DateRange color={grey100} /></IconButton>
            <IconButton
              tooltip={moment(this.state.year+'-'+this.state.month).add(1, 'month').format('MMMM YY')}
              tooltipPosition="bottom-left"
              touch={true}
              onTouchTap={this._goMonthNext}><NavigateNext color={white} /></IconButton>
          </div>
          <CardText style={styles.headerText}>
            <h1 style={styles.headerTitle}>{ moment.months()[this.state.month-1]} {this.state.year}</h1>
          </CardText>
          <FloatingActionButton onTouchTap={this.handleOpenTransaction} style={styles.buttonFloating}>
            <ContentAdd />
          </FloatingActionButton>
        </Card>
        <div style={styles.wrapper}>
          <div style={styles.box1}>
            <Card style={styles.boxPadding}>
              <CardText>
              { this.state.loading ?
                <div style={styles.loading}>
                  <CircularProgress />
                </div>
                :
                <Table>
                  <TableHeader
                    displaySelectAll={false}
                    adjustForCheckbox={false}>
                    <TableRow>
                      <TableHeaderColumn>Income</TableHeaderColumn>
                      <TableHeaderColumn style={styles.outcome}>Outcome</TableHeaderColumn>
                    </TableRow>
                  </TableHeader>
                  <TableBody
                    displayRowCheckbox={false}
                    showRowHover={true}
                    stripedRows={false}
                  >
                    <TableRow>
                      <TableRowColumn style={styles.incomeValue}>{ CurrencyStore.format(this.state.income) }</TableRowColumn>
                      <TableRowColumn style={styles.outcomeValue}>{ CurrencyStore.format(this.state.outcome) }</TableRowColumn>
                    </TableRow>
                  </TableBody>
                </Table>
              }
              </CardText>
            </Card>
            <Card style={styles.boxPadding}>
              <CardText>
              { this.state.loading ?
                <div style={styles.loading}>
                  <CircularProgress />
                </div>
                :
                <TransactionChartDailySum config={this.state.graph}></TransactionChartDailySum>
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
                  { this.state.categories.map((item) => {
                    return (
                        <TableRow key={item.category}>
                          <TableRowColumn>{ CategoryStore.getIndexedCategories()[item.category].name }</TableRowColumn>
                          <TableRowColumn style={styles.amount}>{ CurrencyStore.format(item.amount) }</TableRowColumn>
                        </TableRow>
                    );
                  })
                  }
                  </TableBody>
                </Table>
              }
              </CardText>
            </Card>
          </div>
          <div style={styles.box2}>
            <Card>
              <CardText>
              { this.state.loading ?
                <div style={styles.loadingBig}>
                  <CircularProgress />
                </div>
                :
                <TransactionTable transactions={this.state.transactions}></TransactionTable>
              }
              </CardText>
            </Card>
          </div>
        </div>
        <TransactionForm transaction={this.state.selectedTransaction} open={this.state.open}></TransactionForm>
      </div>
    );
  }
}

// Inject router in context
MonthView.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default MonthView;
