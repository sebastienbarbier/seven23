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

const css = {
  trendContainer: {
    position: "relative",
    padding: "10px 20px",
    textAlign: "right",
    width: 280
  },
  trendTitle: {
    textAlign: "left",
    margin: "0 0 20px 0",
    fontWeight: 300
  },
  trendingAmount: {
    position: "absolute",
    zIndex: 0,
    top: 18,
    right: 20,
    fontSize: 24,
    margin: 0
  },
  trendingIcon: {
    position: "absolute",
    zIndex: 0,
    bottom: 0,
    left: 20
  }
};

export default function Trends({
  isLoading,
  trend7,
  trend30,
  onOpenTrend
}) {
  const theme = useTheme();

  return (
    <swiper-container
      space-between="0"
      className="metrics"
      slides-per-view="auto"
    >
      <swiper-slide>
        <TrendsComponent
          label="30"
          isLoading={isLoading}
          trend={trend30}
          onOpenTrend={onOpenTrend}
        />
      </swiper-slide>

      <swiper-slide>
        <TrendsComponent
          label="7"
          isLoading={isLoading}
          trend={trend7}
          onOpenTrend={onOpenTrend}
        />
      </swiper-slide>
    </swiper-container>
  );
}