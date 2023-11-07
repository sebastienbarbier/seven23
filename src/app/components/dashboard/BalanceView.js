import React, { Component } from "react";
import { useSelector } from "react-redux";
import moment from "moment";

import Box from "@mui/material/Box";

import Button from "@mui/material/Button";

import { ColoredAmount, Amount, BalancedAmount } from "../currency/Amount";
import BalanceComponent from './BalanceComponent';

export default function BalanceView({
  statistics,
  isLoading,
}) {

  return (
    <swiper-container
      space-between="0"
      className="metrics"
      slides-per-view="auto"
    >
      {/* THIS MONTH */}
      <swiper-slide>

        <BalanceComponent
          label={ moment().format("MMMM") }
          balance={!!statistics && !isLoading && (statistics?.currentYear?.currentMonth?.expenses +
                   statistics?.currentYear?.currentMonth?.incomes)}
          incomes={statistics?.currentYear?.currentMonth?.incomes}
          expenses={statistics?.currentYear?.currentMonth?.expenses}/>

      </swiper-slide>
      {/* THIS YEAR */}
      <swiper-slide>

        <BalanceComponent
          label={ moment().format("YYYY") }
          balance={!!statistics && !isLoading && (statistics?.currentYear?.expenses +
                      statistics?.currentYear?.incomes)}
          incomes={statistics?.currentYear?.incomes}
          expenses={statistics?.currentYear?.expenses}/>

      </swiper-slide>
    </swiper-container>
  );
}