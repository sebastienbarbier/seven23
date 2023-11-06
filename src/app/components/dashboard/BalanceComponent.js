import React, { Component } from "react";
import { useSelector } from "react-redux";
import moment from "moment";
import { useTheme } from "../../theme";

import Box from "@mui/material/Box";

import Button from "@mui/material/Button";

import { ColoredAmount, Amount, BalancedAmount } from "../currency/Amount";

export default function BalanceComponent({
  label,
  balance,
  expenses,
  incomes,
}) {
  const theme = useTheme();

  const selectedCurrency = useSelector(state => {
    return Array.isArray(state.currencies) && state.account
      ? state.currencies.find(c => c.id === state.account.currency)
      : null;
  });

  return (
    <div className="balanceCard">
      <h3 className="title">{ label }</h3>
      <div className="balance">
        <p>
          <span style={{ color: theme.palette.numbers.blue }}>
            {!balance ? (
              <span className="loading w120" />
            ) : (
              <BalancedAmount
                value={ balance}
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
            {!incomes ? (
              <span className="loading w120" />
            ) : (
              <ColoredAmount
                value={incomes}
                currency={selectedCurrency}
              />
            )}
          </span>
        </p>
        <p>
          <small>Expenses</small>
          <br />
          <span style={{ color: theme.palette.numbers.red }}>
            {!expenses ? (
              <span className="loading w120" />
            ) : (
              <ColoredAmount
                value={expenses}
                currency={selectedCurrency}
              />
            )}
          </span>
        </p>
      </div>
    </div>
  );
}