import React, { Component } from "react";
import { useSelector } from "react-redux";
import moment from "moment";

import Box from "@mui/material/Box";

import Button from "@mui/material/Button";

import { ColoredAmount, Amount, BalancedAmount } from "../currency/Amount";
import BalanceComponent from './BalanceComponent';

import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import pagination from '../swiper/Pagination';

export default function BalanceView({
  statistics,
  isLoading,
}) {

  return (
    <Swiper
      className="mobileSwiperStyle"
      pagination={pagination}
      module={[Pagination]}
      slidesPerView={'auto'}
    >
      {/* THIS MONTH */}
      <SwiperSlide>

        <BalanceComponent
          label={ moment().format("MMMM") }
          balance={!!statistics && !isLoading && (statistics?.currentYear?.currentMonth?.expenses +
                   statistics?.currentYear?.currentMonth?.incomes)}
          incomes={statistics?.currentYear?.currentMonth?.incomes}
          expenses={statistics?.currentYear?.currentMonth?.expenses}/>

      </SwiperSlide>
      {/* THIS YEAR */}
      <SwiperSlide>

        <BalanceComponent
          label={ moment().format("YYYY") }
          balance={!!statistics && !isLoading && (statistics?.currentYear?.expenses +
                      statistics?.currentYear?.incomes)}
          incomes={statistics?.currentYear?.incomes}
          expenses={statistics?.currentYear?.expenses}/>

      </SwiperSlide>
    </Swiper>
  );
}