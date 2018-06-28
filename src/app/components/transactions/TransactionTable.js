import React, { Component } from 'react';
import moment from 'moment';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';

import MoreVertIcon from '@material-ui/icons/MoreVert';
import InfoIcon from '@material-ui/icons/Info';
import grey from '@material-ui/core/colors/grey';

import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import Slide from '@material-ui/core/Slide';

import AccountStore from '../../stores/AccountStore';
import CurrencyStore from '../../stores/CurrencyStore';
import TransactionActions from '../../actions/TransactionActions';
import TransactionStore from '../../stores/TransactionStore';

const styles = {
  amountErrorIcon: {
    position: 'relative',
    float: 'left',
    top: '-2px',
    right: '10px',
  },
  warningPopover: {
    padding: '5px 10px',
    background: grey[800],
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
      padding: '4px 0px 8px 15px',
    },
    text: {
      flexGrow: '1',
    },
    title: {
      fontSize: '16px',
      margin: '0 0 4px 0',
    },
    subtitle: {
      display: 'flex',
      width: '100%',
      fontSize: '14px',
      flexDirection: 'row',
      justifyContent: 'space-between',
      opacity: '0.8',
    },
    span: {
      textTransform: 'capitalize',
    },
    warning: {
      display: 'inline',
      height: '17px',
      verticalAlign: 'top',
      position: 'relative',
      top: '2px',
    },
    price: {
      fontSize: '15px',
      textAlign: 'right',
    },
    menu: {
      width: '40px',
    },
  },
};


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
      categories: props.categories,
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
      const category = this.state.categories.find(category => category.id == id);
      if (category.parent) {
        result.push(this.categoryBreadcrumb(category.parent));
      }
      result.push(category.name);
      return result;
    }

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
      categories: nextProps.categories,
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
    // this.state.transactions.delete(transaction);
    this.setState({
      transactions: this.state.transactions.filter(item => {
        return item.id != transaction.id;
      }),
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
        },
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
      },
    });
  };

  render() {
    const { anchorEl } = this.state;


    console.log(this.state.transactions);

    return (
      <div style={{ padding: '0 0 40px 20px' }}>
        <ul style={{ padding: '0 0 10px 0' }}>
          {!this.state.isLoading
            ? this.state.transactions
              .filter((item, index) => {
                return (
                  !this.state.pagination || index < this.state.pagination
                );
              })
              .map(item => {
                return (
                  <li
                    key={item.id}
                    style={styles.row.rootElement}
                    className={
                      this.state.hasTransactionsToday &&
                        this.today.isSame(item.date, 'd')
                        ? 'isToday'
                        : !this.state.hasTransactionsToday &&
                          this.yesteday.isSame(item.date, 'd')
                          ? 'isYesteday'
                          : ''
                    }
                  >
                    <div style={styles.row.text}>
                      <p style={styles.row.title}>{item.name}</p>
                      <div style={styles.row.subtitle}>
                        <p style={{ margin: 0 }}>
                          {moment(item.date).format(this.state.dateFormat)}
                          {item.category && this.state.categories
                            ? ` \\ ${
                              this.categoryBreadcrumb(item.category).join(' \\ ')
                            }`
                            : ''}
                          {AccountStore.selectedAccount().currency !==
                          item.originalCurrency
                            ? ` \\ ${CurrencyStore.format(
                              item.originalAmount,
                              item.originalCurrency,
                              true,
                            )}`
                            : ''}
                          {item.isConversionAccurate === false ? (
                            <span style={styles.row.span}>
                              <br />
                              <InfoIcon
                                color={grey[600]}
                                style={styles.row.warning}
                                onClick={event => {
                                  this.handleWarningOpen(event, item);
                                }}
                              />{' '}
                              exchange rate not accurate
                            </span>
                          ) : (
                            ''
                          )}
                        </p>
                      </div>
                    </div>
                    <p style={styles.row.price}>
                      {CurrencyStore.format(item.amount)}
                    </p>
                    <div style={styles.row.menu}>
                      <IconButton
                        onClick={(event) => this._openActionMenu(event, item)}>
                        <MoreVertIcon color="action" />
                      </IconButton>
                    </div>
                  </li>
                );
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
                <li key={i} style={styles.row.rootElement}>
                  <div style={styles.row.text}>
                    <p style={styles.row.title}>
                      <span className={'loading w80'} />
                    </p>
                    <div style={styles.row.subtitle}>
                      <p style={{ margin: 0 }}>
                        <span className={`loading ${value}`} />
                      </p>
                    </div>
                  </div>
                  <p style={styles.row.price}>
                    <span className={'loading w50'} />
                  </p>
                  <div style={styles.row.menu}>
                    <IconButton disabled>
                      <MoreVertIcon />
                    </IconButton>
                  </div>
                </li>
              );
            })}
        </ul>

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

        {!this.isLoading &&
        this.state.pagination < this.state.transactions.length ? (
            <div style={{ padding: '0 40px 30px 0' }}>
              <Button fullWidth onClick={this.more}>More</Button>
            </div>
          ) : (
            ''
          )}
        <Snackbar
          open={this.state.snackbar.open}
          message={this.state.snackbar.message}
          autoHideDuration={3000}
          TransitionComponent={(props) => <Slide {...props} direction="up" />}
          onRequestClose={this.handleSnackbarRequestClose}
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

// <Popover
//   open={this.state.openWarning}
//   anchorEl={this.state.anchorEl}
//   anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
//   targetOrigin={{ horizontal: 'right', vertical: 'top' }}
//   onRequestClose={this.handleWarningClose}
//   style={styles.warningPopover}
// >
// {this.state.selectedTransaction &&
// this.state.selectedTransaction.isConversionFromFuturChange ? (
//     <p>
//     No exchange rate was define at this date.<br />
//     A future rate has been used to estimate this amount.
//     </p>
//   ) : (
//     ''
//   )}

// {this.state.selectedTransaction &&
// this.state.selectedTransaction.isSecondDegreeRate ? (
//     <p>
//     Exchange rate is not from a direct exchange but with an other
//     currency in between.
//     </p>
//   ) : (
//     ''
//   )}

// {this.state.selectedTransaction !== undefined &&
// this.state.selectedTransaction.isSecondDegreeRate === false &&
// this.state.selectedTransaction.isConversionFromFuturChange ===
//   false ? (
//     <p>No exchange rate available for those currencies.</p>
//   ) : (
//     ''
//   )}
// </Popover>
//
export default TransactionTable;
