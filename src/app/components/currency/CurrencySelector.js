/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";

import { useRouter } from "../../router";

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ExpandMore from "@material-ui/icons/ExpandMore";
import AccountsActions from "../../actions/AccountsActions";

const ITEM_HEIGHT = 48;

const styles = {
  list: {
    padding: 0
  }
};

export default function CurrencySelector(props) {
  const dispatch = useDispatch();
  const { history } = useRouter();
  const [isDisabled, setIsDisabled] = useState(props.disabled);
  const favoritesCurrencies = useSelector(state =>
    state.user &&
    state.user.profile &&
    state.user.profile.favoritesCurrencies &&
    state.user.profile.favoritesCurrencies.length
      ? state.user.profile.favoritesCurrencies
      : [state.account.currency]
  );
  const currencies = useSelector(state => {
    return state.currencies.filter(currency =>
      [state.account.currency, ...(state.account.currencies || [])].includes(
        currency.id
      )
    );
  });
  const selectedCurrency = useSelector(state => {
    return state.account
      ? state.currencies.find(c => c.id == state.account.currency)
      : null;
  });

  const [isOpen, setIsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpen = event => {
    event.preventDefault();
    if (props.onClick) {
      props.onClick();
    }

    setAnchorEl(event.currentTarget);
    setIsOpen(true);
  };

  const handleChange = currency => {
    if (props.onChange) {
      props.onChange();
    }

    dispatch(AccountsActions.switchCurrency(currency));
    setIsOpen(false);
  };

  return (
    <div className={props.className}>
      {selectedCurrency ? (
        <div>
          <List style={styles.list}>
            <ListItem
              button
              aria-owns={isOpen ? "menu-list-grow" : null}
              aria-haspopup="true"
              disabled={isDisabled}
              onClick={event => handleOpen(event)}
            >
              <ListItemText>
                {selectedCurrency[props.display || "name"]}
              </ListItemText>
              <ExpandMore color="action" />
            </ListItem>
          </List>

          <Menu
            id="long-menu"
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            getContentAnchorEl={null}
            open={Boolean(isOpen)}
            onClose={() => setIsOpen(false)}
            PaperProps={{
              style: {
                maxHeight: ITEM_HEIGHT * 4.5,
                width: 200
              }
            }}
          >
            {currencies.map(currency => (
              <MenuItem
                key={currency.id}
                selected={currency.id === selectedCurrency.id}
                onClick={() => {
                  handleChange(currency);
                }}
              >
                {currency.name}
              </MenuItem>
            ))}
          </Menu>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
