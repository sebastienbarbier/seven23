import React, {Component} from 'react';
import moment from 'moment';

import {Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn}
  from 'material-ui/Table';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import {grey400, darkBlack, lightBlack} from 'material-ui/styles/colors';
import Snackbar from 'material-ui/Snackbar';

import AccountStore from '../../stores/AccountStore';
import CurrencyStore from '../../stores/CurrencyStore';
import CategoryStore from '../../stores/CategoryStore';
import TransactionActions from '../../actions/TransactionActions';
import TransactionStore from '../../stores/TransactionStore';
import TransactionModel from '../../models/Transaction';
import TransactionForm from './TransactionForm';

const styles = {
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
  category: {
    width: '40px',
  },
  actions: {
    width: '20px',
  },
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
		if (!nextProps.transactions instanceof Set) {
			throw new Error('transactions property for TransactionTable Component should be a Set instance.');
		}
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

	handleDeleteTransaction = (transaction) => {
	    this.state.transactions.delete(transaction);

	    TransactionStore.onceDeleteListener((transaction) => {
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
	              { [...this.state.transactions].sort((a, b) => { return a.date < b.date }).map((item) => {
	                return (
	                  <TableRow key={item.id}>
	                    <TableRowColumn style={styles.date}>{moment(item.date).format(this.state.dateFormat)}</TableRowColumn>
	                    { AccountStore.selectedAccount().currency !== item.originalCurrency ?
	                      <TableRowColumn>{item.name} ({CurrencyStore.format(item.originalAmount, item.originalCurrency)})</TableRowColumn>
	                      :
	                      <TableRowColumn>{item.name}</TableRowColumn>
	                    }
	                    <TableRowColumn style={styles.category}>{item.category ? CategoryStore.getIndexedCategories()[item.category].name : ''}</TableRowColumn>
	                    <TableRowColumn style={styles.amount}>{CurrencyStore.format(item.amount)}</TableRowColumn>
	                    <TableRowColumn style={styles.actions}>
	                      <IconMenu
	                        iconButtonElement={iconButtonElement}
	                        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
	                        targetOrigin={{horizontal: 'right', vertical: 'top'}}>
	                        <MenuItem onTouchTap={() => {this.handleOpenTransaction(item) }}>Edit</MenuItem>
	                        <MenuItem onTouchTap={() => {this.handleDuplicateTransaction(item) }}>Duplicate</MenuItem>
	                        <Divider></Divider>
	                        <MenuItem onTouchTap={() => {this.handleDeleteTransaction(item) }}>Delete</MenuItem>
	                      </IconMenu>
	                    </TableRowColumn>
	                  </TableRow>
	                )
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
	        </div>
	    );
	}

}

export default TransactionTable;
