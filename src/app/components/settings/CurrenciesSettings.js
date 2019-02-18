import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';

import InputBase from '@material-ui/core/InputBase';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';

import StarIcon from '@material-ui/icons/Star';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import SearchIcon from '@material-ui/icons/Search';

import yellow from '@material-ui/core/colors/yellow';
import grey from '@material-ui/core/colors/grey';

import UserActions from '../../actions/UserActions';

class CurrenciesSettings extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      filter: '',
      pagination: 10,
    };
  }

  handleFilterChange = event => {
    this.setState({
      filter: event.target.value,
      pagination: 10,
    });
  };

  handleAdd = id => {
    const { favoritesCurrencies, dispatch } = this.props;
    const newFavorites = Array.from(favoritesCurrencies);
    if (newFavorites.indexOf(id) === -1) {
      newFavorites.push(id);
      dispatch(UserActions.update({
        favoritesCurrencies: newFavorites,
      }));
    }
    this.setState({ filter: '' });
  };

  handleRemove = id => {
    const { favoritesCurrencies, dispatch } = this.props;
    let array = Array.from(favoritesCurrencies);
    if (array.indexOf(id) != -1) {
      array.splice(array.indexOf(id), 1);
      dispatch(UserActions.update({
        favoritesCurrencies: array,
      }));
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
      return this.props.favoritesCurrencies.indexOf(currency.id) === -1;
    } else {
      return (
        this.props.favoritesCurrencies.indexOf(currency.id) === -1 &&
        (this.fuzzyFilter(this.state.filter, currency.name) ||
          this.fuzzyFilter(this.state.filter, currency.code))
      );
    }
  };

  render() {
    const { favoritesCurrencies, currencies } = this.props;
    return (
      <div>
        <div className="sticky_header_search">
          <SearchIcon  color="action"/>
          <InputBase
            placeholder="Search"
            fullWidth
            value={this.state.filter}
            onChange={this.handleFilterChange}
            style={{ margin: '2px 10px 0 10px' }} />
        </div>
        <List subheader={
          <ListSubheader disableSticky={true}>
            Your favorites ({favoritesCurrencies.length})
          </ListSubheader>}>
          {this.state.filter === '' ? (
            <span>
              {favoritesCurrencies.map(favoriteCurrencyId => {
                const currency = currencies.find(c => c.id === favoriteCurrencyId);
                return (
                  <ListItem
                    button
                    key={currency.id}
                    onClick={() => {
                      this.handleRemove(favoriteCurrencyId);
                    }}
                  >
                    <ListItemIcon>
                      <StarIcon style={{ color: yellow[700]}} />
                    </ListItemIcon>
                    <ListItemText
                      primary={currency.name}
                      secondary={currency.code} />
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
            All currencies ({currencies.length - favoritesCurrencies.length})
          </ListSubheader>}>

          {currencies
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
        currencies.filter(this.filterFunction)
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
      </div>
    );
  }
}

CurrenciesSettings.propTypes = {
  dispatch: PropTypes.func.isRequired,
  currencies: PropTypes.array.isRequired,
  favoritesCurrencies: PropTypes.array.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    currencies: state.currencies,
    favoritesCurrencies: state.user.profile.favoritesCurrencies
  };
};

export default connect(mapStateToProps)(CurrenciesSettings);