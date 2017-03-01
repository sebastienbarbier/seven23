/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, {Component} from 'react';

import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import {List, ListItem} from 'material-ui/List';
import {Popover} from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import ArrowDropDown from 'material-ui/svg-icons/navigation/arrow-drop-down';

import CurrencyStore from '../../stores/CurrencyStore';
import AccountStore from '../../stores/AccountStore';
import AccountActions from '../../actions/AccountActions';

const styles = {
  width: '100%',
  height: 'auto',
  textAlign: 'left',
};

class CurrencySelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currencies: CurrencyStore.getAllCurrencies(),
      currenciesIndexed: CurrencyStore.getIndexedCurrencies(),
      selectedCurrency: CurrencyStore.getIndexedCurrencies()[AccountStore.selectedAccount().currency],
      open: false,
      anchorEl: null,
    };
  }

  updateCurrencies = () => {
    this.setState({
      currencies: CurrencyStore.getAllCurrencies()
    });
  }

  handleOpen = (event) => {
    // This prevents ghost click.
    event.preventDefault();
    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  }

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  }

  componentWillMount() {
    CurrencyStore.addChangeListener(this.updateCurrencies);
  }

  componentWillUnmount() {
    CurrencyStore.removeChangeListener(this.updateCurrencies);
  }

  handleChange = (currency) => {
    this.setState({
      selectedCurrency: currency,
      open: false,
    });

    var account = AccountStore.selectedAccount();
    account.currency = currency.id;
    AccountActions.update(account);
  };

  render() {
    return (
      <div>
        <List>
          <ListItem
            primaryText={this.state.selectedCurrency.name}
            rightIcon={<ArrowDropDown />}
            onTouchTap={this.handleOpen}/>
        </List>
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{"horizontal":"right","vertical":"center"}}
          targetOrigin={{"horizontal":"left","vertical":"center"}}
          onRequestClose={this.handleRequestClose}
          >
          <Menu>
            { this.state.currencies.map((currency) => (
              <MenuItem key={currency.id} primaryText={currency.name} onTouchTap={() => {this.handleChange(currency); }} />
            )) }
          </Menu>
        </Popover>
      </div>
    );
  }
}

export default CurrencySelector;
