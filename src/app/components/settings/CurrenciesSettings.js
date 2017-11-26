import React, { Component } from "react";
import Subheader from "material-ui/Subheader";
import muiThemeable from "material-ui/styles/muiThemeable";
import { Card, CardTitle, CardText } from "material-ui/Card";
import { List, ListItem } from "material-ui/List";
import TextField from "material-ui/TextField";
import Divider from "material-ui/Divider";
import StarIcon from "material-ui/svg-icons/toggle/star";
import AddIcon from "material-ui/svg-icons/content/add";
import RemoveIcon from "material-ui/svg-icons/content/remove";
import { yellow700, grey300 } from "material-ui/styles/colors";

import AutoComplete from "material-ui/AutoComplete";

import CurrencyStore from "../../stores/CurrencyStore";
import UserActions from "../../actions/UserActions";
import UserStore from "../../stores/UserStore";

const styles = {};

class CurrenciesSettings extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      filter: ""
    };
  }

  componentWillReceiveProps(nextProps) {}

  handleFilterChange = event => {
    this.setState({
      filter: event.target.value
    });
  };

  handleAdd = id => {
    let array = UserStore.user.favoritesCurrencies;
    if (array.indexOf(id) === -1) {
      array.push(id);
      UserActions.update({
        favoritesCurrencies: array
      });
    }
  };

  handleRemove = id => {
    let array = UserStore.user.favoritesCurrencies;
    if (array.indexOf(id) != -1) {
      array.splice(array.indexOf(id), 1);
      UserActions.update({
        favoritesCurrencies: array
      });
    }
  };

  render() {
    return [
      <div className="full">
        <Card className="card">
          <CardTitle
            title="Favorite Currencies"
            subtitle="Those currencies are the one you can select in the app."
          />
          <CardText style={{ paddingTop: 0 }}>
            <TextField
              floatingLabelText="Filter"
              fullWidth={true}
              onChange={this.handleFilterChange}
              value={this.state.filter}
              style={{ marginTop: 0 }}
            />
          </CardText>
          <List>
            {this.state.filter === "" ? (
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
                        CurrencyStore.getIndexedCurrencies()[currency].name
                      }
                    />
                  );
                })}
                <Divider />
              </span>
            ) : (
              ""
            )}
            <Subheader>
              All currencies ({CurrencyStore.getAllCurrencies().length -
                UserStore.user.favoritesCurrencies.length})
            </Subheader>
            {CurrencyStore.getAllCurrencies()
              .filter(currency => {
                if (this.state.filter === "") {
                  return (
                    UserStore.user.favoritesCurrencies.indexOf(currency.id) ===
                    -1
                  );
                } else {
                  return (
                    UserStore.user.favoritesCurrencies.indexOf(currency.id) ===
                      -1 &&
                    (AutoComplete.fuzzyFilter(
                      this.state.filter,
                      currency.name
                    ) ||
                      AutoComplete.fuzzyFilter(
                        this.state.filter,
                        currency.code
                      ))
                  );
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
                    secondaryText={currency.name}
                  />
                );
              })}
          </List>
        </Card>
      </div>
    ];
  }
}

export default muiThemeable()(CurrenciesSettings);
