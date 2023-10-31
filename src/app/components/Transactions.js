/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import "./Transactions.scss";

import React, { Component, useEffect, useState, useMemo } from "react";
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import moment from "moment";

import { useTheme } from "../theme";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import Chip from "@mui/material/Chip";

import LocalOfferIcon from "@mui/icons-material/LocalOffer";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

import DoneIcon from '@mui/icons-material/Done';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

import IconButton from "@mui/material/IconButton";

import NavigateBefore from "@mui/icons-material/NavigateBefore";
import NavigateNext from "@mui/icons-material/NavigateNext";
import ContentAdd from "@mui/icons-material/Add";
import ContentRemove from "@mui/icons-material/Remove";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

import TransactionForm from "./transactions/TransactionForm";
import TransactionList from "./transactions/TransactionList";
import StatisticsActions from "../actions/StatisticsActions";
import AppActions from "../actions/AppActions";

import ChangeRateUnknownAlert from './alerts/ChangeRateUnknownAlert';

import { dateToString } from "../utils/date";
import { filteringCategoryFunction, filteringDateFunction } from "../utils/transaction";

import { BalancedAmount, ColoredAmount, Amount } from "./currency/Amount";

import { blue, red, green } from '@mui/material/colors';

import ScrollListenner from './layout/ScrollListenner';
import LayoutDoublePanel from './layout/LayoutDoublePanel';


const CATEGORY_LIST_LIMIT = 8;

export default function Transactions(props) {
  const dispatch = useDispatch();
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [dateBegin, setDateBegin] = useState(
    () => new Date(params.year, params.month - 1, 1)
  );

  const [filters, setFilters] = useState(params.day ? [{
        type: "date",
        value: new Date(params.year, params.month - 1, params.day),
      }] : []);

  const accountCurrencyId = useSelector((state) => state.account.currency);
  const currencies = useSelector((state) => state.currencies);
  const [selectedCurrency, setSelectedCurrency] = useState(() =>
    currencies.find((c) => c.id === accountCurrencyId)
  );

  const [statistics, setStatistics] = useState(null);
  const transactions = useSelector((state) => state.transactions);
  const categories = useSelector((state) =>
    state.categories ? state.categories.list : null
  );

  const [showFullCategoriesList, setShowFullCategoriesList] = useState(true);

  useEffect(() => {
    const newDate = new Date(params.year, params.month - 1, 1);

    dispatch(AppActions.setNavBar(
      `${moment(newDate).format("MMMM YYYY")}`,
      "/transactions/" + moment(newDate).subtract(1, "month").format("YYYY/M"),
      "/transactions/" + moment(newDate).add(1, "month").format("YYYY/M"),
      72,
    ));
  }, [location]);

  useEffect(() => {
    if (statistics) {
      setSelectedCurrency(currencies.find((c) => c.id === accountCurrencyId));
    }
  }, [accountCurrencyId]);

  // If transactions change, we refresh statistics
  useEffect(() => {
    if (statistics) {
      setStatistics(null);
    }
    const newDate = new Date(Date.UTC(params.year, params.month - 1, 1));
    setDateBegin(newDate);
    refreshData(null, newDate);
  }, [params.year, params.month]);

  useEffect(() => {
    if (!transactions && statistics) {
      setStatistics(null);
    } else if (transactions && !statistics) {
      refreshData();
    } else if (transactions && statistics) {
      refreshData();
    }
  }, [transactions, categories]);

  function refreshData(newFilters = null, dateToRefresh = dateBegin) {
    let promise;
    let useFilters = newFilters || filters;

    function applyFilters(result) {

      let filtered_transactions = result.transactions.filter((transaction) =>
        filteringCategoryFunction(transaction, useFilters)
      );
      filtered_transactions = filtered_transactions.filter(t => filteringDateFunction(t, useFilters));

      const filtered_stats = {
        incomes: 0,
        expenses: 0,
      };
      filtered_transactions.forEach((transaction) => {
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
          filtered_stats,
        })
      );
    }

    if (newFilters) {
      applyFilters(statistics);
    } else if (transactions !== null) {
      dispatch(
        StatisticsActions.perDate(
          dateToRefresh,
          moment(dateToRefresh).endOf("month").toDate()
        )
      ).then(applyFilters);
    }
  }

  const _handleToggleFilter = (filter) => {
    const filterIndex = filters.findIndex((item) => {
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
    dispatch(AppActions.openModal(<TransactionForm
        transaction={transaction}
        onSubmit={handleCloseTransaction}
        onClose={handleCloseTransaction}
      />));
  };

  const handleOpenDuplicateTransaction = (item = {}) => {
    let duplicatedItem = Object.assign({}, item);
    delete duplicatedItem.id;
    delete duplicatedItem.date;
    handleOpenTransaction(duplicatedItem);
  };

  const handleCloseTransaction = () => {
    dispatch(AppActions.closeModal());
  };

  const _goMonthBefore = () => {
    setStatistics(null);
    navigate(
      "/transactions/" + moment(dateBegin).subtract(1, "month").format("YYYY/M")
    );
  };

  const _goMonthNext = () => {
    // setDateBegin(moment(dateBegin.add(1, "month")));
    setStatistics(null);
    navigate(
      "/transactions/" + moment(dateBegin).add(1, "month").format("YYYY/M")
    );
  };

  const [tabs, setTabs] = useState("transactions");

  useEffect(() => {
    if (tabs == 'transactions') {
      dispatch(AppActions.setFloatingAddButton(() => handleOpenTransaction(), !!statistics));
    } else {
      dispatch(AppActions.closeFloatingAddButton());
    }
  }, [tabs, transactions, statistics, categories]);

  const ref = document.getElementById("container_header_component");

  return (
    <LayoutDoublePanel
      className="layout_transactions"
      left={<>
        { /* FIRST COLUMN */ }
        <div className="transactions_aside">

          { /* BALANCE */ }
          <div className="transactions_view hideMobile" style={{ margin: '8px', borderRadius: '12px' }}>
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

          { /* WARNING MESSAGE */ }
          { statistics && statistics.stats && statistics.stats.hasUnknownAmount &&
          <ChangeRateUnknownAlert />}


          { /* CATEGORIES FILTER */ }
          <div className="categories" style={{ paddingTop: 20 }}>

            <Typography variant="h3" component="h3" sx={{ fontSize: 16, display: 'flex', alignItems: 'center' }}>
              <LocalOfferIcon sx={{ fontSize: 20, mr: 1, pb: '6px' }} /> Category filter { !!statistics?.stats?.perCategoriesArray?.length && <small>({statistics?.stats?.perCategoriesArray?.length})</small>}
            </Typography>
            {statistics && categories ? (
              <div className="categoriesList">
                {statistics.stats.perCategoriesArray.map((item, index) => {
                  const filterIndex = filters.findIndex(
                    (filter) => filter.value === item.id
                  );
                  const category = categories.find((c) => {
                    return c.id == item.id;
                  });
                  if (showFullCategoriesList && index >= CATEGORY_LIST_LIMIT) {
                    return <></>;
                  }
                  return <>
                    <Button
                      className={`${filterIndex != -1 ? "isSelected" : ""} chip`}
                      size="small"
                      color="inherit"
                      onClick={(_) =>
                        _handleToggleFilter({
                          type: "category",
                          value: item.id,
                        })
                      }>
                      {filterIndex != -1 && <DoneIcon sx={{ fontSize: 14, color: filterIndex != -1 ? theme.palette.text : theme.palette.primary }} />}
                      <Typography sx={{ fontSize: 13, opacity: 0.9, maxWidth: '140px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{category ? `${category.name}` : "Without a category"}</Typography>
                      <Amount
                        value={item.incomes + item.expenses}
                        currency={selectedCurrency}
                      />
                    </Button>
                  </>;
                })}
                { statistics?.stats?.perCategoriesArray.length > CATEGORY_LIST_LIMIT &&
                <Button
                    className={`chip`}
                    size="small"
                    color="inherit"
                    onClick={() =>
                      setShowFullCategoriesList(!showFullCategoriesList)
                    }>
                    { showFullCategoriesList ? <>
                      <Typography sx={{ fontSize: 13, opacity: 0.9, textTransform: 'lowercase' }}>{statistics?.stats?.perCategoriesArray.length - CATEGORY_LIST_LIMIT} more</Typography>
                      <ExpandMoreIcon sx={{ fontSize: 14, color: theme.palette.primary }} />
                    </> : <>
                      <Typography sx={{ fontSize: 13, opacity: 0.9 }}>Less</Typography>
                      <ExpandLessIcon sx={{ fontSize: 14, color: theme.palette.primary }} />
                    </>}
                  </Button> }
              </div>
            ) : (
              <div className="categoriesList">
              {[
                    "w120",
                    "w80",
                    "w80",
                    "w120",
                    "w120",
                    "w80",
                    "w120",
                    "w120",
                    "w80",
                  ].map((value, i) => {
                    return (
                      <Button
                        className={`chip`}
                        size="small"
                        color="inherit"
                        disabled>
                        <span className={`loading ${value}`} style={{ height: '1.2em' }} />
                      </Button>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </>}
      right={<>
        { /* SECOND COLUMN */ }
        <div className="column_right">

          { /* SELECTED FILTER VIEW */ }
          { filters && !!filters.length && categories &&
            <div className="layout_content_filters">
              {filters.map((filter, index) => {
                let category;
                if (filter.type === "category") {
                  // Handle specific case to display transactions with no category
                  if (filter.value == 'null') {
                    category = { name: 'Without a category' }
                  } else {
                    category = categories.find((c) => {
                      return c.id == filter.value;
                    });
                  }
                }
                return (
                  <Chip
                    label={
                      filter.type === "category" && category
                        ? category.name
                        : moment(filter.value).format("ddd D MMM YYYY")
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
          }

          { /* LIST OF CATEGORIES AND LIST OF TRANSACTIONS FOR MOBILE ONLY */ }
          <ScrollListenner className="layout_content">

            { /* LIST OF TRANSACTIONS FOR MOBILE ONLY */ }
            <div className="layout_content transactions">
              {statistics && categories ? (
                <ScrollListenner className="transactions layout_content">
                 { statistics && statistics.stats && statistics.stats.hasUnknownAmount &&
                  <Alert
                    className="showMobile"
                    style={{ marginBottom: 10, marginTop: 10 }}
                    severity="error"
                    >
                      <AlertTitle>Unknown exchange rate</AlertTitle>
                      Some transactions <strong>could not be converted</strong> using current selected currency, and <strong>are so ignored</strong> in all calculation.<br/>To solve this, <strong>add an exchange rate</strong> or switch to a <strong>different currency</strong>.
                  </Alert>}
                  <div
                    className="transactions_list"
                    style={{ display: "flex" }}
                  >
                    {statistics.filtered_transactions &&
                    statistics.filtered_transactions.length &&
                    categories ? (
                      <TransactionList
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
                      <Button color='inherit' onClick={_goMonthBefore} disabled={!statistics}>
                        <NavigateBefore />
                        See previous month
                      </Button>
                    </div>
                  ) : (
                    ""
                  )}
                </ScrollListenner>
              ) : (
                <div className="noscroll transactions layout_content">
                  <div
                    className="transactions_list"
                    style={{ display: "flex" }}
                  >
                    <TransactionList isLoading={true} />
                  </div>
                </div>
              )}
            </div>
          </ScrollListenner>
        </div>
      </>}
      selectedPanel={tabs == 'transactions' ? 'right' : 'left'}>

      { /* HEADER FOR MOBILE */ }
      { ref && createPortal(
        <header className="showMobile" style={{ paddingTop: '4px'}}>
          <Container sx={{ display: 'flex', justifyContent: 'space-between', color: 'white', fontSize: 12 }} className="indicators showModalSize">
            <Box className="view">
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
            </Box>
            <Box className="view">
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
            </Box>
            <Box className="view">
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
            </Box>
          </Container>

          <Box className="indicators hideModalSize" sx={{ fontSize: '10px' }}>
            <swiper-container
              space-between="0"
              class="metrics transactions_swiper"
              slides-per-view="auto"
            >
              <swiper-slide
                style={{ padding: "0 40px 0 24px", fontSize: '12px', color: 'white', maxWidth: '200px' }}>
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
              </swiper-slide>
              <swiper-slide
                style={{ padding: "0 40px 0 24px", fontSize: '12px', color: 'white', maxWidth: '200px' }}>
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
              </swiper-slide>
              <swiper-slide
                style={{ padding: "0 40px 0 24px", fontSize: '12px', color: 'white', maxWidth: '200px' }}>
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
              </swiper-slide>
            </swiper-container>
          </Box>
          <div className="layout_header_tabs">
            <Tabs
              centered
              variant="fullWidth"
              textColor='inherit'
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
                sx={{ color: 'white' }}
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
                sx={{ color: 'white' }}
                value="categories"
                disabled={!statistics}
              />
            </Tabs>
          </div>
        </header>
        , ref)}

      { /* HEADER FOR DESKTOP */ }
      <div className="hideMobile header">
        <IconButton
          className="previous"
          onClick={_goMonthBefore}
          disabled={!statistics}
          size="large">
          <NavigateBefore fontSize="small" sx={{ color: 'white' }} />
        </IconButton>
        <h2 style={{ margin: 0, flexGrow: 1, textAlign: 'center' }}>
          {dateBegin ? moment(dateBegin).format("MMMM YYYY") : ""}
        </h2>
        <IconButton
          className="next"
          onClick={_goMonthNext}
          disabled={!statistics}
          size="large">
          <NavigateNext fontSize="small" sx={{ color: 'white' }} />
        </IconButton>
      </div>
    </LayoutDoublePanel>
  );
}