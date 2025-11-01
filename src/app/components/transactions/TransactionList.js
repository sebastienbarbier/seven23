import moment from "moment";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import ReplayIcon from "@mui/icons-material/Replay";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";

import AppActions from "../../actions/AppActions";
import TransactionActions from "../../actions/TransactionActions";

import { useTheme } from "../../theme";
import { Amount, ColoredAmount } from "../currency/Amount";
import TransactionForm from "../transactions/TransactionForm";

import "./TransactionList.scss";

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

export default function TransactionList(props) {
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
    setPagination(pagination + parseInt(props.pagination));
  };
  //
  // Handle transactions
  //

  const { perDate } = useMemo(() => {
    let result = props.transactions || [];
    let resultDate = [];
    result.forEach((transaction) => {
      if (transaction.category) {
        const c = categories?.find((c) => c.id == transaction.category);
        transaction.category_name = c && c.name ? c.name.toLowerCase() : "";
      } else {
        transaction.category_name = "";
      }
    });
    result = result.sort(sortingFunction);
    result = result.filter((item, index) => {
      return !pagination || index < pagination;
    });

    result.forEach((transaction) => {
      resultDate[transaction.date] = resultDate[transaction.date]
        ? resultDate[transaction.date].concat([transaction])
        : [transaction];
    });

    return {
      transactions: result,
      perDate: resultDate,
    };
  }, [props.transactions, pagination, categories]);

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

  const onEditTransaction = (transaction = {}) => {
    dispatch(
      AppActions.openModal(
        <TransactionForm
          transaction={transaction}
          onSubmit={() => dispatch(AppActions.closeModal())}
          onClose={() => dispatch(AppActions.closeModal())}
        />
      )
    );
  };

  const onDuplicationTransaction = (transaction = {}) => {
    const newTransaction = Object.assign({}, transaction);
    delete newTransaction.id;
    delete newTransaction.date;
    onEditTransaction(newTransaction);
  };

  if (props.isLoading) {
    return (
      <>
        <div style={{ width: "100%" }}>
          <table className="transactionList">
            {[
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
            ].map((value, index) => {
              return (
                <tr key={`${index}`}>
                  <td>
                    <span className={"loading w80"} />
                  </td>
                  <td>
                    <span className={"loading " + value} />
                    <br />
                    <span className={"loading w80"} />
                  </td>
                  <td>
                    <IconButton disabled={true} size="large">
                      <MoreVertIcon fontSize="small" color="action" />
                    </IconButton>
                  </td>
                </tr>
              );
            })}
          </table>
        </div>
      </>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      <table className="transactionList">
        {Object.keys(perDate).map((key) => {
          // Calculate sum of amounts for this date using reduce (only negative values)
          const totalAmount = perDate[key].reduce((sum, transaction) => 
            transaction.amount < 0 ? sum + transaction.amount : sum, 0);
          const res = []; // Array of days
          // For each transaction
          perDate[key].map((item, index) => {
            // Add price tag
            const isRecurrentNew = item.frequency && item.duration;
            if (index === 0) {
              res.push(
                <tr key={`date-${index}`}>
                  <th>
                    <Tooltip 
                      open={perDate[key].length > 1 ? undefined : false} 
                      title={
                        <Amount value={totalAmount} 
                        currency={selectedCurrency} 
                        style={{paddingBottom: 0}} />
                      } 
                      slotProps={{
                        tooltip: {
                          style: {paddingBottom: 1}
                        }
                      }}
                      sx={{pb: 0, height: 28}}
                      placement="right" arrow>
                      <h3>{moment(key).format(dateFormat)}</h3>
                    </Tooltip>
                  </th>
                </tr>
              );
            }

            res.push(
              <tr
                key={`${index}`}
                className={`${index === 0 && "hasDateChip"} ${item.isPending && "isPending"}`}
              >
                <td>
                  <ColoredAmount
                    tabularNums
                    value={item.amount}
                    isPending={item.isPending}
                    currency={selectedCurrency}
                    accurate={item.isConversionAccurate}
                  />
                  {item.isPending && (
                    <>
                      <p>Pending</p>
                    </>
                  )}
                </td>
                <td>
                  {item.name}
                  {isRecurrentNew && (
                    <ReplayIcon
                      sx={{
                        opacity: 0.8,
                        width: "1rem",
                        height: "1rem",
                        marginLeft: "4px",
                        verticalAlign: "bottom",
                      }}
                    />
                  )}
                  {isRecurrentNew && item.isLastRecurrence && (
                    <Box
                      component="span"
                      sx={{
                        opacity: 0.8,
                        fontSize: "0.8em",
                        marginLeft: "4px",
                        color: theme.palette.numbers.red,
                      }}
                    >
                      Last recurrence
                    </Box>
                  )}
                  {(!!item.category ||
                    selectedCurrency.id !== item.originalCurrency) && (
                    <>
                      <br />
                      <span style={{ opacity: 0.8, fontSize: "0.8em" }}>
                        {item.category && categories
                          ? `${categoryBreadcrumb(item.category).join(" \\ ")}`
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
                    </>
                  )}
                </td>
                <td>
                  <IconButton
                    onClick={(event) => _openActionMenu(event, item)}
                    size="large"
                  >
                    <MoreVertIcon fontSize="small" color="action" />
                  </IconButton>
                </td>
              </tr>
            );
          });

          return res;
        })}
      </table>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={_closeActionMenu}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem
          onClick={() => {
            _closeActionMenu();
            if (props.onEdit) {
              props.onEdit(selectedTransaction);
            } else {
              onEditTransaction(selectedTransaction);
            }
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            _closeActionMenu();
            if (props.onDuplicate) {
              props.onDuplicate(selectedTransaction);
            } else {
              onDuplicationTransaction(selectedTransaction);
            }
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
      {!props.isLoading &&
        pagination &&
        pagination < props.transactions.length && (
          <Button fullWidth onClick={() => more()} className="moreButton">
            More
          </Button>
        )}
    </div>
  );
}
