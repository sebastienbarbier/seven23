import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';

import { withStyles } from '@material-ui/core/styles';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';

import MoreVertIcon from '@material-ui/icons/MoreVert';

import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import Slide from '@material-ui/core/Slide';

import TransactionActions from '../../actions/TransactionActions';

import { ColoredAmount, Amount } from '../currency/Amount';

const styles = theme => ({
  cardHeader: {
    background: theme.palette.cardheader
  },
  actionsContainer: {
    textAlign: 'right',
    paddingRight: '8px',
  }
});


function sortingFunction(a, b) {
  if (a.date < b.date) {
    return 1;
  } else if (a.date > b.date) {
    return -1;
  } else if (a.category < b.category) {
    return 1;
  } else if (a.category > b.category) {
    return -1;
  } else if (a.amount < b.amount) {
    return -1;
  } else if (a.name < b.name) {
    return -1;
  } else {
    return 1;
  }
}

function filteringCategoryFunction(transaction, filters = []) {
  if (
    !filters.find(filter => {
      return filter.type === 'category';
    })
  ) {
    return true;
  }
  let res = false;
  filters.forEach(filter => {
    if (
      res === false &&
      filter.type === 'category' &&
      +filter.value === +transaction.category
    ) {
      res = true;
    }
  });
  return res;
}
function filteringDateFunction(transaction, filters = []) {
  if (
    !filters.find(filter => {
      return filter.type === 'date';
    })
  ) {
    return true;
  }
  let res = false;
  filters.forEach(filter => {
    if (
      res === false &&
      filter.type === 'date' &&
      +filter.value.getDate() === +transaction.date.getDate()
    ) {
      res = true;
    }
  });
  return res;
}

class TransactionTable extends Component {
  constructor(props, context) {
    super(props, context);
    this.today = moment();
    this.yesteday = moment().subtract(1, 'day');
    this.state = {
      transactions:
        props.transactions && Array.isArray(props.transactions)
          ? props.transactions
            .filter(
              transaction =>
                filteringCategoryFunction(transaction, props.filters) &&
                filteringDateFunction(transaction, props.filters),
            )
            .sort(sortingFunction)
          : [],
      hasTransactionsToday:
        props.transactions && Array.isArray(props.transactions)
          ? props.transactions.findIndex(t => this.today.isSame(t.date, 'd')) !=
            -1
          : false,
      filters: props.filters,
      isLoading: props.isLoading,
      onEdit: props.onEdit,
      onDuplicate: props.onDuplicate,
      pagination: parseInt(props.pagination),
      dateFormat: props.dateFormat ? props.dateFormat : 'ddd D MMM',
      snackbar: {
        open: false,
        message: '',
      },
    };

    this._openActionMenu = (event, item) => {
      this.setState({
        anchorEl: event.currentTarget,
        selectedTransaction: item
      });
    };

    this._closeActionMenu = () => {
      this.setState({ anchorEl: null });
    };

    this.categoryBreadcrumb = (id) => {
      const result = [];
      const category = this.props.categories.find(category => category.id == id);
      if (category.parent) {
        result.push(this.categoryBreadcrumb(category.parent));
      }
      result.push(category.name);
      return result;
    };

  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      transactions:
        nextProps.transactions && Array.isArray(nextProps.transactions)
          ? nextProps.transactions
            .filter(
              transaction =>
                filteringCategoryFunction(transaction, nextProps.filters) &&
                filteringDateFunction(transaction, nextProps.filters),
            )
            .sort(sortingFunction)
          : [],
      hasTransactionsToday:
        nextProps.transactions && Array.isArray(nextProps.transactions)
          ? nextProps.transactions.findIndex(t =>
            this.today.isSame(t.date, 'd'),
          ) != -1
          : false,
      pagination: parseInt(nextProps.pagination),
      filters: nextProps.filters,
      isLoading: nextProps.isLoading,
      onEdit: nextProps.onEdit,
      onDuplicate: nextProps.onDuplicate,
      dateFormat: nextProps.dateFormat
        ? nextProps.dateFormat
        : this.state.dateFormat,
    });
  }

  handleWarningOpen = (event, item) => {
    // This prevents ghost click.
    event.preventDefault();
    this.setState({
      openWarning: true,
      anchorEl: event.currentTarget,
      selectedTransaction: item,
    });
  };

  handleWarningClose = () => {
    this.setState({
      openWarning: false,
    });
  };

  more = () => {
    this.setState({
      pagination: this.state.pagination + 40,
    });
  };

  handleDeleteTransaction = transaction => {

    const { dispatch } = this.props;

    dispatch(TransactionActions.delete(transaction)).then(() => {
      this.setState({
        snackbar: {
          open: true,
          message: 'Deleted with success',
          deletedItem: {
            account: transaction.account,
            name: transaction.name,
            date: moment(transaction.date).toDate(),
            local_amount: transaction.originalAmount,
            local_currency: transaction.originalCurrency,
            category: transaction.category,
          },
        },
      });
    }).catch((error) => {
      console.error(error);
    });
  };

  handleSnackbarRequestUndo = () => {
    const { dispatch } = this.props;
    dispatch(TransactionActions.create(this.state.snackbar.deletedItem));
    this.handleSnackbarRequestClose();
  };

  handleSnackbarRequestClose = () => {
    this.setState({
      snackbar: {
        open: false,
        message: '',
        deletedItem: {},
      },
    });
  };

  render() {
    const { anchorEl } = this.state;
    const { classes, selectedCurrency, currencies, categories } = this.props;

    const perDate = {};

    this.state.transactions
      .filter((item, index) => {
        return (
          !this.state.pagination || index < this.state.pagination
        );
      }).forEach((transaction) => {
        perDate[transaction.date] = perDate[transaction.date] ? perDate[transaction.date].concat([transaction]) : [transaction];
      });

    return (
      <div style={{ width: '100%', fontSize: '1rem' }}>
        <table style={{ width: ' 100%' }} className="transactionsList">
          <tbody>
            {!this.state.isLoading
              ? Object.keys(perDate).map((key) => {
                const res = [];
                res.push(
                  <tr key={key}>
                    <td style={{ padding: '10px 0 6px 4px', textAlign: 'right'}}><strong>{moment(key).format(this.state.dateFormat)}</strong></td>
                    <td className="line "></td>
                    <td colSpan="2"></td>
                  </tr>
                );
                perDate[key].map((item) => {
                  res.push(
                    <tr className="transaction" key={item.id}>
                      <td style={{ textAlign: 'right', fontWeight: '400'}} >
                        <ColoredAmount value={item.amount} currency={selectedCurrency} accurate={item.isConversionAccurate} />
                      </td>
                      <td className="line dot"></td>
                      <td>
                        {item.name}<br/>
                        <span style={{ opacity: 0.8, fontSize: '0.8em' }}>{item.category && categories
                          ? `${
                            this.categoryBreadcrumb(item.category).join(' \\ ')
                          }`
                          : ''}
                        {selectedCurrency.id !== item.originalCurrency
                          ? item.category ? ' \\ ' : ''
                          : ''}
                        {selectedCurrency.id !== item.originalCurrency
                          ? <Amount value={item.originalAmount} currency={currencies.find(c => c.id === item.originalCurrency)} />
                          : ''}
                        </span>
                      </td>
                      <td className={classes.actionsContainer}>
                        <IconButton
                          onClick={(event) => this._openActionMenu(event, item)}>
                          <MoreVertIcon fontSize="small" color="action" />
                        </IconButton>
                      </td>
                    </tr>
                  );
                });
                res.push(
                  <tr key='footer'>
                    <td></td>
                    <td className="line "></td>
                    <td colSpan="2"></td>
                  </tr>
                );

                return res;
              })
              : [
                'w220',
                'w250',
                'w220',
                'w220',
                'w120',
                'w250',
                'w220',
                'w220',
                'w150',
                'w250',
                'w220',
                'w220',
              ].map((value, i) => {
                return (
                  <tr className="transaction" key={i}>
                    <td style={{ textAlign: 'right', fontWeight: '400'}} >
                      <span className={'loading w80'} />
                    </td>
                    <td className="line dot" style={{ opacity: 0.5 }}></td>
                    <td>
                      <span className={'loading ' + value} /><br/>
                      <span className={'loading w80'} />
                    </td>
                    <td className={classes.actionsContainer}>
                      <IconButton disabled={true}>
                        <MoreVertIcon fontSize="small" color="action" />
                      </IconButton>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>


        <Menu
          anchorEl={ anchorEl }
          open={ Boolean(anchorEl) }
          onClose={this._closeActionMenu}
        >
          <MenuItem
            onClick={() => {
              this._closeActionMenu();
              this.state.onEdit(this.state.selectedTransaction);
            }}
          >
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              this._closeActionMenu();
              this.state.onDuplicate(this.state.selectedTransaction);
            }}
          >
            Duplicate
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              this._closeActionMenu();
              this.handleDeleteTransaction(this.state.selectedTransaction);
            }}
          >
            Delete
          </MenuItem>
        </Menu>

        {!this.isLoading && this.state.pagination < this.state.transactions.length ? (
          <CardActions>
            <Button fullWidth onClick={this.more}>More</Button>
          </CardActions>
        ) : (
          ''
        )}
        <Snackbar
          open={this.state.snackbar.open}
          message={this.state.snackbar.message}
          autoHideDuration={3000}
          TransitionComponent={(props) => <Slide {...props} direction="up" />}
          onClose={this.handleSnackbarRequestClose}
          action={
            <Button color="inherit" size="small" onClick={this.handleSnackbarRequestUndo}>
              Undo
            </Button>
          }
        />

      </div>
    );
  }
}

TransactionTable.propTypes = {
  classes: PropTypes.object.isRequired,
  transactions: PropTypes.array,
  filters: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDuplicate: PropTypes.func.isRequired,
  selectedCurrency: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    categories: state.categories.list,
    currencies: state.currencies,
    selectedCurrency: state.currencies.find((c) => c.id === state.account.currency)
  };
};

export default connect(mapStateToProps)(withStyles(styles)(TransactionTable));