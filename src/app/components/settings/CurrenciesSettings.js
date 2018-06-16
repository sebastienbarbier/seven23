import React, { Component } from 'react';
import Subheader from 'material-ui/Subheader';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { Card, CardTitle, CardText } from 'material-ui/Card';
import { List, ListItem } from 'material-ui/List';
import TextField from 'material-ui/TextField';
import Divider from 'material-ui/Divider';
import StarIcon from 'material-ui/svg-icons/toggle/star';
import AddIcon from 'material-ui/svg-icons/content/add';
import RemoveIcon from 'material-ui/svg-icons/content/remove';
import SearchIcon from 'material-ui/svg-icons/action/search';
import { yellow700, grey300, grey700 } from 'material-ui/styles/colors';
import FlatButton from 'material-ui/FlatButton';

import AutoComplete from 'material-ui/AutoComplete';

import CurrencyStore from '../../stores/CurrencyStore';
import UserActions from '../../actions/UserActions';
import UserStore from '../../stores/UserStore';

class CurrenciesSettings extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      filter: '',
      pagination: 10,
    };
  }

  componentWillReceiveProps(nextProps) {}

  handleFilterChange = event => {
    this.setState({
      filter: event.target.value,
      pagination: 10,
    });
  };

  handleAdd = id => {
    let array = UserStore.user.favoritesCurrencies;
    if (array.indexOf(id) === -1) {
      array.push(id);
      UserActions.update({
        favoritesCurrencies: array,
      });
    }
  };

  handleRemove = id => {
    let array = UserStore.user.favoritesCurrencies;
    if (array.indexOf(id) != -1) {
      array.splice(array.indexOf(id), 1);
      UserActions.update({
        favoritesCurrencies: array,
      });
    }
  };

  handleMore = () => {
    this.setState({
      pagination: this.state.pagination + 10,
    });
  };

  filterFunction = currency => {
    if (this.state.filter === '') {
      return UserStore.user.favoritesCurrencies.indexOf(currency.id) === -1;
    } else {
      return (
        UserStore.user.favoritesCurrencies.indexOf(currency.id) === -1 &&
        (AutoComplete.fuzzyFilter(this.state.filter, currency.name) ||
          AutoComplete.fuzzyFilter(this.state.filter, currency.code))
      );
    }
  };

  render() {
    return (
      <div className="fullHeight">
        <Card className="card">
          <CardTitle
            title="Favorite Currencies"
            subtitle="Those currencies are the one you can select in the app."
          />
          <CardText
            style={{ paddingTop: 0, display: 'flex', alignItems: 'flex-end' }}
          >
            <SearchIcon style={{ padding: '0 12px 8px 0' }} color={grey700} />
            <TextField
              floatingLabelText="Filter"
              fullWidth={true}
              onChange={this.handleFilterChange}
              value={this.state.filter}
              style={{ marginTop: 0 }}
            />
          </CardText>
          <List>
            {this.state.filter === '' ? (
              <span>
                <Subheader>
                  Your favorites ({UserStore.user.favoritesCurrencies.length})
                </Subheader>
                {UserStore.user.favoritesCurrencies.map(currency => {
                  return (
                    <ListItem
                      key={currency}
                      leftIcon={<StarIcon color={yellow700} />}
                      rightIcon={<RemoveIcon />}
                      onClick={() => {
                        this.handleRemove(currency);
                      }}
                      primaryText={
                        CurrencyStore.getIndexedCurrencies()[currency].name
                      }
                      secondaryText={
                        CurrencyStore.getIndexedCurrencies()[currency].code
                      }
                    />
                  );
                })}
                <Divider />
              </span>
            ) : (
              ''
            )}
            <Subheader>
              All currencies ({CurrencyStore.getAllCurrencies().length -
                UserStore.user.favoritesCurrencies.length})
            </Subheader>
            {CurrencyStore.getAllCurrencies()
              .filter(this.filterFunction)
              .filter((currency, index) => {
                if (index > this.state.pagination) {
                  return false;
                } else {
                  return true;
                }
              })
              .map(currency => {
                return (
                  <ListItem
                    key={currency.id}
                    leftIcon={<StarIcon color={grey300} />}
                    rightIcon={<AddIcon />}
                    onClick={() => {
                      this.handleAdd(currency.id);
                    }}
                    primaryText={currency.name}
                    secondaryText={currency.code}
                  />
                );
              })}
          </List>
          {this.state.pagination <
          CurrencyStore.getAllCurrencies().filter(this.filterFunction)
            .length ? (
              <div style={{ padding: '0 20px 30px 20px' }}>
                <FlatButton
                  label="More"
                  onClick={this.handleMore}
                  fullWidth={true}
                />
              </div>
            ) : (
              ''
            )}
        </Card>
      </div>
    );
  }
}

export default muiThemeable()(CurrenciesSettings);
