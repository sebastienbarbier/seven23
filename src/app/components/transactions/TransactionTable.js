import moment from "moment";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import CardActions from "@mui/material/CardActions";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ReplayIcon from "@mui/icons-material/Replay";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";

import TransactionActions from "../../actions/TransactionActions";
import { ColoredAmount, Amount } from "../currency/Amount";
import { useTheme } from '../../theme';

import './TransactionTable.scss';

const CSS_ACTIONS = {
  textAlign: "right",
  paddingRight: "8px",
};

function sortingFunction(a, b) {
  if (a.date < b.date) {
    return 1;
  } else if (a.date > b.date) {
    return -1;
  } else if (a.category_name < b.category_name) {
    return -1;
  } else if (a.category_name > b.category_name) {
    return 1;
  } else if (a.amount < b.amount) {
    return 1;
  } else if (a.amount > b.amount) {
    return -1;
  } else if (a.name < b.name) {
    return 1;
  } else {
    return -1;
  }
}

export default function TransactionTable(props) {
  const dispatch = useDispatch();
  const theme = useTheme();

  const categories = useSelector((state) =>
    state.categories ? state.categories.list : null
  );
  const currencies = useSelector((state) => state.currencies);
  const selectedCurrency = useSelector((state) =>
    state.currencies && Array.isArray(state.currencies)
      ? state.currencies.find((c) => c.id === state.account.currency)
      : null
  );

  const dateFormat = props.dateFormat || "ddd D";

  // Pagination
  const [pagination, setPagination] = useState(
    props.pagination ? parseInt(props.pagination) : null
  );
  const more = () => {
    setPagination(pagination + 40);
  };
  //
  // Handle transactions
  //

  let transactions = props.transactions || [];
  transactions.forEach((transaction) => {
    if (transaction.category) {
      const c = categories.find((c) => c.id == transaction.category);
      transaction.category_name = c && c.name ? c.name.toLowerCase() : "";
    } else {
      transaction.category_name = "";
    }
  });
  transactions = transactions.sort(sortingFunction);

  const perDate = {};
  transactions
    .filter((item, index) => {
      return !pagination || index < pagination;
    })
    .forEach((transaction) => {
      perDate[transaction.date] = perDate[transaction.date]
        ? perDate[transaction.date].concat([transaction])
        : [transaction];
    });

  //
  // Transaction menu to edit, delete, duplicate a transaction
  //
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const _openActionMenu = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedTransaction(item);
  };

  const _closeActionMenu = () => {
    setAnchorEl(null);
  };

  //
  // UI method to display a transaction breadcrumb
  //
  const categoryBreadcrumb = (id) => {
    const result = [];
    const category = categories.find((category) => category.id == id);
    if (category) {
      if (category.parent) {
        result.push(categoryBreadcrumb(category.parent));
      }
      result.push(category.name);
    }
    return result;
  };

  const handleDeleteTransaction = (transaction) => {
    dispatch(TransactionActions.delete(transaction));
  };

  return (
    <div style={{ width: "100%", fontSize: "1rem" }}>
      <table style={{ width: " 100%" }} className="transactionsList">
        <tbody>
          {!props.isLoading
            ? Object.keys(perDate).map((key) => {
                const res = [];
                res.push(
                  <tr key={key}>
                    <td
                      style={{
                        padding: "10px 0 6px 4px",
                        textAlign: "right",
                      }}
                    >
                    </td>
                    <td className="line date"><strong>{moment(key).format(dateFormat)}</strong></td>
                    <td colSpan="2"></td>
                  </tr>
                );
                perDate[key].map((item) => {
                  const isRecurrent = item.frequency && item.duration;
                  res.push(
                    <tr className="transaction" key={item.id}>
                      <td
                        style={{
                          textAlign: "right",
                          fontWeight: "400",
                          paddingLeft: 10,
                        }}
                      >
                        <ColoredAmount
                          tabularNums
                          value={item.amount}
                          currency={selectedCurrency}
                          accurate={item.isConversionAccurate}
                        />
                      </td>
                      <td className="line dot"></td>
                      <td>
                        {item.name}
                        {isRecurrent && (
                          <ReplayIcon sx={{
                            opacity: 0.8,
                            width: "1rem",
                            height: "1rem",
                            marginLeft: "4px",
                            verticalAlign: "bottom",
                          }} />
                        )}
                        {isRecurrent && item.isLastRecurrence && (
                          <Box component="span" sx={{
                            opacity: 0.8,
                            fontSize: "0.8em",
                            marginLeft: '4px',
                            color: theme.palette.numbers.red,
                          }}>
                            Last recurrence
                          </Box>
                        )}
                        <br />
                        <span style={{ opacity: 0.8, fontSize: "0.8em" }}>
                          {item.category && categories
                            ? `${categoryBreadcrumb(item.category).join(
                                " \\ "
                              )}`
                            : ""}
                          {selectedCurrency.id !== item.originalCurrency
                            ? item.category
                              ? " \\ "
                              : ""
                            : ""}
                          {selectedCurrency.id !== item.originalCurrency ? (
                            <Amount
                              value={item.originalAmount}
                              currency={currencies.find(
                                (c) => c.id === item.originalCurrency
                              )}
                            />
                          ) : (
                            ""
                          )}
                        </span>
                      </td>
                      <Box component="td" sx={CSS_ACTIONS} className={"action"}>
                        <IconButton onClick={(event) => _openActionMenu(event, item)} size="large">
                          <MoreVertIcon fontSize="small" color="action" />
                        </IconButton>
                      </Box>
                    </tr>
                  );
                });

                return res;
              })
            : [
                "w220",
                "w250",
                "w220",
                "w220",
                "w120",
                "w250",
                "w220",
                "w220",
                "w150",
                "w250",
                "w220",
                "w220",
                "w220",
                "w220",
                "w120",
                "w250",
                "w220",
                "w220",
                "w150",
                "w250",
                "w220",
                "w220",
              ].map((value, i) => {
                return (
                  <tr className="transaction" key={i}>
                    <td style={{ textAlign: "right", fontWeight: "400" }}>
                      <span className={"loading w80"} />
                    </td>
                    <td className="line dot" style={{ opacity: 0.5 }}></td>
                    <td>
                      <span className={"loading " + value} />
                      <br />
                      <span className={"loading w80"} />
                    </td>
                    <Box component="td" sx={CSS_ACTIONS} className={"action"}>
                      <IconButton disabled={true} size="large">
                        <MoreVertIcon fontSize="small" color="action" />
                      </IconButton>
                    </Box>
                  </tr>
                );
              })}
        </tbody>
      </table>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={_closeActionMenu}
      >
        <MenuItem
          onClick={() => {
            _closeActionMenu();
            props.onEdit(selectedTransaction);
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            _closeActionMenu();
            props.onDuplicate(selectedTransaction);
          }}
        >
          Duplicate
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            _closeActionMenu();
            handleDeleteTransaction(selectedTransaction);
          }}
        >
          Delete
        </MenuItem>
      </Menu>

      {!props.isLoading && pagination && pagination < transactions.length && (
        <CardActions>
          <Button fullWidth onClick={() => more()}>
            More
          </Button>
        </CardActions>
      )}
    </div>
  );
}