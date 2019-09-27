import "./Dashboard.scss";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import { Link } from "react-router-dom";

import { useTheme } from "@material-ui/styles";

import Card from "@material-ui/core/Card";
import SwipeableViews from "react-swipeable-views";

import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Close from "@material-ui/icons/Close";
import InfoIcon from "@material-ui/icons/Info";
import MonthLineGraph from "./charts/MonthLineGraph";

import StatisticsActions from "../actions/StatisticsActions";

import UserButton from "./settings/UserButton";
import Trends from "./trends/TrendsView";

import { BalancedAmount, ColoredAmount } from "./currency/Amount";

export default function Dashboard(props) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [statistics, setStatistics] = useState(null);
  const [openTrend, setOpenTrend] = useState(false);
  const [disableSwipeableViews, setDisableSwipeableViews] = useState(
    () => window.innerWidth > 600
  );
  const [trendComponent, setTrendComponent] = useState(null);
  const selectedCurrency = useSelector(state =>
    state.account
      ? state.currencies.find(c => c.id === state.account.currency)
      : null
  );

  const isConfidential = useSelector(state => state.app.isConfidential);

  useEffect(() => {
    function checkWidth() {
      setDisableSwipeableViews(window.innerWidth > 600);
    }
    window.addEventListener("resize", checkWidth);
    return () => {
      window.removeEventListener("resize", checkWidth);
    };
  });

  const changes = useSelector(state =>
    state.changes ? state.changes.list : null
  );
  const categories = useSelector(state =>
    state.categories ? state.categories.list : null
  );
  const transactions = useSelector(state => state.transactions);
  const state = useSelector(state => state);

  // If transactions change, we refresh statistics
  useEffect(() => {
    if (!props.loadingOnly) {
      if (!transactions) {
        setStatistics(null);
      } else {
        dispatch(StatisticsActions.dashboard())
          .then(result => {
            result.graph[0].color = theme.palette.numbers.red;
            result.graph[1].color = theme.palette.numbers.blue;
            setOpenTrend(false);
            setStatistics(result);
          })
          .catch(error => {
            console.error(error);
          });
      }
    }
  }, [transactions]);

  const handleToggleTrend = trend => {
    setTrendComponent(trend && trend.component ? trend.component : null);
    setOpenTrend(!openTrend);
  };

  const subscription_expire_soon = false;
  const subscription_has_expire = false;

  return (
    <div className="layout dashboard">
      <header className="layout_header showMobile">
        <div className="layout_header_top_bar">
          <h2>Dashboard</h2>
          <div className="showMobile">
            <UserButton type="button" color="white" />
          </div>
        </div>
      </header>
      <div className="layout_content">
        <div className={(openTrend ? "open" : "") + " trendModal"}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <IconButton onClick={() => setOpenTrend(false)}>
              <Close color="action" />
            </IconButton>
          </div>
          {trendComponent}
        </div>
        <div className="layout_dashboard wrapperMobile">
          {subscription_expire_soon || subscription_has_expire ? (
            <div
              style={{
                textAlign: "center",
                padding: "20px 20px 0px 20px",
                fontSize: "0.9rem"
              }}
            >
              {subscription_expire_soon ? (
                <p>
                  <InfoIcon style={{ verticalAlign: "middle" }} /> Your
                  subscription is going to expire soon.
                </p>
              ) : (
                ""
              )}
              {subscription_has_expire ? (
                <p>
                  <InfoIcon style={{ verticalAlign: "middle" }} /> Sorry, but
                  seams like your subscription is now expired.
                </p>
              ) : (
                ""
              )}
              <Link to="/settings/subscription/">
                <Button>Manage your subscription</Button>
              </Link>
            </div>
          ) : (
            ""
          )}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
