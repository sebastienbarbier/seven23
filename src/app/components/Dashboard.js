import "./Dashboard.scss";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import { Link, useNavigate } from "react-router-dom";

import { useTheme } from "@mui/styles";

import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import SwipeableViews from "react-swipeable-views";

import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Close from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import MonthLineGraph from "./charts/MonthLineGraph";
import { Alert, AlertTitle } from '@mui/material';

import StatisticsActions from "../actions/StatisticsActions";
import AppActions from "../actions/AppActions";

import UserButton from "./settings/UserButton";
import Trends from "./trends/TrendsView";
import CalendarGraph from "./charts/CalendarGraph";

import ChangeRateUnknownAlert from './alerts/ChangeRateUnknownAlert';

import { BalancedAmount, ColoredAmount } from "./currency/Amount";

export default function Dashboard(props) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState(null);
  const [openTrend, setOpenTrend] = useState(false);
  const [disableSwipeableViews, setDisableSwipeableViews] = useState(
    () => window.innerWidth > 600
  );
  const [trendComponent, setTrendComponent] = useState(null);
  const selectedCurrency = useSelector((state) =>
    state.account
      ? state.currencies.find((c) => c.id === state.account.currency)
      : null
  );

  const isConfidential = useSelector((state) => state.app.isConfidential);
  const cacheDidUpdate = useSelector((state) => state.state.cacheDidUpdate);

  useEffect(() => {
    function checkWidth() {
      setDisableSwipeableViews(window.innerWidth > 600);
    }
    window.addEventListener("resize", checkWidth);
    return () => {
      window.removeEventListener("resize", checkWidth);
    };
  });

  const changes = useSelector((state) =>
    state.changes ? state.changes.list : null
  );
  const categories = useSelector((state) =>
    state.categories ? state.categories.list : null
  );
  const transactions = useSelector((state) => state.transactions);

  // generate stats for calendar graph based on statistics data
  const [calendar, setCalendar] = useState(null);
  // If transactions change, we refresh statistics
  useEffect(() => {
    if (!props.loadingOnly) {
      if (!transactions) {
        setStatistics(null);
      } else {
        dispatch(StatisticsActions.dashboard())
          .then((result) => {

            const now = moment().endOf('month');
            const from = moment(now).subtract(4, 'months').toDate();

            const calendar = result.stats.calendar.filter(day => {
              return day.date <= now && day.date >= from ;
            });

            result.graph[0].color = theme.palette.numbers.red;
            result.graph[1].color = theme.palette.numbers.blue;
            setOpenTrend(false);
            setCalendar(calendar);
            setStatistics(result);
          })
          .catch((error) => {
            console.error(error);
          });
      }
    }
  }, [transactions]);

  const handleToggleTrend = (trend) => {
    setTrendComponent(trend && trend.component ? trend.component : null);
    setOpenTrend(!openTrend);
  };


  const valid_until = useSelector((state) => state.user?.profile?.valid_until);

  const [subscription_expire_soon, set_subscription_expire_soon] = useState(false);
  const [subscription_has_expire, set_subscription_has_expire] = useState(false);
  const [valid_until_moment, set_valid_until_moment] = useState(null);

  const should_migrate_account = useSelector((state) =>
    state.server.isLogged && state.accounts.remote.length === 0
  );

  useEffect(() => {
    if (valid_until) {

      const date_moment = moment(valid_until);
      set_valid_until_moment(date_moment);

      const valid_until_date = new Date(valid_until);
      if (valid_until_date < new Date()) {
        set_subscription_has_expire(true);
        set_subscription_expire_soon(false);
      } else if (date_moment.diff(new Date(), 'days') < 7) {
        set_subscription_expire_soon(true);
        set_subscription_has_expire(false);
      }
    } else {
      set_subscription_expire_soon(false);
      set_subscription_has_expire(false);
    }
  }, [valid_until])

  return (
    <div className="layout dashboard">
      <header className="layout_header showMobile">
        <div className="layout_header_top_bar">
          <h2>Dashboard</h2>
          <div className="showMobile">
            <UserButton type="button" color="white" onModal={props.onModal} />
          </div>
        </div>
      </header>
      <div className="layout_content">
        <div className={(openTrend ? "open" : "") + " trendModal"}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <IconButton onClick={() => setOpenTrend(false)} size="large">
              <Close color="action" />
            </IconButton>
          </div>
          {trendComponent}
        </div>
        <div className="layout_dashboard wrapperMobile">

              { statistics && statistics.stats && statistics.stats.hasUnknownAmount &&
                <Container><ChangeRateUnknownAlert /></Container>}
          <div className="columnWrapper">
            <div className="column">
              <h2>Balance</h2>
              <SwipeableViews
                enableMouseEvents
                disabled={disableSwipeableViews}
                index={disableSwipeableViews ? 0 : null}
                className="metrics"
                style={{ padding: "0 calc(100% - 300px) 0 10px" }}
                slideStyle={{ padding: "8px 5px" }}
              >
                <Card className="metric">
                  <h3 className="title">{moment().format("MMMM")}</h3>
                  <div className="balance">
                    <p>
                      <span style={{ color: theme.palette.numbers.blue }}>
                        {!statistics || !statistics.currentYear ? (
                          <span className="loading w120" />
                        ) : (
                          <BalancedAmount
                            value={
                              statistics.currentYear.currentMonth.expenses +
                              statistics.currentYear.currentMonth.incomes
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
                      <span style={{ color: theme.palette.numbers.green }}>
                        {!statistics || !statistics.currentYear ? (
                          <span className="loading w120" />
                        ) : (
                          <ColoredAmount
                            value={statistics.currentYear.currentMonth.incomes}
                            currency={selectedCurrency}
                          />
                        )}
                      </span>
                    </p>
                    <p>
                      <small>Expenses</small>
                      <br />
                      <span style={{ color: theme.palette.numbers.red }}>
                        {!statistics || !statistics.currentYear ? (
                          <span className="loading w120" />
                        ) : (
                          <ColoredAmount
                            value={statistics.currentYear.currentMonth.expenses}
                            currency={selectedCurrency}
                          />
                        )}
                      </span>
                    </p>
                  </div>
                </Card>
                <Card className="metric">
                  <h3 className="title">{moment().format("YYYY")}</h3>
                  <div className="balance">
                    <p>
                      <span style={{ color: theme.palette.numbers.blue }}>
                        {!statistics || !statistics.currentYear ? (
                          <span className="loading w120" />
                        ) : (
                          <BalancedAmount
                            value={
                              statistics.currentYear.expenses +
                              statistics.currentYear.incomes
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
                      <span style={{ color: theme.palette.numbers.green }}>
                        {!statistics || !statistics.currentYear ? (
                          <span className="loading w120" />
                        ) : (
                          <ColoredAmount
                            value={statistics.currentYear.incomes}
                            currency={selectedCurrency}
                          />
                        )}
                      </span>
                    </p>
                    <p>
                      <small>Expenses</small>
                      <br />
                      <span style={{ color: theme.palette.numbers.red }}>
                        {!statistics || !statistics.currentYear ? (
                          <span className="loading w120" />
                        ) : (
                          <ColoredAmount
                            value={statistics.currentYear.expenses}
                            currency={selectedCurrency}
                          />
                        )}
                      </span>
                    </p>
                  </div>
                </Card>
              </SwipeableViews>
              <div>
                <MonthLineGraph
                  values={statistics ? statistics.graph : []}
                  ratio="50%"
                  isLoading={!Boolean(statistics) || isConfidential || false}
                  color={theme.palette.text.primary}
                />
              </div>
            </div>

            <div className="column">
              <div>
                <h2>Trends</h2>
              </div>

              <Trends
                trend30={statistics ? statistics.trend30 : null}
                trend7={statistics ? statistics.trend7 : null}
                disabled={disableSwipeableViews}
                isLoading={!statistics}
                onOpenTrend={handleToggleTrend}
              />

              <div>
                <h2>Last 3 months</h2>
                <CalendarGraph
                  values={calendar}
                  monthsPerLine={4}
                  isLoading={!Boolean(statistics) || isConfidential || false}
                  onClick={(year, month) => { navigate(`/transactions/${year}/${+month+1}`); }} />
              </div>

              <div
                style={{ padding: "40px 20px 40px 20px", fontSize: "0.9rem" }}
              >
                <p>
                  This account contains{" "}
                  <span style={{ color: theme.palette.transactions.main }}>
                    {!transactions || props.loadingOnly ? (
                      <span className="loading w80" />
                    ) : (
                      transactions.length
                    )}
                  </span>{" "}
                  <strong>transactions</strong>,{" "}
                  <span style={{ color: theme.palette.changes.main }}>
                    {!changes || props.loadingOnly ? (
                      <span className="loading w80" />
                    ) : (
                      changes.length
                    )}
                  </span>{" "}
                  <strong>changes</strong>, and{" "}
                  <span style={{ color: theme.palette.categories.main }}>
                    {!categories || props.loadingOnly ? (
                      <span className="loading w80" />
                    ) : (
                      categories.length
                    )}
                  </span>{" "}
                  <strong>categories</strong>.
                </p>
              </div>

              <Stack spacing={2}>
              { cacheDidUpdate &&
                <Alert
                  severity="success"
                  action={
                    <Button
                      color="inherit"
                      onClick={() => dispatch(AppActions.reload())}
                      size="small"
                    >
                      Update
                    </Button>
                  }
                >
                  <AlertTitle>New version available</AlertTitle>
                  An update has just been installed and is now available on
                  your device.
                </Alert>
              }


              { subscription_expire_soon &&
                <Alert
                  severity="warning"
                  action={
                    <Button
                      color="inherit"
                      onClick={() => navigate('/settings/subscription/')}
                      size="small"
                    >
                      Renew
                    </Button>
                  }
                >
                  <AlertTitle>Subscription expiring soon</AlertTitle>
                  Your subscription is about to expire { valid_until_moment.fromNow() }.
                </Alert>
              }

              {subscription_has_expire &&
                <Alert
                  severity="error"
                  action={
                    <Button
                      color="inherit"
                      onClick={() => navigate('/settings/subscription/')}
                      size="small"
                    >
                      Renew
                    </Button>
                  }
                >
                  <AlertTitle>Subscription expired</AlertTitle>
                  Your subscription has expired. You can still read your data but sync has been disabled.
                </Alert>
              }

              {should_migrate_account && 
                <Alert
                  severity="info"
                  id="cy_migrate_alert"
                >
                  <AlertTitle>Migrate your account</AlertTitle>
                  <p>This account is currently ony available on your device. Migrate it to the cloud so it can be synced and saved for you.</p>
                  <Stack direction="row-reverse" spacing={2}>
                  <Button
                    color="inherit"
                    onClick={() => navigate('/settings/accounts/')}
                    size="small"
                  >
                    Migrate now
                  </Button>
                  </Stack>
                </Alert>}
              </Stack>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
