/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import { List, ListItem } from 'material-ui/List';
import { Popover } from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import KeyboardArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down';

import CurrencyStore from '../../stores/CurrencyStore';
import AccountStore from '../../stores/AccountStore';
import AccountActions from '../../actions/AccountActions';

const styles = {
  list: {
    padding: 0,
  },
};

class CurrencySelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currencies: CurrencyStore.getAllCurrencies(),
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
      currencies: CurrencyStore.getAllCurrencies(),
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
    CurrencyStore.addChangeListener(this.updateCurrencies);
    AccountStore.addChangeListener(this.updateAccount);
  }

  componentWillUnmount() {
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
    return (
      <div>
        {this.state.selectedCurrency ? (
          <div>
            <List style={styles.list}>
              <ListItem
                primaryText={this.state.selectedCurrency.name}
                rightIcon={<KeyboardArrowDown />}
                onTouchTap={this.handleOpen}
              />
            </List>
            <Popover
              open={this.state.open}
              anchorEl={this.state.anchorEl}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              targetOrigin={{ horizontal: 'right', vertical: 'top' }}
              onRequestClose={this.handleRequestClose}
            >
              <Menu>
                {this.state.currencies.map(currency => (
                  <MenuItem
                    key={currency.id}
                    primaryText={currency.name}
                    onTouchTap={() => {
                      this.handleChange(currency);
                    }}
                  />
                ))}
              </Menu>
            </Popover>
          </div>
        ) : (
          ''
        )}
      </div>
    );
  }
}

export default CurrencySelector;
