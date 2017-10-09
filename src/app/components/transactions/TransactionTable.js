import React, {Component} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn}
  from 'material-ui/Table';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import InfoIcon from 'material-ui/svg-icons/action/info';
import {grey400, grey600, grey800} from 'material-ui/styles/colors';
import Snackbar from 'material-ui/Snackbar';
import {Popover} from 'material-ui/Popover';
import FlatButton from 'material-ui/FlatButton';

import AccountStore from '../../stores/AccountStore';
import CurrencyStore from '../../stores/CurrencyStore';
import CategoryStore from '../../stores/CategoryStore';
import CategoryActions from '../../actions/CategoryActions';
import TransactionActions from '../../actions/TransactionActions';
import TransactionStore from '../../stores/TransactionStore';
import TransactionForm from './TransactionForm';

const styles = {
  amountErrorIcon: {
    position: 'relative',
    float: 'left',
    top: '-2px',
    right: '10px',
  },
  warningPopover: {
    padding: '5px 10px',
    background: grey800,
    color: 'white',
    opacity: '0.8',
  },
  row: {
    rootElement: {
      listStyle: 'none',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '4px 10px 4px 15px'
    },
    text: {
      flexGrow: '1',
    },
    title: {
      fontSize: '1.6em',
      margin: '0 0 4px 0',
      fontWeight: '300'
    },
    subtitle: {
      display: 'flex',
      width: '100%',
      fontSize: '0.9em',
      flexDirection: 'row',
      justifyContent: 'space-between',
      color: '#666',
      textTransform: 'uppercase',
      fontWeight: '400'
    },
    span: {
      textTransform: 'capitalize',
    },
    warning: {
      display: 'inline',
      height: '17px',
      verticalAlign: 'top'
    },
    price: {
      width: '180px',
      fontSize: '1.2em',
      textAlign: 'right',
      fontWeight: '300'
    },
    menu: {
      width: '60px',
    }
  }
};

const iconButtonElement = (
  <IconButton
    touch={true}
  >
    <MoreVertIcon color={grey400} />
  </IconButton>
);

function sortingFunction(a, b) {
  if (a.date < b.date) {
    return 1;
  } else if (a.date > b.date){
    return -1;
  } else if (a.category < b.category) {
    return 1;
  } else if (a.category > b.category) {
    return -1;
  } else if (a.amount < b.amount) {
    return -1;
  } else {
    return 1;
  }
}

class TransactionTable extends Component {

  constructor(props, context) {
    super(props, context);
    this.today = moment();
    this.yesteday = moment().subtract(1, 'day');
    this.state = {
      transactions: props.transactions.sort(sortingFunction),
      categories: props.categories,
      pagination: parseInt(props.pagination),
      open: false,
      dateFormat: props.dateFormat ? props.dateFormat : 'ddd D MMM' ,
      maxHeight: props.maxHeight ? props.maxHeight : null ,
      snackbar: {
        open: false,
        message: ''
      },
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      transactions: nextProps.transactions.sort(sortingFunction),
      pagination: parseInt(nextProps.pagination),
      open: false,
      dateFormat: nextProps.dateFormat ? nextProps.dateFormat : this.state.dateFormat,
      maxHeight: nextProps.maxHeight ? nextProps.maxHeight : this.state.maxHeight,
    });
  }

  handleOpenTransaction = (item={}) => {
    this.setState({
      open: true,
      selectedTransaction: item,
    });
  };

  handleDuplicateTransaction = (item) => {
    let json = item;
    delete json.id;
    this.setState({
      open: true,
      selectedTransaction: json,
    });
  };

  handleWarningOpen = (event, item) => {
    // This prevents ghost click.
    event.preventDefault();
    this.setState({
      open: false,
      openWarning: true,
      anchorEl: event.currentTarget,
      selectedTransaction: item,
    });
  };

  handleWarningClose = () => {
    this.setState({
      open: false,
      openWarning: false,
    });
  };

  more = () => {
    console.log(this.state.pagination + 40);
    this.setState({
      pagination: this.state.pagination + 40,
    });
  };

  handleDeleteTransaction = (transaction) => {

    // this.state.transactions.delete(transaction);
    this.setState({
      transactions: this.state.transactions.filter((item) => { return item.id != transaction.id})
    });

    TransactionStore.onceDeleteListener(() => {
      this.setState({
        snackbar: {
          open: true,
          message: 'Deleted with success',
          deletedItem: {
            account: transaction.account,
            name: transaction.name,
            date: moment(transaction.date).format('YYYY-MM-DD'),
            local_amount: transaction.originalAmount,
            local_currency: transaction.originalCurrency,
            category: transaction.category,
          },
        }
      });
    });
    TransactionActions.delete(transaction);
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

  render() {
    return (
      <div style={{padding: '0 0 40px 20px'}}>
        <ul style={{padding: '0 0 10px 0'}}>
        { this.state.transactions.filter((item, index) => { return !this.state.pagination || index < this.state.pagination; }).map((item) => {
            return (
            <li key={item.id} style={styles.row.rootElement} className={this.today.isSame(item.date, 'd') ? 'isToday' : ''}>
              <div style={styles.row.text}>
                <p style={styles.row.title}>{item.name}</p>
                <div style={styles.row.subtitle}>
                  <p style={{margin: 0}}>
                    { moment(item.date).format(this.state.dateFormat) }
                    {item.category && this.state.categories ? ` \\ ${this.state.categories.find((category) => { return category.id == item.category }).name}` : ''}
                    { AccountStore.selectedAccount().currency !== item.originalCurrency ? ` \\ ${CurrencyStore.format(item.originalAmount, item.originalCurrency, true)}` : ''}
                    {item.isConversionAccurate === false ?
                      <span style={styles.row.span}> \ <InfoIcon
                      color={grey600}
                      style={styles.row.warning}
                      onTouchTap={(event) => { this.handleWarningOpen(event, item); }} /> exchange rate not accurate</span> :
                      ''
                    }
                  </p>
                </div>
              </div>
              <p style={styles.row.price}>{ CurrencyStore.format(item.amount)   }</p>
              <div style={styles.row.menu}>
                <IconMenu
                  iconButtonElement={iconButtonElement}
                  anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                  targetOrigin={{horizontal: 'right', vertical: 'top'}}>
                  <MenuItem onTouchTap={() => {this.handleOpenTransaction(item); }}>Edit</MenuItem>
                  <MenuItem onTouchTap={() => {this.handleDuplicateTransaction(item); }}>Duplicate</MenuItem>
                  <Divider></Divider>
                  <MenuItem onTouchTap={() => {this.handleDeleteTransaction(item); }}>Delete</MenuItem>
                </IconMenu>
              </div>
            </li>
          );
        })}
        </ul>
        { this.state.pagination < this.state.transactions.length ?
          <div style={{padding: '0 40px 0 0'}}>
            <FlatButton
              label="More"
              onTouchTap={this.more}
              fullWidth={true} />
          </div>
          : '' }

        <TransactionForm transaction={this.state.selectedTransaction} open={this.state.open}></TransactionForm>
        <Snackbar
          open={this.state.snackbar.open}
          message={this.state.snackbar.message}
          action="undo"
          autoHideDuration={3000}
          onActionTouchTap={this.handleSnackbarRequestUndo}
          onRequestClose={this.handleSnackbarRequestClose}
        />
        <Popover
          open={this.state.openWarning}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'right', vertical: 'top'}}
          onRequestClose={this.handleWarningClose}
          style={styles.warningPopover}
        >
          { this.state.selectedTransaction && this.state.selectedTransaction.isConversionFromFuturChange ?
            <p>No exchange rate was define at this date.<br/>
            A future rate has been used to estimate this amount.</p> :
            ''
          }

          { this.state.selectedTransaction && this.state.selectedTransaction.isSecondDegreeRate ?
            <p>Exchange rate is not from a direct exchange but with an other currency in between.</p> : ''
          }

          { this.state.selectedTransaction !== undefined &&
            this.state.selectedTransaction.isSecondDegreeRate === false &&
            this.state.selectedTransaction.isConversionFromFuturChange === false ?
            <p>No exchange rate available for those currencies.</p> : ''
          }
        </Popover>
      </div>
    );
  }

}

export default TransactionTable;
