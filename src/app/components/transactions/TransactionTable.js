import React, {Component} from 'react';
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

import AccountStore from '../../stores/AccountStore';
import CurrencyStore from '../../stores/CurrencyStore';
import CategoryStore from '../../stores/CategoryStore';
import CategoryActions from '../../actions/CategoryActions';
import TransactionActions from '../../actions/TransactionActions';
import TransactionStore from '../../stores/TransactionStore';
import TransactionModel from '../../models/Transaction';
import TransactionForm from './TransactionForm';

const styles = {
  amount: {
    textAlign: 'right',
    width: '120px',
  },
  date: {
    textAlign: 'left',
    width: '75px',
  },
  category: {
    width: '85px',
  },
  actions: {
    textAlign: 'right',
    width: '20px',
  },
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
  }
};

const iconButtonElement = (
  <IconButton
    touch={true}
  >
    <MoreVertIcon color={grey400} />
  </IconButton>
);

class TransactionTable extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      transactions: props.transactions,
      categories: props.categories,
      open: false,
      dateFormat: props.dateFormat ? props.dateFormat : 'ddd D' ,
      maxHeight: props.maxHeight ? props.maxHeight : null ,
      snackbar: {
        open: false,
        message: ''
      },
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      transactions: nextProps.transactions,
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
    let json = item.toJSON();
    delete json.id;
    this.setState({
      open: true,
      selectedTransaction: new TransactionModel(json),
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

  handleDeleteTransaction = (transaction) => {

    this.state.transactions.delete(transaction);

    TransactionStore.onceDeleteListener(() => {
      this.setState({
        snackbar: {
          open: true,
          message: 'Deleted with success',
          deletedItem: transaction,
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
      <div>
          <Table
            height={this.state.maxHeight}
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
            { this.state.transactions.sort((a, b) => { return a.date < b.date ? 1 : -1; }).map((item) => {
              return (
                <TableRow key={item.id}>
                  <TableRowColumn style={styles.date}>{moment(item.date).format(this.state.dateFormat)}</TableRowColumn>
                  { AccountStore.selectedAccount().currency !== item.originalCurrency ?
                    <TableRowColumn>{item.name} ({CurrencyStore.format(item.originalAmount, item.originalCurrency)})</TableRowColumn>
                    :
                    <TableRowColumn>{item.name}</TableRowColumn>
                  }
                  <TableRowColumn style={styles.category}>
                    {item.category && this.state.categories ? this.state.categories.find((category) => { return category.id == item.category }).name : ''}
                  </TableRowColumn>
                  <TableRowColumn style={styles.amount}>
                    {item.isConversionAccurate === false ?
                      <InfoIcon
                      color={grey600}
                      style={styles.amountErrorIcon}
                      onTouchTap={(event) => { this.handleWarningOpen(event, item); }} /> :
                      ''
                    }
                    {CurrencyStore.format(item.amount)}
                  </TableRowColumn>
                  <TableRowColumn style={styles.actions}>
                    <IconMenu
                      iconButtonElement={iconButtonElement}
                      anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                      targetOrigin={{horizontal: 'right', vertical: 'top'}}>
                      <MenuItem onTouchTap={() => {this.handleOpenTransaction(item); }}>Edit</MenuItem>
                      <MenuItem onTouchTap={() => {this.handleDuplicateTransaction(item); }}>Duplicate</MenuItem>
                      <Divider></Divider>
                      <MenuItem onTouchTap={() => {this.handleDeleteTransaction(item); }}>Delete</MenuItem>
                    </IconMenu>
                  </TableRowColumn>
                </TableRow>
              );
            })}
            </TableBody>
          </Table>
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
