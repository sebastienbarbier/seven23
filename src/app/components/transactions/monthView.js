/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, {Component} from 'react';
import moment from 'moment';
import ReactHighcharts from 'react-highcharts';

import { Link } from 'react-router';

import CircularProgress from 'material-ui/CircularProgress';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import {Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn}
  from 'material-ui/Table';

import TransactionActions from '../../actions/TransactionActions';
import TransactionStore from '../../stores/TransactionStore';
import AccountStore from '../../stores/AccountStore';
import CurrencyStore from '../../stores/CurrencyStore';
import CategoryStore from '../../stores/CategoryStore';

import TransactionForm from './TransactionForm';

import FlatButton from 'material-ui/FlatButton';

import Snackbar from 'material-ui/Snackbar';

import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import {grey400, darkBlack, lightBlack} from 'material-ui/styles/colors';

const styles = {
  container: {
    textAlign: 'left',
  },
  loading: {
    textAlign: 'center',
    padding: '50px 0',
  },
  loadingBig: {
    textAlign: 'center',
    padding: '270px 0',
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
  amount: {
    textAlign: 'right',
  },
  category: {
    width: '60px',
  },
  date: {
    width: '80px',
    textAlign: 'left',
  },
  link: {
    textDecoration: 'none'
  },
  category: {
    width: '40px',
  },
  actions: {
    width: '20px',
  },
  button: {
    float: 'right',
    marginTop: '18px',
    marginRight: '10px',
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

const graph_config = {
    chart: {
        type: 'column'
    },
    title:{
        text:'Expenses per day'
    },
    legend: {
      enabled: false,
    },
    xAxis: {
        gridLineWidth: 1,
        type: 'category',
        title: {
            text: '',
        }
    },
    yAxis: {
        reversed: true,
        title: {
            text: '',
        }
    },
    credits: {
        enabled: false,
    },
  };

const iconButtonElement = (
  <IconButton
    touch={true}
  >
    <MoreVertIcon color={grey400} />
  </IconButton>
);

class MonthView extends Component {
  constructor(props) {
    let now = new Date();
    super(props);
    this.state = {
      year: props.year ? props.year : now.getFullYear(),
      month: props.month ? props.month : (now.getMonth()%12+1),
      loading: true,
      transactions: [],
      categories: {},
      outcome: 0,
      income: 0,
      selectedTransaction: {},
      graph: graph_config,
      open: false,
      snackbar: {
        open: false,
        message: ''
      },
    };
  }

  handleOpenTransaction = (item={}) => {
    this.setState({
      open: true,
      selectedTransaction: item,
    });
  };

  handleDeleteTransaction = (item) => {
    this._updateData(this.state.transactions.filter((transaction) => {
      return transaction.id !== item.id;
    }));
    TransactionActions.delete(item);
  };

  handleSnackbarRequestUndo = () => {
    TransactionActions.create(this.state.snackbar.deletedItem);
    this.handleSnackbarRequestClose();
  };

  handleSnackbarRequestClose = () => {
    this.setState({
      snackbar: {
        open: false,
        message: '',
        deletedItem: {},
      }
    });
  };

  _updateData = (transactions) => {
    if (transactions && Array.isArray(transactions)) {
      let data = [];
      let dailyExpensesIndexed = {};
      let categories = {};
      let income = 0;
      let outcome = 0;
      transactions.forEach((transaction) => {
        if (transaction['foreign_amount'] <= 0) {
          outcome += transaction['foreign_amount'];
        } else {
          income += transaction['foreign_amount'];
        }

        if (!dailyExpensesIndexed[transaction.date]) {
          dailyExpensesIndexed[transaction.date] = 0;
        }
        if (transaction['foreign_amount'] <= 0) {
          dailyExpensesIndexed[transaction.date] += transaction['foreign_amount'];
          // Update price per category
          if (transaction.category) {
            if (!categories[transaction.category]) {
              categories[transaction.category] = 0;
            }
            categories[transaction.category] += transaction['foreign_amount'];
          }
        }
      });

      Object.keys(dailyExpensesIndexed).reverse().forEach((day) => {
          data.push({
            name: moment(day, 'YYYY-MM-DD').format('ddd DD'),
            y: parseFloat(dailyExpensesIndexed[day].toFixed(2)),
          });
      });

      let graph = graph_config;
      graph.series = [{
        data: data,
      }];
      this.setState({
        loading: false,
        graph: graph,
        transactions: transactions,
        outcome: outcome,
        income: income,
        open: false,
        categories: Object.keys(categories).map((id) => {
          return {category: id, amount: categories[id]}
        }).sort((a, b) => {
          return a.amount > b.amount;
        }),
        snackbar: {
          open: false,
          message: '',
        }
      });
    } else {
      if (transactions && transactions.id) {
        this.state.transactions = this.state.transactions.filter((transaction) => {
          return transaction.id !== transactions.id;
        })
        this.state.transactions.push(transactions);
        this._updateData(this.state.transactions.sort((a, b) => {
          return a.date < b.date;
        }));

      } else {
        this.setState({
          loading: true,
        });
        TransactionActions.requestByDate(this.state.year, this.state.month);
      }
    }
  };

  _addData = (data) => {
    if (data.id) {
      this.state.transactions.push(data);
      this._updateData(this.state.transactions.sort((a, b) => {
        return a.date < b.date;
      }));
    }
  };

  _deleteData = (deletedItem) => {
    this.setState({
      snackbar: {
        open: true,
        message: 'Deleted with success',
        deletedItem: deletedItem,
      }
    });
  };

  componentWillMount() {
    AccountStore.addChangeListener(this._updateData);
    TransactionStore.addAddListener(this._addData);
    TransactionStore.addUpdateListener(this._updateData);
    TransactionStore.addChangeListener(this._updateData);
    TransactionStore.addDeleteListener(this._deleteData);
    CurrencyStore.addChangeListener(this._updateData);
    CategoryStore.addChangeListener(this._updateData);
  }

  componentDidMount() {
    TransactionActions.requestByDate(this.state.year, this.state.month);
  }

  componentWillUnmount() {
    AccountStore.removeChangeListener(this._updateData);
    TransactionStore.removeAddListener(this._addData);
    TransactionStore.removeChangeListener(this._updateData);
    TransactionStore.removeUpdateListener(this._updateData);
    TransactionStore.removeDeleteListener(this._deleteData);
    CurrencyStore.removeChangeListener(this._updateData);
    CategoryStore.removeChangeListener(this._updateData);
  }

  componentWillReceiveProps(nextProps) {

    let now = new Date();
    let year = nextProps.year ? nextProps.year : now.getFullYear();
    let month = nextProps.month ? nextProps.month : (now.getMonth()%12+1);

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
       <FlatButton label="New transaction" style={styles.button} onTouchTap={this.handleOpenTransaction} />
        <h1>{ moment.months()[this.state.month-1]} {this.state.year}</h1>
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
                <ReactHighcharts config={this.state.graph} ref="chart"></ReactHighcharts>
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
                      )
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
                <Table
                  fixedHeader={true}
                  fixedFooter={true}
                >
                  <TableHeader
                    displaySelectAll={false}
                    adjustForCheckbox={false}>
                    <TableRow>
                      <TableHeaderColumn style={styles.date}>Date</TableHeaderColumn>
                      <TableHeaderColumn>Label</TableHeaderColumn>
                      <TableHeaderColumn style={styles.category}>Category</TableHeaderColumn>
                      <TableHeaderColumn style={styles.amount}>Amount</TableHeaderColumn>
                      <TableHeaderColumn style={styles.actions}></TableHeaderColumn>
                    </TableRow>
                  </TableHeader>
                  <TableBody
                    displayRowCheckbox={false}
                    showRowHover={true}
                    stripedRows={false}
                  >
                  { this.state.transactions.map((item) => {
                    return (
                      <TableRow key={item.id}>
                        <TableRowColumn style={styles.date}>{moment(item.date).format('DD MMM YYYY')}</TableRowColumn>
                        { AccountStore.selectedAccount().currency !== item.local_currency ?
                          <TableRowColumn>{item.name} ({CurrencyStore.format(item.local_amount, item.local_currency)})</TableRowColumn>
                          :
                          <TableRowColumn>{item.name}</TableRowColumn>
                        }
                        <TableRowColumn style={styles.category}>{item.category ? CategoryStore.getIndexedCategories()[item.category].name : ''}</TableRowColumn>
                        <TableRowColumn style={styles.amount}>{CurrencyStore.format(item.foreign_amount)}</TableRowColumn>
                        <TableRowColumn style={styles.actions}>
                          <IconMenu
                            iconButtonElement={iconButtonElement}
                            anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                            targetOrigin={{horizontal: 'right', vertical: 'top'}}>
                            <MenuItem onTouchTap={() => {this.handleOpenTransaction(item) }}>Edit</MenuItem>
                            <MenuItem onTouchTap={() => {this.handleDeleteTransaction(item) }}>Delete</MenuItem>
                          </IconMenu>
                        </TableRowColumn>
                      </TableRow>
                    )
                  })}
                  </TableBody>
                </Table>
              }
              </CardText>
            </Card>
          </div>
        </div>
        <TransactionForm transaction={this.state.selectedTransaction} open={this.state.open}></TransactionForm>
        <Snackbar
          open={this.state.snackbar.open}
          message={this.state.snackbar.message}
          action="undo"
          autoHideDuration={3000}
          onActionTouchTap={this.handleSnackbarRequestUndo}
          onRequestClose={this.handleSnackbarRequestClose}
        />
      </div>
    );
  }
}

export default MonthView;
