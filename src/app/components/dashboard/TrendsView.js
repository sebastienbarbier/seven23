import React from "react";
import { useSelector } from "react-redux";
import moment from "moment";
import { useTheme } from "../../theme";

import Card from "@mui/material/Card";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";

import { ColoredAmount, Amount } from "../currency/Amount";

import { grey } from '@mui/material/colors';

import TrendsComponent from './TrendsComponent';

import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import pagination from '../swiper/Pagination';

export default function Trends({
  isLoading,
  trend7,
  trend30,
  onOpenTrend
}) {
  const theme = useTheme();

  return (
    <Swiper
      className="mobileSwiperStyle"
      pagination={pagination}
      module={[Pagination]}
      slidesPerView={'auto'}
      spaceBetween={10}
    >
      <SwiperSlide>
        <TrendsComponent
          label="30"
          isLoading={isLoading}
          trend={trend30}
          onOpenTrend={onOpenTrend}
        />
      </SwiperSlide>

      <SwiperSlide>
        <TrendsComponent
          label="7"
          isLoading={isLoading}
          trend={trend7}
          onOpenTrend={onOpenTrend}
        />
      </SwiperSlide>
    </Swiper>
  );
}