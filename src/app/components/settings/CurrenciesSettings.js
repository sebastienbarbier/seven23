import React, { Component } from 'react';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader'

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';

import StarIcon from '@material-ui/icons/Star';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import SearchIcon from '@material-ui/icons/Search';

import yellow from '@material-ui/core/colors/yellow';
import grey from '@material-ui/core/colors/grey';

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


  fuzzyFilter = function (searchText, key) {
    var compareString = key.toLowerCase();
    searchText = searchText.toLowerCase();

    var searchTextIndex = 0;
    for (var index = 0; index < key.length; index++) {
      if (compareString[index] === searchText[searchTextIndex]) {
        searchTextIndex += 1;
      }
    }

    return searchTextIndex === searchText.length;
  };

  filterFunction = currency => {
    if (this.state.filter === '') {
      return UserStore.user.favoritesCurrencies.indexOf(currency.id) === -1;
    } else {
      return (
        UserStore.user.favoritesCurrencies.indexOf(currency.id) === -1 &&
        (this.fuzzyFilter(this.state.filter, currency.name) ||
          this.fuzzyFilter(this.state.filter, currency.code))
      );
    }
  };

  render() {
    return (
      <div className="fullHeight">
        <Card className="card">
          <CardHeader
            title="Favorite Currencies"
            subtitle="Those currencies are the one you can select in the app."
          />
          <CardContent
            style={{ paddingTop: 0, display: 'flex', alignItems: 'flex-end' }}
          >
            <SearchIcon style={{ padding: '0 12px 8px 0' }} color={grey[700]} />
            <TextField
              label="Filter"
              fullWidth={true}
              onChange={this.handleFilterChange}
              value={this.state.filter}
              style={{ marginTop: 0 }}
            />
          </CardContent>
          <List subheader={
            <ListSubheader disableSticky={true}>
              Your favorites ({UserStore.user.favoritesCurrencies.length})
            </ListSubheader>}>
            {this.state.filter === '' ? (
              <span>
                {UserStore.user.favoritesCurrencies.map(currency => {
                  return (
                    <ListItem
                      button
                      key={currency}
                      onClick={() => {
                        this.handleRemove(currency);
                      }}
                    >
                      <ListItemIcon>
                        <StarIcon style={{ color: yellow[700]}} />
                      </ListItemIcon>
                      <ListItemText
                        primary={CurrencyStore.getIndexedCurrencies()[currency].name}
                        secondary={CurrencyStore.getIndexedCurrencies()[currency].code} />
                      <RemoveIcon />
                    </ListItem>
                  );
                })}
                <Divider />
              </span>
            ) : (
              ''
            )}
          </List>
          <List subheader={
            <ListSubheader disableSticky={true}>
              All currencies ({CurrencyStore.getAllCurrencies().length -
                UserStore.user.favoritesCurrencies.length})
            </ListSubheader>}>

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
                    button
                    key={currency.id}
                    onClick={() => {
                      this.handleAdd(currency.id);
                    }}
                  >
                    <ListItemIcon>
                      <StarIcon style={{ color: grey[300]}} />
                    </ListItemIcon>
                    <ListItemText primary={currency.name} secondary={currency.code}/>
                    <AddIcon />
                  </ListItem>
                );
              })}
          </List>
          {this.state.pagination <
          CurrencyStore.getAllCurrencies().filter(this.filterFunction)
            .length ? (
              <div style={{ padding: '0 20px 30px 20px' }}>
                <Button
                  onClick={this.handleMore}
                  fullWidth={true}
                >More</Button>
              </div>
            ) : (
              ''
            )}
        </Card>
      </div>
    );
  }
}

export default CurrenciesSettings;
