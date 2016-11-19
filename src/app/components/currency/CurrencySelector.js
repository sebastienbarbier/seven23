/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, {Component} from 'react';

import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';

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
      value: AccountStore.selectedAccount().currency,
    };
  }

  updateCurrencies = () => {
    this.setState({
      currencies: CurrencyStore.getAllCurrencies()
    });
  }

  componentWillMount() {
    CurrencyStore.addChangeListener(this.updateCurrencies);
  }

  componentWillUnmount() {
    CurrencyStore.removeChangeListener(this.updateCurrencies);
  }

  handleChange = (event, index, value) => {
    this.setState({value: value});
    var account = AccountStore.selectedAccount();
    account.currency = value;
    AccountActions.update(account);
  };

  render() {
    return (
      <DropDownMenu
        style={styles}
        value={this.state.value}
        onChange={this.handleChange}>
          { this.state.currencies.map((currency) => (
          <MenuItem key={currency.id} value={currency.id} primaryText={currency.name} />
        )) }
      </DropDownMenu>
    );
  }
}

export default CurrencySelector;
