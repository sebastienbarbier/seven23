/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Divider from '@material-ui/core/Divider';

import CurrencyStore from '../../stores/CurrencyStore';
import AccountStore from '../../stores/AccountStore';
import UserStore from '../../stores/UserStore';
import AccountActions from '../../actions/AccountActions';

const ITEM_HEIGHT = 48;

const styles = {
  list: {
    padding: 0,
  },
};

class CurrencySelector extends Component {
  constructor(props) {
    super(props);
    this.history = props.history;
    this.state = {
      currencies: CurrencyStore.favoritesArray,
      currenciesIndexed: CurrencyStore.getIndexedCurrencies(),
      selectedCurrency: AccountStore.selectedAccount()
        ? CurrencyStore.getIndexedCurrencies()[
          AccountStore.selectedAccount().currency
        ]
        : null,
      open: false,
      anchorEl: null,
    };
  }

  updateCurrencies = () => {
    this.setState({
      currencies: CurrencyStore.favoritesArray,
    });
  };

  updateAccount = () => {
    this.setState({
      selectedCurrency: AccountStore.selectedAccount()
        ? CurrencyStore.getIndexedCurrencies()[
          AccountStore.selectedAccount().currency
        ]
        : null,
    });
  };

  updateUser = () => {
    this.setState({
      currencies: CurrencyStore.favoritesArray,
    });
  };

  handleOpen = event => {
    // This prevents ghost click.
    event.preventDefault();
    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  };

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  };

  componentWillMount() {
    UserStore.addChangeListener(this.updateUser);
    CurrencyStore.addChangeListener(this.updateCurrencies);
    AccountStore.addChangeListener(this.updateAccount);
  }

  componentWillUnmount() {
    UserStore.removeChangeListener(this.updateUser);
    CurrencyStore.removeChangeListener(this.updateCurrencies);
    AccountStore.removeChangeListener(this.updateAccount);
  }

  handleChange = currency => {
    this.setState({
      selectedCurrency: currency,
      open: false,
    });

    var account = AccountStore.selectedAccount();

    if (account) {
      account.currency = currency.id;
      AccountActions.switchCurrency(account);
    }
  };

  render() {
    const { anchorEl, open } = this.state;

    return (
      <div>
        {this.state.selectedCurrency ? (
          <div>
            <List style={styles.list}>
              <ListItem
                button
                ref={node => {
                  this.target1 = node;
                }}
                aria-owns={open ? 'menu-list-grow' : null}
                aria-haspopup="true"
                onClick={this.handleOpen}
              >
                <ListItemText>{this.state.selectedCurrency.name}</ListItemText>
                <ExpandMore color="action" />
              </ListItem>
            </List>

            <Menu
              id="long-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={this.handleRequestClose}
              PaperProps={{
                style: {
                  maxHeight: ITEM_HEIGHT * 4.5,
                  width: 200,
                },
              }}
            >
              {this.state.currencies.map(currency => (
                <MenuItem
                  key={currency.id}
                  onClick={() => {
                    this.handleChange(currency);
                  }}
                >
                  {currency.name}
                </MenuItem>
              ))}
              <Divider />
              <MenuItem
                onClick={() => {
                  this.history.push('/settings/currencies/');
                  this.setState({
                    open: false,
                  });
                }}
              >
                More ...
              </MenuItem>
            </Menu>
          </div>
        ) : (
          ''
        )}
      </div>
    );
  }
}

export default CurrencySelector;
