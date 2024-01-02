/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import AccountsActions from "../../actions/AccountsActions";
import AppActions from "../../actions/AppActions";

import ExpandMore from "@mui/icons-material/ExpandMore";
import NavigateNext from "@mui/icons-material/NavigateNext";

import AccountForm from "../settings/accounts/AccountForm";

const ITEM_HEIGHT = 48;

const styles = {
  list: {
    padding: 0,
  },
};

export default function CurrencySelector(props) {
  const dispatch = useDispatch();

  const account = useSelector((state) => state.account);
  const allCurrencies = useSelector((state) => state.currencies);
  const accountCurrency = useSelector((state) => state.account.currency);
  const accountCurrencies = useSelector((state) => state.account.currencies);

  const currencies = allCurrencies.filter((currency) =>
    [accountCurrency, ...(accountCurrencies || [])].includes(currency.id)
  );

  // Need to create selector
  const selectedCurrency = accountCurrency
    ? allCurrencies.find((c) => c.id == accountCurrency)
    : null;

  const [isOpen, setIsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpen = (event) => {
    event.preventDefault();
    if (props.onClick) {
      props.onClick();
    }

    setAnchorEl(event.currentTarget);
    setIsOpen(true);
  };

  const handleChange = (currency) => {
    if (props.onChange) {
      props.onChange();
    }

    dispatch(AccountsActions.switchCurrency(currency));
    setIsOpen(false);
  };

  const handleManageCurrencies = () => {
    dispatch(
      AppActions.openModal(
        <AccountForm
          account={account}
          onSubmit={() => dispatch(AppActions.closeModal())}
          onClose={() => dispatch(AppActions.closeModal())}
        />
      )
    );

    if (props.onClose) {
      props.onClose();
    }
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
              disabled={props.disabled}
              onClick={(event) => handleOpen(event)}
            >
              <ListItemText>
                {selectedCurrency[props.display || "name"]}
              </ListItemText>
              {props.direction == "bottom" ? (
                <ExpandMore color="action" />
              ) : (
                <NavigateNext color="action" />
              )}
            </ListItem>
          </List>

          <Menu
            id={isOpen ? "long-menu" : null}
            anchorEl={anchorEl}
            anchorOrigin={
              props.direction == "bottom"
                ? {
                    vertical: "bottom",
                    horizontal: "left",
                  }
                : {
                    vertical: "bottom",
                    horizontal: "right",
                  }
            }
            transformOrigin={
              props.direction == "bottom"
                ? {
                    vertical: "top",
                    horizontal: "left",
                  }
                : {
                    vertical: "bottom",
                    horizontal: "left",
                  }
            }
            open={Boolean(isOpen)}
            onClose={() => setIsOpen(false)}
            PaperProps={{
              style: {
                maxHeight: ITEM_HEIGHT * 4.5,
                width: 200,
              },
            }}
          >
            {currencies.map((currency) => (
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
            <Divider />
            <MenuItem onClick={() => handleManageCurrencies()}>
              <small style={{ opacity: 0.8 }}>Manage currencies</small>
            </MenuItem>
          </Menu>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
