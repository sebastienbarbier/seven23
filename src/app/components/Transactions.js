/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {Link} from 'react-router';
import muiThemeable from 'material-ui/styles/muiThemeable';
import Paper from 'material-ui/Paper';
import FlatButton from 'material-ui/FlatButton';

import CircularProgress from 'material-ui/CircularProgress';
import {Card, CardText} from 'material-ui/Card';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn}
  from 'material-ui/Table';

import {Tabs, Tab} from 'material-ui/Tabs';

import {cyan500, cyan700, white, grey100} from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import NavigateBefore from 'material-ui/svg-icons/image/navigate-before';
import NavigateNext from 'material-ui/svg-icons/image/navigate-next';
import DateRange from 'material-ui/svg-icons/action/date-range';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import AccountStore from '../stores/AccountStore';
import CurrencyStore from '../stores/CurrencyStore';
import CategoryStore from '../stores/CategoryStore';
import CategoryActions from '../actions/CategoryActions';
import TransactionActions from '../actions/TransactionActions';
import TransactionStore from '../stores/TransactionStore';
import TransactionForm from './transactions/TransactionForm';
import TransactionTable from './transactions/TransactionTable';

const styles = {
  headerTitle: {
    color: 'white',
    fontSize: '4em',
  },
  inkbar: {
    backgroundColor: '#004D40',
  },
  loading: {
    textAlign: 'center',
    padding: '50px 0',
  },
  loadingBig: {
    textAlign: 'center',
    padding: '245px 0',
  }
};

class Transactions extends Component {
  constructor(props, context) {
    super(props, context);

    this.location = props.location;
    this.history = props.history;

    this.state = {
      dateBegin : moment.utc([props.match.params.year, props.match.params.month-1]).startOf('month'),
      dateEnd : moment.utc([props.match.params.year, props.match.params.month-1]).endOf('month'),
      loading: true,
      transactions: null,
      categories: null,
      selectedTransaction: {},
      tabs: 'overview',
      open: false,
      primaryColor: props.muiTheme.palette.primary1Color,
    };
    this.context = context;
    // Timer is a 300ms timer on read event to let color animation be smooth
    this.timer = null;
  }

  handleOpenTransaction = (item={}) => {
    this.setState({
      open: true,
      selectedTransaction: item,
    });
  };

  _updateTransaction = (transaction) => {
    if (transaction && transaction.id) {
      let list = this.state.transactions.filter((item) => { return item.id !== transaction.id });
      list.push(transaction);
      this._updateData(list);
    }
  };

  // Timeout of 350 is used to let perform CSS transition on toolbar
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
      let days = {};
      if (data.stats.perDates[data.dateBegin.getFullYear()] &&
          data.stats.perDates[data.dateBegin.getFullYear()].months[data.dateBegin.getMonth()]) {
        days = data.stats.perDates[data.dateBegin.getFullYear()].months[data.dateBegin.getMonth()].days;
      } else {
        days = {};
      }

      // Order transactions by date and calculate sum for graph
      let dataLabel = new Map();
      let range = n => [...Array(n).keys()];

      range(this.state.dateEnd.date()).forEach((day) => {
        dataLabel.set(moment(this.state.dateBegin).date(day+1).format('ddd DD'), days[day+1] ? parseFloat(days[day+1].expenses.toFixed(2))*-1 : 0);
      });

      this.setState({
        loading: false,
        transactions: data.transactions,
        stats: data.stats,
        open: false,
        perCategories: Object.keys(data.stats.perCategories).map((id) => {
          return {
            id: id,
            incomes: data.stats.perCategories[id].incomes,
            expenses: data.stats.perCategories[id].expenses
          };
        }).sort((a, b) => {
          return a.expenses > b.expenses ? 1 : -1;
        }),
        snackbar: {
          open: false,
          message: '',
        }
      });
    }
  };

  _addData = (transaction) => {
    if (!Array.isArray(transaction) &&
      transaction.id &&
      moment(transaction.date).isBetween(this.state.dateBegin, this.state.dateEnd)) {

      TransactionActions.read({
        dateBegin: this.state.dateBegin.toDate(),
        dateEnd: this.state.dateEnd.toDate()
      });
    }
  };

  _updateAccount = () => {
    this.setState({
      transactions: null,
      categories: null,
      loading: true,
      open: false,
    });

    CategoryActions.read();
    TransactionActions.read({
      dateBegin: this.state.dateBegin.toDate(),
      dateEnd: this.state.dateEnd.toDate()
    });
  };

  _updateCategories = (categories) => {
    if (categories && Array.isArray(categories)) {
      this.setState({
        categories: categories
      });
    }
  };

  _deleteData = (transaction) => {
    TransactionActions.read({
      dateBegin: this.state.dateBegin.toDate(),
      dateEnd: this.state.dateEnd.toDate()
    });
  };

  _goMonthBefore = () => {
    this.history.push('/transactions/' + moment(this.state.dateBegin).subtract(1, 'month').format('YYYY/M'));
  };

  _goMonthNext = () => {
    this.history.push('/transactions/' + moment(this.state.dateBegin).add(1, 'month').format('YYYY/M'));
  };

  _onTabChange = (value) => {
    this.setState({
      tabs: value,
      open: false,
    });
  };

  componentWillMount() {
    AccountStore.addChangeListener(this._updateAccount);
    TransactionStore.addAddListener(this._addData);
    TransactionStore.addUpdateListener(this._updateTransaction);
    TransactionStore.addChangeListener(this._updateData);
    TransactionStore.addDeleteListener(this._deleteData);
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
    TransactionStore.removeAddListener(this._addData);
    TransactionStore.removeChangeListener(this._updateData);
    TransactionStore.removeUpdateListener(this._updateTransaction);
    TransactionStore.removeDeleteListener(this._deleteData);
    CategoryStore.removeChangeListener(this._updateCategories);
  }

  componentWillReceiveProps(nextProps) {

    let dateBegin = moment.utc([nextProps.match.params.year, nextProps.match.params.month-1]).startOf('month');
    let dateEnd = moment.utc([nextProps.match.params.year, nextProps.match.params.month-1]).endOf('month');

    this.setState({
      dateBegin: dateBegin,
      dateEnd: dateEnd,
      open: false,
      loading: true,
      primaryColor: nextProps.muiTheme.palette.primary1Color,
    });
    TransactionActions.read({
      dateBegin: dateBegin.toDate(),
      dateEnd: dateEnd.toDate()
    });
  }

  render() {
    return (
      <div className="twoColumnContent">
        <div className="column">
          <Card className="card">
              <div className="cardContainer">
                <Paper zDepth={1}>
                <header className="padding" style={{background: this.state.primaryColor}}>
                  <h2>{ this.state.dateBegin.format('MMMM YYYY')}</h2>
                  <IconButton
                    tooltip={moment(this.state.dateBegin).subtract(1, 'month').format('MMMM YY')}
                    tooltipPosition="bottom-right"
                    touch={false}
                    className="previous"
                    onTouchTap={this._goMonthBefore}><NavigateBefore color={white} /></IconButton>
                  <IconButton touch={false} className="calendar"><DateRange color={white} /></IconButton>
                  <IconButton
                    tooltip={moment(this.state.dateBegin).add(1, 'month').format('MMMM YY')}
                    tooltipPosition="bottom-left"
                    touch={false}
                    className="next"
                    onTouchTap={this._goMonthNext}><NavigateNext color={white} /></IconButton>
                </header>
                </Paper>
                <article>
                  { this.state.loading || this.state.categories === null ?
                    <div style={styles.loading}>
                      <CircularProgress />
                    </div>
                    :
                    <div>
                     <p>Incomes: { CurrencyStore.format(this.state.stats.incomes) }</p>
                     <p>Expenses: { CurrencyStore.format(this.state.stats.expenses) }</p>
                     <p>Balance: { CurrencyStore.format(this.state.stats.expenses + this.state.stats.incomes) }</p>
                     <p>{ this.state.transactions ? this.state.transactions.length : '' } transactions</p>

                     <Table style={{background: 'transparent'}}>
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
                    </div>
                  }
                </article>
              </div>
          </Card>
        </div>
        <div className="column"s>
          <div className="twothirdWidth padding">
            <div className="toolbar">
              <FlatButton
                label="New transaction"
                primary={true}
                icon={<ContentAdd />}
                onTouchTap={this.handleOpenTransaction}
              />
            </div>
            { this.state.loading || !this.state.categories ?
              <div style={styles.loading}>
              </div>
              :
              <TransactionTable
                transactions={this.state.transactions}
                categories={this.state.categories}>
              </TransactionTable>
            }
          </div>
          <TransactionForm transaction={this.state.selectedTransaction} open={this.state.open}></TransactionForm>
        </div>
      </div>
    );
  }
}

export default muiThemeable()(Transactions);
