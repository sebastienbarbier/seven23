import moment from "moment";
import { useSelector } from "react-redux";
import { useTheme } from "../../theme";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import { Amount, ColoredAmount } from "../currency/Amount";

import { grey } from "@mui/material/colors";

import "./TrendsComponent.scss";

const css = {
  trendContainer: {
    position: "relative",
    padding: "10px 20px",
    textAlign: "right",
    minHeight: "90px",
  },
  trendTitle: {
    textAlign: "left",
    margin: "0 0 20px 0",
    fontWeight: 300,
  },
  trendingAmount: {
    position: "absolute",
    zIndex: 0,
    top: 18,
    right: 20,
    fontSize: 24,
    margin: 0,
  },
  trendingIcon: {
    position: "absolute",
    zIndex: 0,
    bottom: 0,
    left: 0,
  },
  trendingButton: {
    position: "absolute",
    zIndex: 0,
    bottom: "4px",
    right: "12px",
  },
};

export default function TrendsComponent({
  label,
  isLoading,
  trend,
  onOpenTrend,
}) {
  const theme = useTheme();

  const categories = useSelector((state) =>
    state.categories ? state.categories.list : null
  );
  const selectedCurrency = useSelector((state) => {
    return Array.isArray(state.currencies) && state.account
      ? state.currencies.find((c) => c.id === state.account.currency)
      : null;
  });

  const handleOpenTrendDetails = () => {
    onOpenTrend({
      trend,
      component: trendListComponent(trend),
    });
  };

  const trendListComponent = () => {
    return (
      <div
        style={{
          fontSize: "0.8rem",
          paddingBottom: 80,
          maxWidth: 400,
          margin: "auto",
        }}
        className={isLoading ? "noscroll " : ""}
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
                    fontSize: 36,
                  }}
                />
              </th>
              <th style={{ textAlign: "left", paddingBottom: "4px" }}>
                {moment(trend.firstRange.dateBegin)
                  .startOf("day")
                  .format("MMM Do")}{" "}
                -{" "}
                {moment(trend.firstRange.dateEnd).endOf("day").format("MMM Do")}
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
                  {trend &&
                    trend.secondRange.sum - trend.firstRange.sum < 0 && (
                      <TrendingDownIcon
                        style={{
                          color: theme.palette.numbers.green,
                          verticalAlign: "bottom",
                        }}
                      />
                    )}
                  {trend &&
                    trend.secondRange.sum - trend.firstRange.sum == 0 && (
                      <TrendingFlatIcon
                        style={{
                          color: theme.palette.numbers.green,
                          verticalAlign: "bottom",
                        }}
                      />
                    )}
                  {trend &&
                    trend.secondRange.sum - trend.firstRange.sum > 0 && (
                      <TrendingUpIcon
                        style={{
                          color: theme.palette.numbers.red,
                          verticalAlign: "bottom",
                        }}
                      />
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
              ? trend.trend.map((trend) => {
                  return [
                    <tr key={`${trend.id}-1`}>
                      <td colSpan="2">
                        <strong>
                          {trend.id != 0 && categories
                            ? categories.find((category) => {
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
                        {trend.diff < 0 && (
                          <span style={{ color: theme.palette.numbers.green }}>
                            <TrendingDownIcon
                              style={{
                                color: theme.palette.numbers.green,
                                verticalAlign: "bottom",
                              }}
                            />
                          </span>
                        )}
                        {trend.diff == 0 && (
                          <span>
                            {" "}
                            <TrendingFlatIcon
                              style={{
                                color: theme.palette.numbers.green,
                                verticalAlign: "bottom",
                              }}
                            />
                          </span>
                        )}
                        {trend.diff > 0 && (
                          <span style={{ color: theme.palette.numbers.red }}>
                            <TrendingUpIcon
                              style={{
                                color: theme.palette.numbers.red,
                                verticalAlign: "bottom",
                              }}
                            />
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: "right", paddingBottom: 10 }}>
                        <Amount
                          tabularNums
                          value={trend.earliest}
                          currency={selectedCurrency}
                        />
                      </td>
                    </tr>,
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
                  "w150",
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
    <Box className="balanceCard" sx={css.trendContainer}>
      <Box component="h3" sx={css.trendTitle}>
        {label} <small>days</small>
      </Box>
      {isLoading ? (
        <Box sx={css.trendingIcon}>
          <TrendingFlatIcon style={{ color: grey[500], fontSize: 50 }} />
        </Box>
      ) : (
        <Box sx={css.trendingIcon}>
          {trend?.diff < 0 && (
            <TrendingDownIcon
              style={{ color: theme.palette.numbers.green, fontSize: 50 }}
            />
          )}
          {trend?.diff == 0 && (
            <TrendingFlatIcon
              style={{ color: theme.palette.numbers.green, fontSize: 50 }}
            />
          )}
          {trend?.diff > 0 && (
            <TrendingUpIcon
              style={{ color: theme.palette.numbers.red, fontSize: 50 }}
            />
          )}
        </Box>
      )}
      {isLoading ? (
        <Box component="p" sx={css.trendingAmount}>
          <span className="loading w120" />
        </Box>
      ) : (
        <Box component="p" sx={css.trendingAmount}>
          {trend && (
            <ColoredAmount
              tabularNums
              value={trend.diff}
              currency={selectedCurrency}
              inverseColors
              forceSign
            />
          )}
        </Box>
      )}
      <Button
        size="small"
        color="inherit"
        disabled={isLoading}
        sx={css.trendingButton}
        onClick={() => handleOpenTrendDetails()}
      >
        See details
      </Button>
    </Box>
  );
}
