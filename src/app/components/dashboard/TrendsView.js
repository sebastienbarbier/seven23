import React, { Component } from "react";
import { useSelector } from "react-redux";
import makeStyles from '@mui/styles/makeStyles';
import moment from "moment";
import { useTheme } from "../../theme";

import SwipeableViews from "react-swipeable-views";

import Card from "@mui/material/Card";

import Button from "@mui/material/Button";

import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";

import { ColoredAmount, Amount } from "../currency/Amount";

import { grey } from '@mui/material/colors';

const useStyles = makeStyles(theme => ({
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
}));

export default function Trends({
  isLoading,
  trend7,
  trend30,
  onOpenTrend,
  disabled
}) {
  const classes = useStyles();
  const theme = useTheme();

  const categories = useSelector(state =>
    state.categories ? state.categories.list : null
  );
  const selectedCurrency = useSelector(state => {
    return Array.isArray(state.currencies) && state.account
      ? state.currencies.find(c => c.id === state.account.currency)
      : null;
  });

  const handleOpenTrendDetails = trend => {
    onOpenTrend({
      trend,
      component: trendListComponent(trend)
    });
  };

  const trendListComponent = trend => {
    return (
      <div
        style={{ fontSize: "0.8rem", paddingBottom: 40 }}
        className={isLoading ? "noscroll wrapper" : "wrapper"}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <th style={{ textAlign: "right", paddingBottom: "4px" }}>
                {moment(trend.secondRange.dateBegin)
                  .startOf("day")
                  .format("MMM Do")}{" "}
                -{" "}
                {moment(trend.secondRange.dateEnd)
                  .endOf("day")
                  .format("MMM Do")}
              </th>
              <th>
                <CompareArrowsIcon
                  style={{
                    verticalAlign: "bottom",
                    padding: "0 8px",
                    fontSize: 36
                  }}
                />
              </th>
              <th style={{ textAlign: "left", paddingBottom: "4px" }}>
                {moment(trend.firstRange.dateBegin)
                  .startOf("day")
                  .format("MMM Do")}{" "}
                -{" "}
                {moment(trend.firstRange.dateEnd)
                  .endOf("day")
                  .format("MMM Do")}
              </th>
            </tr>
            <tr>
              <td colSpan="2">
                <strong>Total</strong>
              </td>
              <td style={{ textAlign: "right" }}>
                <ColoredAmount
                  value={trend.secondRange.sum - trend.firstRange.sum}
                  currency={selectedCurrency}
                  inverseColors={true}
                  forceSign={true}
                />
              </td>
            </tr>
            <tr>
              <td style={{ textAlign: "left", paddingBottom: 10 }}>
                <strong>
                  <Amount
                    value={trend.secondRange.sum}
                    currency={selectedCurrency}
                  />
                </strong>
              </td>
              <td style={{ textAlign: "center", paddingBottom: 10 }}>
                <div>
                  {trend && trend.secondRange.sum - trend.firstRange.sum < 0 ? (
                    <TrendingDownIcon
                      style={{
                        color: theme.palette.numbers.green,
                        verticalAlign: "bottom"
                      }}
                    />
                  ) : (
                    ""
                  )}
                  {trend &&
                  trend.secondRange.sum - trend.firstRange.sum == 0 ? (
                    <TrendingFlatIcon
                      style={{
                        color: theme.palette.numbers.green,
                        verticalAlign: "bottom"
                      }}
                    />
                  ) : (
                    ""
                  )}
                  {trend && trend.secondRange.sum - trend.firstRange.sum > 0 ? (
                    <TrendingUpIcon
                      style={{
                        color: theme.palette.numbers.red,
                        verticalAlign: "bottom"
                      }}
                    />
                  ) : (
                    ""
                  )}
                </div>
              </td>
              <td style={{ textAlign: "right", paddingBottom: 10 }}>
                <strong>
                  <Amount
                    tabularNums
                    value={trend.firstRange.sum}
                    currency={selectedCurrency}
                  />
                </strong>
              </td>
            </tr>
            {trend && !isLoading
              ? trend.trend.map(trend => {
                  return [
                    <tr key={`${trend.id}-1`}>
                      <td colSpan="2">
                        <strong>
                          {trend.id != 0
                            ? categories.find(category => {
                                return "" + category.id === "" + trend.id;
                              }).name
                            : "No category"}
                        </strong>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <ColoredAmount
                          tabularNums
                          value={trend.diff}
                          currency={selectedCurrency}
                          inverseColors={true}
                          forceSign={true}
                        />
                      </td>
                    </tr>,
                    <tr key={`${trend.id}-2`}>
                      <td style={{ textAlign: "left", paddingBottom: 10 }}>
                        <Amount
                          tabularNums
                          value={trend.oldiest}
                          currency={selectedCurrency}
                        />
                      </td>
                      <td style={{ textAlign: "center", paddingBottom: 10 }}>
                        {trend.diff < 0 ? (
                          <span style={{ color: theme.palette.numbers.green }}>
                            <TrendingDownIcon
                              style={{
                                color: theme.palette.numbers.green,
                                verticalAlign: "bottom"
                              }}
                            />
                          </span>
                        ) : (
                          ""
                        )}
                        {trend.diff == 0 ? (
                          <span>
                            {" "}
                            <TrendingFlatIcon
                              style={{
                                color: theme.palette.numbers.green,
                                verticalAlign: "bottom"
                              }}
                            />
                          </span>
                        ) : (
                          ""
                        )}
                        {trend.diff > 0 ? (
                          <span style={{ color: theme.palette.numbers.red }}>
                            <TrendingUpIcon
                              style={{
                                color: theme.palette.numbers.red,
                                verticalAlign: "bottom"
                              }}
                            />
                          </span>
                        ) : (
                          ""
                        )}
                      </td>
                      <td style={{ textAlign: "right", paddingBottom: 10 }}>
                        <Amount
                          tabularNums
                          value={trend.earliest}
                          currency={selectedCurrency}
                        />
                      </td>
                    </tr>
                  ];
                })
              : [
                  "w120",
                  "w120",
                  "w80",
                  "w120",
                  "w80",
                  "w150",
                  "w80",
                  "w20",
                  "w120",
                  "w120",
                  "w80",
                  "w150"
                ].map((value, i) => {
                  return (
                    <tr key={i}>
                      <td>
                        <span className={"loading " + value} />
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <span className={"loading w30"} />
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span className={"loading w20"} />
                      </td>
                      <td style={{ textAlign: "left" }}>
                        <span className={"loading w30"} />
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <span className={"loading w30"} />
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <SwipeableViews
      disabled={disabled}
      index={disabled ? 0 : null}
      enableMouseEvents
      style={{ padding: "0 calc(100% - 300px) 0 10px" }}
      slideStyle={{ padding: "8px 5px" }}
    >
      <Card className={classes.trendContainer}>
        <h3 className={classes.trendTitle}>
          30 <small>days</small>
        </h3>
        {isLoading ? (
          <div className={classes.trendingIcon}>
            <TrendingFlatIcon style={{ color: grey[500], fontSize: 50 }} />
          </div>
        ) : (
          <div className={classes.trendingIcon}>
            {trend30 && trend30.diff < 0 ? (
              <TrendingDownIcon
                style={{ color: theme.palette.numbers.green, fontSize: 50 }}
              />
            ) : (
              ""
            )}
            {trend30 && trend30.diff == 0 ? (
              <TrendingFlatIcon
                style={{ color: theme.palette.numbers.green, fontSize: 50 }}
              />
            ) : (
              ""
            )}
            {trend30 && trend30.diff > 0 ? (
              <TrendingUpIcon
                style={{ color: theme.palette.numbers.red, fontSize: 50 }}
              />
            ) : (
              ""
            )}
          </div>
        )}
        {isLoading ? (
          <p className={classes.trendingAmount}>
            <span className="loading w120" />
          </p>
        ) : (
          <p className={classes.trendingAmount}>
            {trend30 ? (
              <ColoredAmount
                tabularNums
                value={trend30.diff}
                currency={selectedCurrency}
                inverseColors
                forceSign
              />
            ) : (
              ""
            )}
          </p>
        )}
        <Button
          size="small"
          color='inherit'
          disabled={isLoading}
          onClick={() => handleOpenTrendDetails(trend30)}
        >
          See details
        </Button>
      </Card>

      <Card className={classes.trendContainer}>
        <h3 className={classes.trendTitle}>
          7 <small>days</small>
        </h3>
        {isLoading ? (
          <div className={classes.trendingIcon}>
            <TrendingFlatIcon style={{ color: grey[500], fontSize: 50 }} />
          </div>
        ) : (
          <div className={classes.trendingIcon}>
            {trend7 && trend7.diff < 0 ? (
              <TrendingDownIcon
                style={{ color: theme.palette.numbers.green, fontSize: 50 }}
              />
            ) : (
              ""
            )}
            {trend7 && trend7.diff == 0 ? (
              <TrendingFlatIcon
                style={{ color: theme.palette.numbers.green, fontSize: 50 }}
              />
            ) : (
              ""
            )}
            {trend7 && trend7.diff > 0 ? (
              <TrendingUpIcon
                style={{ color: theme.palette.numbers.red, fontSize: 50 }}
              />
            ) : (
              ""
            )}
          </div>
        )}
        {isLoading ? (
          <p className={classes.trendingAmount}>
            <span className="loading w120" />
          </p>
        ) : (
          <p className={classes.trendingAmount}>
            {trend7 ? (
              <ColoredAmount
                tabularNums
                value={trend7.diff}
                currency={selectedCurrency}
                inverseColors
                forceSign
              />
            ) : (
              ""
            )}
          </p>
        )}
        <Button
          size="small"
          color='inherit'
          disabled={isLoading}
          onClick={() => handleOpenTrendDetails(trend7)}
        >
          See details
        </Button>
      </Card>
    </SwipeableViews>
  );
}