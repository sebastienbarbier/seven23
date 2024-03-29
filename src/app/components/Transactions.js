/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import "./Transactions.scss";

import moment from "moment";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { useTheme } from "../theme";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";

import Chip from "@mui/material/Chip";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PercentIcon from "@mui/icons-material/Percent";

import DoneIcon from "@mui/icons-material/Done";

import IconButton from "@mui/material/IconButton";

import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import NavigateBefore from "@mui/icons-material/NavigateBefore";
import NavigateNext from "@mui/icons-material/NavigateNext";
import PendingActionsIcon from "@mui/icons-material/PendingActions";

import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Stack from "@mui/material/Stack";

import AppActions from "../actions/AppActions";
import StatisticsActions from "../actions/StatisticsActions";
import TransactionForm from "./transactions/TransactionForm";
import TransactionList from "./transactions/TransactionList";

import ChangeRateUnknownAlert from "./alerts/ChangeRateUnknownAlert";

import {
  filteringCategoryFunction,
  filteringDateFunction,
  filteringPendingsFunction,
} from "../utils/transaction";

import { Amount } from "./currency/Amount";

import LayoutDoublePanel from "./layout/LayoutDoublePanel";

import BalanceComponent from "./dashboard/BalanceComponent";

const CATEGORY_LIST_LIMIT = 6;

export default function Transactions(props) {
  const dispatch = useDispatch();
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isConfidential = useSelector((state) => state.app.isConfidential);
  const theme = useTheme();
  const [dateBegin, setDateBegin] = useState(
    () => new Date(params.year, params.month - 1, 1)
  );

  const [filters, setFilters] = useState(
    params.day
      ? [
          {
            type: "date",
            value: new Date(params.year, params.month - 1, params.day),
          },
        ]
      : []
  );

  const accountCurrencyId = useSelector((state) => state.account.currency);
  const currencies = useSelector((state) => state.currencies);
  const [selectedCurrency, setSelectedCurrency] = useState(() =>
    currencies.find((c) => c.id === accountCurrencyId)
  );

  const [statistics, setStatistics] = useState(null);
  const [showPercent, setShowPercent] = useState(false);
  const transactions = useSelector((state) => state.transactions);
  const categories = useSelector((state) =>
    state.categories ? state.categories.list : null
  );

  const [hasPendingFilter, setHasPendingFilter] = useState(false);

  const [showFullCategoriesList, setShowFullCategoriesList] = useState(true);

  useEffect(() => {
    const newDate = new Date(params.year, params.month - 1, 1);

    dispatch(
      AppActions.setNavBar(
        `${moment(newDate).format("MMMM YYYY")}`,
        "/transactions/" +
          moment(newDate).subtract(1, "month").format("YYYY/M"),
        "/transactions/" + moment(newDate).add(1, "month").format("YYYY/M"),
        72
      )
    );
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
    // new date on UTC
    const newDate = new Date(params.year, params.month - 1, 1);
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
      filtered_transactions = filtered_transactions.filter((t) =>
        filteringPendingsFunction(t, useFilters)
      );
      filtered_transactions = filtered_transactions.filter((t) =>
        filteringDateFunction(t, useFilters)
      );

      const filtered_stats = {
        incomes: 0,
        expenses: 0,
      };

      filtered_transactions
        .filter((t) => !t.isPending)
        .forEach((transaction) => {
          if (transaction.amount >= 0) {
            filtered_stats.incomes =
              filtered_stats.incomes + transaction.amount;
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
    setHasPendingFilter(!!newFilterList.find((f) => f.type == "pendings"));
    refreshData(newFilterList);
  };

  const handleOpenTransaction = (transaction = {}) => {
    dispatch(
      AppActions.openModal(
        <TransactionForm
          transaction={transaction}
          onSubmit={handleCloseTransaction}
          onClose={handleCloseTransaction}
        />
      )
    );
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
    if (tabs == "transactions") {
      dispatch(
        AppActions.setFloatingAddButton(
          () => handleOpenTransaction(),
          !!statistics
        )
      );
    } else {
      dispatch(AppActions.closeFloatingAddButton());
    }
  }, [tabs, transactions, statistics, categories]);

  const ref = document.getElementById("container_header_component");
  return (
    <LayoutDoublePanel
      className="layout_transactions"
      left={
        <>
          {/* FIRST COLUMN */}
          <div className="transactions_aside">
            {/* BALANCE */}
            <div
              className="transactions_view hideMobile"
              style={{ margin: "8px", borderRadius: "12px" }}
            >
              <BalanceComponent
                label={"Balance"}
                balance={
                  !!statistics &&
                  statistics?.filtered_stats?.expenses +
                    statistics?.filtered_stats?.incomes
                }
                incomes={statistics?.filtered_stats?.incomes}
                expenses={statistics?.filtered_stats?.expenses}
              />
            </div>

            {/* WARNING MESSAGE */}
            {statistics &&
              statistics.stats &&
              statistics.stats.hasUnknownAmount && (
                <Container sx={{ pb: 2 }}>
                  <ChangeRateUnknownAlert />
                </Container>
              )}

            {/* CATEGORIES FILTER */}
            <Container className="categories">
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ pb: 2 }}
              >
                <Typography
                  variant="h3"
                  component="h3"
                  sx={{ fontSize: 16, display: "flex", alignItems: "center" }}
                >
                  <LocalOfferIcon sx={{ fontSize: 18, mr: 1, pb: "2px" }} />{" "}
                  Categories
                </Typography>
                {statistics && statistics.stats?.perCategoriesArray != 0 && (
                  <ToggleButtonGroup
                    value={showPercent}
                    sx={{ height: 18, mb: 1 }}
                  >
                    <ToggleButton
                      onClick={() => setShowPercent(false)}
                      value={false}
                      sx={{ minWidth: "32px", fontSize: "12px", pl: 1, pr: 1 }}
                    >
                      {selectedCurrency.sign}
                    </ToggleButton>
                    <ToggleButton
                      onClick={() => setShowPercent(true)}
                      value={true}
                      sx={{ pl: 1, pr: 1 }}
                    >
                      <PercentIcon sx={{ fontSize: 16 }} />
                    </ToggleButton>
                  </ToggleButtonGroup>
                )}
              </Stack>

              {statistics && statistics.stats?.perCategoriesArray == 0 && (
                <>
                  <div className="emptyContainer">
                    <p>No category</p>
                  </div>
                </>
              )}

              {statistics && categories ? (
                <Box className="categoriesList" sx={{ pb: 4 }}>
                  {statistics.stats.perCategoriesArray.map((item, index) => {
                    const filterIndex = filters.findIndex(
                      (filter) => filter.value === item.id
                    );
                    const category = categories.find((c) => {
                      return c.id == item.id;
                    });
                    if (
                      showFullCategoriesList &&
                      index >= CATEGORY_LIST_LIMIT
                    ) {
                      return <React.Fragment key={index}></React.Fragment>;
                    }
                    return (
                      <Button
                        key={index}
                        className={`${
                          filters.length != 0 &&
                          (filterIndex != -1 ? "isSelected" : "notSelected")
                        } chip`}
                        size="small"
                        color="inherit"
                        sx={{
                          "&:before": {
                            width: `${item.percentage}%`,
                          },
                        }}
                        onClick={(_) =>
                          _handleToggleFilter({
                            type: "category",
                            value: item.id,
                          })
                        }
                      >
                        <Typography
                          sx={{
                            fontSize: 13,
                            flexShrink: 1,
                            opacity: 0.9,
                            textAlign: "left",
                          }}
                        >
                          {filterIndex != -1 && (
                            <DoneIcon
                              sx={{
                                fontSize: 10,
                                mr: 1,
                                color:
                                  filterIndex != -1
                                    ? theme.palette.text
                                    : theme.palette.primary,
                              }}
                            />
                          )}
                          {category ? `${category.name}` : "Without a category"}
                        </Typography>
                        {showPercent ? (
                          `${item.percentageTotal.toFixed(2)}%`
                        ) : (
                          <Amount
                            value={item.sum}
                            currency={selectedCurrency}
                          />
                        )}
                      </Button>
                    );
                  })}
                  {statistics?.stats?.perCategoriesArray.length >
                    CATEGORY_LIST_LIMIT && (
                    <Button
                      className={`chip`}
                      size="small"
                      color="inherit"
                      onClick={() =>
                        setShowFullCategoriesList(!showFullCategoriesList)
                      }
                    >
                      {showFullCategoriesList ? (
                        <>
                          <Typography
                            sx={{
                              fontSize: 13,
                              opacity: 0.9,
                              textTransform: "lowercase",
                            }}
                          >
                            {statistics?.stats?.perCategoriesArray.length -
                              CATEGORY_LIST_LIMIT}{" "}
                            more
                          </Typography>
                          <ExpandMoreIcon
                            sx={{ fontSize: 14, color: theme.palette.primary }}
                          />
                        </>
                      ) : (
                        <>
                          <Typography sx={{ fontSize: 13, opacity: 0.9 }}>
                            Close
                          </Typography>
                          <ExpandLessIcon
                            sx={{ fontSize: 14, color: theme.palette.primary }}
                          />
                        </>
                      )}
                    </Button>
                  )}
                </Box>
              ) : (
                <div className="categoriesList">
                  {["w120", "w80", "w80", "w120", "w120", "w80", "w120"].map(
                    (value, i) => {
                      return (
                        <Button
                          className={`chip`}
                          size="small"
                          color="inherit"
                          key={i}
                          disabled
                        >
                          <span
                            className={`loading ${value}`}
                            style={{ height: "1.2em" }}
                          />
                        </Button>
                      );
                    }
                  )}
                </div>
              )}
            </Container>

            <Container>
              <Typography
                variant="h3"
                component="h3"
                sx={{
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  pb: 2,
                }}
              >
                <PendingActionsIcon sx={{ fontSize: 20, mr: 1, pb: "2px" }} />{" "}
                Pending payments
              </Typography>

              {statistics && statistics.pendings?.length == 0 && (
                <>
                  <Box
                    className="emptyContainer"
                    style={{ paddingTop: 10, paddingBottom: 10 }}
                  >
                    <p>No pending payments</p>
                  </Box>
                </>
              )}

              {statistics && statistics.pendings?.length != 0 && (
                <>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography sx={{ pl: 1 }}>
                      {statistics.pendings?.length} transaction
                      {statistics.pendings?.length > 1 ? "s" : ""}
                    </Typography>
                    <Button
                      onClick={() => {
                        _handleToggleFilter({
                          type: "pendings",
                        });
                        setTabs("transactions");
                      }}
                    >
                      {hasPendingFilter ? "Hide" : "See"}
                    </Button>
                  </Stack>
                </>
              )}
            </Container>
          </div>
        </>
      }
      right={
        <>
          {/* SECOND COLUMN */}
          <div className="column_right">
            {/* SELECTED FILTER VIEW */}
            {filters && !!filters.length && categories && (
              <div className="layout_content_filters">
                {filters.map((filter, index) => {
                  let category;
                  let label = "";
                  if (filter.type === "category") {
                    // Handle specific case to display transactions with no category
                    if (filter.value == "null") {
                      category = { name: "Without a category" };
                    } else {
                      category = categories.find((c) => {
                        return c.id == filter.value;
                      });
                    }
                    label = category.name;
                  } else if (filter.type === "pendings") {
                    label = "Pending payments";
                  } else {
                    label = moment(filter.value).format("ddd D MMM YYYY");
                  }
                  return (
                    <Chip
                      label={label}
                      key={index}
                      onDelete={() => {
                        _handleToggleFilter(filter);
                      }}
                      className="filter"
                    />
                  );
                })}
              </div>
            )}

            {/* LIST OF TRANSACTIONS  */}
            <div className="transactions">
              {statistics && categories ? (
                <div className="transactions">
                  {statistics &&
                    statistics.stats &&
                    statistics.stats.hasUnknownAmount && (
                      <Container>
                        <Alert
                          className="showMobile"
                          style={{ marginBottom: 10, marginTop: 10 }}
                          severity="error"
                        >
                          <AlertTitle>Unknown exchange rate</AlertTitle>
                          Some transactions{" "}
                          <strong>could not be converted</strong> using current
                          selected currency, and <strong>are so ignored</strong>{" "}
                          in all calculation.
                          <br />
                          To solve this, <strong>
                            add an exchange rate
                          </strong>{" "}
                          or switch to a <strong>different currency</strong>.
                        </Alert>
                      </Container>
                    )}
                  <div style={{ display: "flex" }}>
                    {statistics.filtered_transactions &&
                    statistics.filtered_transactions.length &&
                    categories ? (
                      <TransactionList
                        transactions={statistics.filtered_transactions}
                        perDates={
                          Boolean(filters && filters.length)
                            ? null
                            : statistics.stats.perDates
                        }
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
                      <Button
                        color="inherit"
                        onClick={_goMonthBefore}
                        disabled={!statistics}
                      >
                        <NavigateBefore />
                        See previous month
                      </Button>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              ) : (
                <div className="noscroll transactions">
                  <div style={{ display: "flex" }}>
                    <TransactionList isLoading={true} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      }
      selectedPanel={tabs == "transactions" ? "right" : "left"}
    >
      {/* HEADER FOR MOBILE */}
      {ref &&
        createPortal(
          <header className="showMobile" style={{ paddingTop: "4px" }}>
            <Container
              sx={{
                display: "flex",
                justifyContent: "space-between",
                color: "white",
                fontSize: 12,
              }}
              className="indicators showModalSize"
            >
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

            <Box className="indicators hideModalSize" sx={{ fontSize: "10px" }}>
              <swiper-container
                space-between="0"
                class="metrics transactions_swiper"
                slides-per-view="auto"
              >
                <swiper-slide
                  style={{
                    padding: "0 40px 0 24px",
                    fontSize: "12px",
                    color: "white",
                    maxWidth: "200px",
                  }}
                >
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
                  style={{
                    padding: "0 40px 0 24px",
                    fontSize: "12px",
                    color: "white",
                    maxWidth: "200px",
                  }}
                >
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
                  style={{
                    padding: "0 40px 0 24px",
                    fontSize: "12px",
                    color: "white",
                    maxWidth: "200px",
                  }}
                >
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
                textColor="inherit"
                value={tabs}
                onChange={(event, value) => {
                  setTabs(value);
                }}
              >
                <Tab
                  label={
                    !statistics
                      ? "Transactions"
                      : `${
                          statistics.filtered_transactions.length
                        } transaction${
                          statistics.filtered_transactions.length <= 1
                            ? ""
                            : "s"
                        }`
                  }
                  sx={{ color: "white" }}
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
                  sx={{ color: "white" }}
                  value="categories"
                  disabled={!statistics}
                />
              </Tabs>
            </div>
          </header>,
          ref
        )}

      {/* HEADER FOR DESKTOP */}
      <div className="hideMobile header">
        <IconButton
          className="previous"
          onClick={_goMonthBefore}
          disabled={!statistics}
          size="large"
        >
          <NavigateBefore fontSize="small" sx={{ color: "white" }} />
        </IconButton>
        <h2 style={{ margin: 0, flexGrow: 1, textAlign: "center" }}>
          {dateBegin ? moment(dateBegin).format("MMMM YYYY") : ""}
        </h2>
        <IconButton
          className="next"
          onClick={_goMonthNext}
          disabled={!statistics}
          size="large"
        >
          <NavigateNext fontSize="small" sx={{ color: "white" }} />
        </IconButton>
      </div>
    </LayoutDoublePanel>
  );
}
