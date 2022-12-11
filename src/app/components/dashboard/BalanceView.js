import React, { Component } from "react";
import { useSelector } from "react-redux";
import moment from "moment";
import { useTheme } from "../../theme";

import SwipeableViews from "react-swipeable-views";

import Card from "@mui/material/Card";

import Button from "@mui/material/Button";

import { ColoredAmount, Amount, BalancedAmount } from "../currency/Amount";

export default function BalanceView({
  isLoading,
  disableSwipeableViews,
  statistics,
  disabled
}) {
  const theme = useTheme();

  const selectedCurrency = useSelector(state => {
    return Array.isArray(state.currencies) && state.account
      ? state.currencies.find(c => c.id === state.account.currency)
      : null;
  });

  return (
    <SwipeableViews
      enableMouseEvents
      disabled={disableSwipeableViews}
      index={disableSwipeableViews ? 0 : null}
      className="metrics"
      style={{ padding: "0 calc(100% - 300px) 0 10px" }}
      slideStyle={{ padding: "8px 5px" }}
    >
      {/* THIS MONTH */}
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
      {/* THIS YEAR */}
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
  );
}