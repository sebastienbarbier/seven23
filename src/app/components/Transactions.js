/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import "./Transactions.scss";

import React, { Component, useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { withRouter } from "react-router-dom";
import moment from "moment";

import SwipeableViews from "react-swipeable-views";

import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";

import Fab from "@material-ui/core/Fab";

import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

import blue from "@material-ui/core/colors/blue";
import red from "@material-ui/core/colors/red";
import green from "@material-ui/core/colors/green";

import Chip from "@material-ui/core/Chip";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";

import IconButton from "@material-ui/core/IconButton";

import NavigateBefore from "@material-ui/icons/NavigateBefore";
import NavigateNext from "@material-ui/icons/NavigateNext";
import ContentAdd from "@material-ui/icons/Add";
import ContentRemove from "@material-ui/icons/Remove";

import TransactionForm from "./transactions/TransactionForm";
import TransactionTable from "./transactions/TransactionTable";
import StatisticsActions from "../actions/StatisticsActions";
import UserButton from "./settings/UserButton";

import { filteringCategoryFunction } from "./transactions/TransactionUtils";

import { BalancedAmount, ColoredAmount, Amount } from "./currency/Amount";

const styles = theme => ({
  fab: {
    margin: theme.spacing()
  }
});

const Transactions = withRouter(({ match, history }) => {
  const dispatch = useDispatch();
  const [dateBegin, setDateBegin] = useState(() =>
    moment.utc([match.params.year, match.params.month - 1]).startOf("month")
  );

  const [filters, setFilters] = useState([]);
  const [open, setOpen] = useState(false);
  const [component, setComponent] = useState(false);
  const [tabs, setTabs] = useState("transactions");

  const accountCurrencyId = useSelector(state => state.account.currency);
  const currencies = useSelector(state => state.currencies);
  const [selectedCurrency, setSelectedCurrency] = useState(() =>
    currencies.find(c => c.id === accountCurrencyId)
  );

  const [statistics, setStatistics] = useState(null);
  const transactions = useSelector(state => state.transactions);
  const categories = useSelector(state =>
    state.categories ? state.categories.list : null
  );

  useEffect(() => {
    if (statistics) {
      setSelectedCurrency(currencies.find(c => c.id === accountCurrencyId));
    }
  }, [accountCurrencyId]);

  // If transactions change, we refresh statistics
  useEffect(() => {
    if (statistics) {
      setStatistics(null);
    }
    refreshData();
  }, [match.params.year, match.params.month]);

  useEffect(() => {
    if (!categories) {
      setFilters([]);
    }
    if (!transactions && statistics) {
      setStatistics(null);
    } else if (transactions && !statistics) {
      refreshData();
    } else if (transactions && statistics) {
      refreshData();
    }
  }, [transactions, categories]);

  function refreshData(newFilters = null) {
    let promise;
    let useFilters = newFilters || filters;

    function applyFilters(result) {
      const filtered_transactions = result.transactions.filter(transaction =>
        filteringCategoryFunction(transaction, useFilters)
      );

      const filtered_stats = {
        incomes: 0,
        expenses: 0
      };
      filtered_transactions.forEach(transaction => {
        if (transaction.amount >= 0) {
          filtered_stats.incomes = filtered_stats.incomes + transaction.amount;
        } else {
          filtered_stats.expenses =
            filtered_stats.expenses + transaction.amount;
        }
      });

      setFilters(useFilters);
      setStatistics(
        Object.assign({}, result, {
          filtered_transactions,
          filtered_stats
        })
      );
    }

    if (newFilters) {
      applyFilters(statistics);
    } else {
      dispatch(
        StatisticsActions.perDate(
          dateBegin.toDate(),
          moment(dateBegin)
            .endOf("month")
            .toDate()
        )
      ).then(applyFilters);
    }
  }

  const _handleToggleFilter = filter => {
    const filterIndex = filters.findIndex(item => {
      return item.type === filter.type && item.value === filter.value;
    });

    const newFilterList = Array.from(filters);
    if (filterIndex === -1) {
      newFilterList.push(filter);
      setFilters(newFilterList);
    } else {
      newFilterList.splice(filterIndex, 1);
      setFilters(newFilterList);
    }
    refreshData(newFilterList);
  };

  const handleOpenTransaction = (transaction = {}) => {
    setComponent(
      <TransactionForm
        transaction={transaction}
        onSubmit={handleCloseTransaction}
        onClose={handleCloseTransaction}
      />
    );
    setOpen(true);
  };

  const handleOpenDuplicateTransaction = (item = {}) => {
    let duplicatedItem = Object.assign({}, item);
    delete duplicatedItem.id;
    delete duplicatedItem.date;
    handleOpenTransaction(duplicatedItem);
  };

  const handleCloseTransaction = () => {
    setOpen(false);
    setTimeout(() => setComponent(null), 400);
  };

  const _goMonthBefore = () => {
    // setDateBegin(moment(dateBegin.subtract(1, "month")));
    setStatistics(null);
    history.push(
      "/transactions/" + dateBegin.subtract(1, "month").format("YYYY/M")
    );
  };

  const _goMonthNext = () => {
    // setDateBegin(moment(dateBegin.add(1, "month")));
    setStatistics(null);
    history.push("/transactions/" + dateBegin.add(1, "month").format("YYYY/M"));
  };

  return (
    <div className="layout">
      <div className={"modalContent " + (open ? "open" : "")}>
        <Card square className="modalContentCard">
          {component}
        </Card>
      </div>
      <header className="layout_header showMobile">
        <div
          className="layout_header_top_bar"
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: 4
          }}
        >
          <IconButton
            className="previous"
            style={{ color: "white" }}
            onClick={_goMonthBefore}
          >
            <NavigateBefore fontSize="small" />
          </IconButton>
          <IconButton
            className="next"
            style={{ color: "white" }}
            onClick={_goMonthNext}
          >
            <NavigateNext fontSize="small" />
          </IconButton>
          <h2>{dateBegin ? dateBegin.format("MMMM YYYY") : ""}</h2>
          <div className="showMobile">
            <UserButton type="button" color="white" />
          </div>
        </div>
        <div className="indicators showModalSize wrapperMobile">
          <div className="view">
            <span>Balance&nbsp;</span>
            <span>
              {!statistics ? (
                <span className="loading w80" />
              ) : (
                <Amount
                  value={
                    statistics.filtered_stats.expenses +
                    statistics.filtered_stats.incomes
                  }
                  currency={selectedCurrency}
                />
              )}
            </span>
          </div>
          <div className="view">
            <span>Expenses&nbsp;</span>
            <span>
              {!statistics ? (
                <span className="loading w80" />
              ) : (
                <Amount
                  value={statistics.filtered_stats.expenses}
                  currency={selectedCurrency}
                />
              )}
            </span>
          </div>
          <div className="view">
            <span>Incomes&nbsp;</span>
            <span>
              {!statistics ? (
                <span className="loading w80" />
              ) : (
                <Amount
                  value={statistics.filtered_stats.incomes}
                  currency={selectedCurrency}
                />
              )}
            </span>
          </div>
        </div>
        <div className="indicators hideModalSize">
          <SwipeableViews
            enableMouseEvents
            style={{ padding: "0 50vw 0 24px" }}
            slideStyle={{ padding: "0 0px" }}
          >
            <div className="view">
              <span>Balance&nbsp;</span>
              <span>
                {!statistics ? (
                  <span className="loading w80" />
                ) : (
                  <Amount
                    value={
                      statistics.filtered_stats.expenses +
                      statistics.filtered_stats.incomes
                    }
                    currency={selectedCurrency}
                  />
                )}
              </span>
            </div>
            <div className="view">
              <span>Expenses&nbsp;</span>
              <span>
                {!statistics ? (
                  <span className="loading w80" />
                ) : (
                  <Amount
                    value={statistics.filtered_stats.expenses}
                    currency={selectedCurrency}
                  />
                )}
              </span>
            </div>
            <div className="view">
              <span>Incomes&nbsp;</span>
              <span>
                {!statistics ? (
                  <span className="loading w80" />
                ) : (
                  <Amount
                    value={statistics.filtered_stats.incomes}
                    currency={selectedCurrency}
                  />
                )}
              </span>
            </div>
          </SwipeableViews>
        </div>
        <div className="layout_header_tabs wrapperMobile">
          <Tabs
            centered
            variant="fullWidth"
            value={tabs}
            onChange={(event, value) => {
              setTabs(value);
            }}
          >
            <Tab
              label={
                !statistics
                  ? "Transactions"
                  : `${statistics.filtered_transactions.length} transaction${
                      statistics.filtered_transactions.length <= 1 ? "" : "s"
                    }`
              }
              value="transactions"
              disabled={!statistics}
            />
            <Tab
              label={
                !statistics
                  ? "Categories"
                  : `${statistics.stats.perCategoriesArray.length} categor${
                      statistics.stats.perCategoriesArray.length <= 1
                        ? "y"
                        : "ies"
                    }`
              }
              value="categories"
              disabled={!statistics}
            />
          </Tabs>
        </div>
      </header>

      <div
        className={
          (tabs === "transactions"
            ? "show_transactions "
            : "show_categories ") + "transactions_two_columns"
        }
      >
        <div className="transactions_aside hideMobile">
          <div style={{ display: "flex", alignItems: "center" }}>
            <IconButton
              className="previous"
              onClick={_goMonthBefore}
              disabled={!statistics}
            >
              <NavigateBefore fontSize="small" />
            </IconButton>
            <IconButton
              className="next"
              onClick={_goMonthNext}
              disabled={!statistics}
            >
              <NavigateNext fontSize="small" />
            </IconButton>
            <h2 style={{ paddingLeft: 10 }}>
              {dateBegin ? dateBegin.format("MMMM YYYY") : ""}
            </h2>
          </div>

          <div className="metrics">
            <div className="metric">
              <h3 className="title">Balance</h3>
              <div className="balance">
                <p>
                  <span style={{ color: blue[500] }}>
                    {!statistics ? (
                      <span className="loading w120" />
                    ) : (
                      <BalancedAmount
                        value={
                          statistics.filtered_stats.expenses +
                          statistics.filtered_stats.incomes
                        }
                        currency={selectedCurrency}
                      />
                    )}
                  </span>
                </p>
              </div>
              <div className="incomes_expenses">
                <p>
                  <small>Incomes</small>
                  <br />
                  <span style={{ color: green[500] }}>
                    {!statistics ? (
                      <span className="loading w120" />
                    ) : (
                      <ColoredAmount
                        value={statistics.filtered_stats.incomes}
                        currency={selectedCurrency}
                      />
                    )}
                  </span>
                </p>
                <p>
                  <small>Expenses</small>
                  <br />
                  <span style={{ color: red[500] }}>
                    {!statistics ? (
                      <span className="loading w120" />
                    ) : (
                      <ColoredAmount
                        value={statistics.filtered_stats.expenses}
                        currency={selectedCurrency}
                      />
                    )}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div>
            {statistics && categories ? (
              <div className="categories layout_content wrapperMobile">
                <Table style={{ background: "transparent" }}>
                  <TableBody>
                    {statistics.stats.perCategoriesArray.map(item => {
                      const filterIndex = filters.findIndex(
                        filter => filter.value === item.id
                      );
                      const category = categories.find(c => {
                        return c.id == item.id;
                      });
                      return (
                        <TableRow
                          key={item.id}
                          onClick={_ =>
                            _handleToggleFilter({
                              type: "category",
                              value: item.id
                            })
                          }
                          className={filterIndex != -1 ? "isFilter" : ""}
                          style={{ cursor: "pointer" }}
                        >
                          <TableCell className="category_dot">
                            {category ? category.name : ""}
                          </TableCell>
                          <TableCell align="right" style={{ paddingRight: 18 }}>
                            <Amount
                              tabularNums
                              value={item.expenses}
                              currency={selectedCurrency}
                            />
                          </TableCell>
                          <TableCell
                            style={{ width: 40, padding: "4px 10px 4px 4px" }}
                          >
                            {filterIndex != -1 ? (
                              <ContentRemove color="disabled" />
                            ) : (
                              <ContentAdd color="disabled" />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="noscroll layout_content wrapperMobile">
                <Table style={{ background: "transparent" }}>
                  <TableBody>
                    {[
                      "w120",
                      "w80",
                      "w120",
                      "w120",
                      "w80",
                      "w120",
                      "w80",
                      "w120",
                      "w120",
                      "w80",
                      "w120",
                      "w80"
                    ].map((value, i) => {
                      return (
                        <TableRow key={i}>
                          <TableCell>
                            <span className={`loading ${value}`} />
                          </TableCell>
                          <TableCell>
                            <span className="loading w30" />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>

        <div className="layout_noscroll">
          {filters && filters.length && categories ? (
            <div className="layout_content_filters wrapperMobile">
              {filters.map((filter, index) => {
                let category;
                if (filter.type === "category") {
                  category = categories.find(c => {
                    return c.id == filter.value;
                  });
                }
                return (
                  <Chip
                    label={
                      filter.type === "category" && category
                        ? category.name
                        : moment(filter.value).format("ddd D MMM")
                    }
                    onDelete={() => {
                      _handleToggleFilter(filter);
                    }}
                    key={index}
                    className="filter"
                  />
                );
              })}
            </div>
          ) : (
            ""
          )}
          <div className="layout_content">
            <div className="categories">
              {statistics && categories ? (
                <div className="layout_content wrapperMobile">
                  {statistics.stats.perCategories.length === 0 ? (
                    <div className="emptyContainer">
                      <p>No categories</p>
                    </div>
                  ) : (
                    <Table style={{ background: "transparent" }}>
                      <TableBody>
                        {statistics.stats.perCategoriesArray.map(item => {
                          const filterIndex = filters.findIndex(
                            filter => filter.value === item.id
                          );
                          const category = categories.find(c => {
                            return c.id == item.id;
                          });
                          return (
                            <TableRow
                              key={item.id}
                              onClick={_ =>
                                _handleToggleFilter({
                                  type: "category",
                                  value: item.id
                                })
                              }
                              className={filterIndex != -1 ? "isFilter" : ""}
                              style={{ cursor: "pointer" }}
                            >
                              <TableCell className="category_dot">
                                {category ? category.name : ""}
                              </TableCell>
                              <TableCell
                                align="right"
                                style={{ paddingRight: 18 }}
                              >
                                <Amount
                                  value={item.expenses}
                                  currency={selectedCurrency}
                                />
                              </TableCell>
                              <TableCell
                                style={{
                                  width: 40,
                                  padding: "4px 10px 4px 4px"
                                }}
                              >
                                {filterIndex != -1 ? (
                                  <ContentRemove color="disabled" />
                                ) : (
                                  <ContentAdd color="disabled" />
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </div>
              ) : (
                <div className="noscroll layout_content wrapperMobile">
                  <Table style={{ background: "transparent" }}>
                    <TableBody>
                      {["w120", "w80", "w120", "w120", "w80", "w120"].map(
                        (value, i) => {
                          return (
                            <TableRow key={i}>
                              <TableCell>
                                <span className={`loading ${value}`} />
                              </TableCell>
                              <TableCell>
                                <span className="loading w30" />
                              </TableCell>
                            </TableRow>
                          );
                        }
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
            <div className="layout_content transactions">
              {statistics && categories ? (
                <div className="transactions layout_content wrapperMobile">
                  <div
                    className="transactions_list"
                    style={{ display: "flex" }}
                  >
                    {statistics.filtered_transactions &&
                    statistics.filtered_transactions.length &&
                    categories ? (
                      <TransactionTable
                        transactions={statistics.filtered_transactions}
                        onEdit={handleOpenTransaction}
                        perDates={
                          Boolean(filters && filters.length)
                            ? null
                            : statistics.stats.perDates
                        }
                        onDuplicate={handleOpenDuplicateTransaction}
                      />
                    ) : (
                      <div className="emptyContainer">
                        <p>No transactions</p>
                      </div>
                    )}
                  </div>

                  {statistics.filtered_transactions &&
                  statistics.filtered_transactions.length ? (
                    <div className="buttonPreviousMonth">
                      <Button onClick={_goMonthBefore} disabled={!statistics}>
                        <NavigateBefore />
                        See previous month
                      </Button>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              ) : (
                <div className="noscroll transactions layout_content wrapperMobile">
                  <div
                    className="transactions_list"
                    style={{ display: "flex" }}
                  >
                    <TransactionTable isLoading={true} />
                  </div>
                </div>
              )}
            </div>

            <Fab
              color="primary"
              className={
                (tabs === "transactions" ? "show " : "") + "layout_fab_button"
              }
              aria-label="Add"
              disabled={!statistics}
              onClick={handleOpenTransaction}
            >
              <ContentAdd />
            </Fab>
          </div>
        </div>
      </div>
    </div>
  );
});
export default Transactions;
