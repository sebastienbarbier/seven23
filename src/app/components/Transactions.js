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

import {cyan500, cyan700, white, grey100, green500, red500, blue500} from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import NavigateBefore from 'material-ui/svg-icons/image/navigate-before';
import NavigateNext from 'material-ui/svg-icons/image/navigate-next';
import DateRange from 'material-ui/svg-icons/action/date-range';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import BarGraph from './charts/BarGraph';

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
  },
  wrap: {
    flexWrap: 'wrap'
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
      isLoading: true,
      transaction: null,
      transactions: null,
      categories: null,
      stats: null,
      graph: null,
      tabs: 'overview',
      open: false
    };
    this.context = context;
    // Timer is a 300ms timer on read event to let color animation be smooth
    this.timer = null;
  }

  handleOpenTransaction = (item={}) => {
    this.setState({
      open: true,
      transaction: item
    });
  };

  handleOpenDuplicateTransaction = (item={}) => {
    delete item.id;
    this.handleOpenTransaction(item);
  };

  handleCloseTransaction = () => {
    this.setState({
      open: false,
      transaction: null,
    });
  };

  _updateTransaction = (transaction) => {
    if (transaction && transaction.id) {
      TransactionActions.read({
        dateBegin: this.state.dateBegin.toDate(),
        dateEnd: this.state.dateEnd.toDate()
      });
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

      const year = moment(data.dateBegin).format('YYYY');
      const month = moment(data.dateBegin).format('MM');

      let days = {};
      if (data.stats.perDates && data.stats.perDates[year]) {
        days = data.stats.perDates[year].months[month-1].days;
      }

      let lineExpenses = {
        values: []
      };

      lineExpenses.values = Object.keys(days).map((key) => {
        return { date: moment.utc([year, month-1, key]).toDate(), value: days[key].expenses * -1 }
      });

      this.setState({
        isLoading: false,
        transactions: data.transactions,
        stats: data.stats,
        graph: [lineExpenses],
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
      perCategories: null,
      graph: null,
      stats: null,
      isLoading: true,
      open: false
    });

    CategoryStore.onceChangeListener(() => {
      TransactionActions.read({
        dateBegin: this.state.dateBegin.toDate(),
        dateEnd: this.state.dateEnd.toDate()
      });
    });

    CategoryActions.read();
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
      graph: null,
      stats: null,
      perCategories: null,
      open: false,
      isLoading: true,
    });
    TransactionActions.read({
      dateBegin: dateBegin.toDate(),
      dateEnd: dateEnd.toDate()
    });
  }

  render() {
    return [
      <div key="modal" className={'modalContent ' + (this.state.open ? 'open' : 'close')}>
        <Card>
          <TransactionForm
            transaction={this.state.transaction}
            categories={this.state.categories}
            onSubmit={this.handleCloseTransaction}
            onClose={this.handleCloseTransaction}>
          </TransactionForm>
        </Card>
      </div>
      ,
      <div key="content" className="twoColumnContent">
        <div className="column">
          <Card className="card">
              <div className="cardContainer">
                <Paper zDepth={1}>
                  <header className="padding">
                    <h2>{ this.state.dateBegin.format('MMMM YYYY')}</h2>
                    <aside>
                      <IconButton
                        tooltip={moment(this.state.dateBegin).subtract(1, 'month').format('MMMM YY')}
                        tooltipPosition="bottom-right"
                        touch={false}
                        className="previous"
                        onTouchTap={this._goMonthBefore}><NavigateBefore color={white} /></IconButton>
                      <IconButton touch={false} className="calendar">
                        <DateRange color={white} /></IconButton>
                      <IconButton
                        tooltip={moment(this.state.dateBegin).add(1, 'month').format('MMMM YY')}
                        tooltipPosition="bottom-left"
                        touch={false}
                        className="next"
                        onTouchTap={this._goMonthNext}><NavigateNext color={white} /></IconButton>
                    </aside>
                  </header>
                </Paper>
                <article className={ this.state.isLoading ? 'noscroll' : ''}>
                  <div className="inlineContent">
                    <div className="row padding" style={styles.wrap}>
                     <p className="padding"><small>Incomes</small><br/>
                     <span style={{color: green500}}>
                      { !this.state.stats ? <span className="loading w80"></span> :
                        CurrencyStore.format(this.state.stats.incomes)
                      }
                     </span>
                     </p>
                     <p className="padding"><small>Expenses</small><br/>
                     <span style={{color: red500}}>
                      { !this.state.stats ? <span className="loading w80"></span> :
                        CurrencyStore.format(this.state.stats.expenses)
                      }
                     </span>
                     </p>
                     <p className="padding"><small>Balance</small><br/>
                     <span style={{color: blue500}}>
                      { !this.state.stats ? <span className="loading w80"></span> :
                        CurrencyStore.format(this.state.stats.expenses + this.state.stats.incomes)
                      }
                     </span>
                     </p>
                    </div>

                    <div style={{width: '100%'}}>
                      <BarGraph values={this.state.graph} isLoading={this.state.isLoading}></BarGraph>
                    </div>

                    <Table style={{background: 'transparent'}}>
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
                      { this.state.perCategories ?
                          this.state.perCategories.map((item) => {
                          return (
                            <TableRow key={item.id}>
                              <TableRowColumn>{ this.state.categories.find((category) => { return ''+category.id === ''+item.id; }).name }</TableRowColumn>
                              <TableRowColumn style={styles.amount}>{ CurrencyStore.format(item.expenses) }</TableRowColumn>
                            </TableRow>
                          );
                        })
                        :
                        ['w120', 'w80', 'w120', 'w120', 'w80', 'w120'].map((value, i) => {
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
                  </div>
                </article>
              </div>
          </Card>
        </div>
        <div className={ this.state.isLoading ? 'noscroll column' : 'column'}>
          <div className="toolbar">
            <FlatButton
              label="New transaction"
              primary={true}
              disabled={this.state.isLoading}
              icon={<ContentAdd />}
              onClick={this.handleOpenTransaction}
            />
          </div>
          <TransactionTable
            transactions={this.state.transactions}
            categories={this.state.categories}
            isLoading={this.state.isLoading}
            onEdit={this.handleOpenTransaction}
            onDuplicate={this.handleOpenDuplicateTransaction}
            >
          </TransactionTable>
        </div>
      </div>
    ];
  }
}

export default muiThemeable()(Transactions);
