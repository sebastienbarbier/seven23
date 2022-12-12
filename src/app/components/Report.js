import "./Report.scss";

import React, { Component, useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import { useTheme } from "@mui/styles";

import ExpandMore from "@mui/icons-material/ExpandMore";
import Close from "@mui/icons-material/Close";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import Chip from "@mui/material/Chip";

import IconButton from "@mui/material/IconButton";

import MonthLineWithControls from "./dashboard/MonthLineWithControls";
import PieGraph from "./charts/PieGraph";
import CalendarGraph from "./charts/CalendarGraph";
import { useNavigate } from "react-router-dom";

import StatisticsActions from "../actions/StatisticsActions";
import ReportActions from "../actions/ReportActions";

import { Amount } from "./currency/Amount";

import ChangeRateUnknownAlert from './alerts/ChangeRateUnknownAlert';

import UserButton from "./settings/UserButton";
import DateFieldWithButtons from "./forms/DateFieldWithButtons";

import Grid from '@mui/material/Grid';

const styles = {
  chips: {
    margin: "0px 8px 4px 0px",
  },
};

export default function Report(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const [statistics, setStatistics] = useState(null);
  const [stats, setStats] = useState(null);
  const isConfidential = useSelector((state) => state.app.isConfidential);

  // Report data from redux, with default values
  const report = useSelector((state) => state.report);

  // Manage transactions
  const transactions = useSelector((state) => state.transactions);
  const youngest = useSelector((state) => state.account.youngest);
  const oldest = useSelector((state) => state.account.oldest);
  const [list_of_years, setListOfYear] = useState([]);

  // Date range
  const [dateBegin, setDateBegin] = useState(() =>
    moment(report.dateBegin).utc()
  );
  const [dateEnd, setDateEnd] = useState(() => moment(report.dateEnd).utc());
  const [graph, setGraph] = useState(null);
  const [calendar, setCalendar] = useState(null);

  // Title displayed on top of report
  const [title, setTitle] = useState(() =>
    props.report ? props.report.title : ""
  );
  const [open, setOpen] = useState(false);
  const selectedCurrency = useSelector((state) =>
    state.currencies.find((c) => c.id == state.account.currency)
  );

  const categories = useSelector((state) =>
    state.categories ? state.categories.list : null
  );

  useEffect(() => {
    if (!transactions) {
      setGraph(null);
      setStats(null);
    } else {
      const list_of_years = [];
      for (var i = moment(youngest).year(); i <= moment(oldest).year(); i++) {
        list_of_years.push(i);
      }
      setListOfYear(list_of_years);
      processData();
    }
  }, [transactions, dateBegin.format("Y M D"), dateEnd.format("Y M D")]);

  function handleDateChange(begin, end, title = null) {
    if (!dateBegin.isSame(begin) || !dateEnd.isSame(end)) {
      setDateBegin(begin);
      setDateEnd(end);
      setTitle(title);
      setGraph(null);
      setStats(null);

      dispatch(ReportActions.setDates(begin, end, title));
    }
    setOpen(false);
  }

  function processData() {
    dispatch(StatisticsActions.report(dateBegin.toDate(), dateEnd.toDate()))
      .then((result) => {
        // Generate Graph data
        let lineExpenses = {
          label: "Expenses",
          color: "red",
          values: [],
        };

        let lineIncomes = {
          label: "Incomes",
          values: [],
        };

        Object.keys(result.stats.perDates).forEach((year) => {
          // For each month of year
          Object.keys(result.stats.perDates[year].months).forEach((month) => {
            if (result.stats.perDates[year].months[month]) {
              lineExpenses.values.push({
                date: new Date(year, month),
                value: +result.stats.perDates[year].months[month].expenses * -1,
              });
              lineIncomes.values.push({
                date: new Date(year, month),
                value: result.stats.perDates[year].months[month].incomes,
              });
            } else {
              lineExpenses.values.push({
                date: new Date(year, month),
                value: 0,
              });
              lineIncomes.values.push({
                date: new Date(year, month),
                value: 0,
              });
            }
          });
        });

        // Calculate per month spending only with full and valid months
        const perPastMonth = {
          duration: 0,
          income: 0,
          expense: 0,
        };

        if (
          lineIncomes &&
          Array.isArray(lineIncomes.values) &&
          lineIncomes.values[0]
        ) {
          perPastMonth.duration = dateEnd.diff(
            lineIncomes.values[0].date,
            "month"
          );
          if (moment() < dateEnd) {
            perPastMonth.duration =
              moment().diff(lineIncomes.values[0].date, "month") || 1;
            perPastMonth.isPartial = true;
          } else {
            perPastMonth.duration =
              dateEnd.diff(lineIncomes.values[0].date, "month") || 1;
            perPastMonth.isPartial = false;
          }

          lineIncomes.values.forEach((value) => {
            if (value.date < moment()) {
              perPastMonth.income += value.value;
            }
          });
          perPastMonth.income = perPastMonth.income / perPastMonth.duration;
          lineExpenses.values.forEach((value) => {
            if (value.date < moment()) {
              perPastMonth.expense += value.value;
            }
          });
          perPastMonth.expense =
            (perPastMonth.expense / perPastMonth.duration) * -1;
        }
        result.stats.perPastMonth = perPastMonth;

        // Calculate per categories
        result.stats.perCategories = Object.keys(result.stats.perCategories)
          .map((id) => {
            const category = categories
              ? categories.find((category) => {
                  return category.id == id;
                })
              : null;
            return {
              id: id,
              name: category ? category.name : "",
              incomes: result.stats.perCategories[id].incomes,
              expenses: result.stats.perCategories[id].expenses,
            };
          })
          .sort((a, b) => {
            return a.expenses > b.expenses ? 1 : -1;
          });

        // Set graph
        setCalendar(result.stats.calendar);
        setGraph([lineExpenses, lineIncomes]);
        setStats(result.stats);
        setStatistics(Object.assign({}, result, {graph: [lineExpenses, lineIncomes]}));
      })
      .catch((error) => {
        console.error(error);
      });
  }

  return (
    <div className="layout">
      <header className="layout_header">
        <div className="layout_header_top_bar showMobile">
          <h2>Report</h2>
          <div>
            <UserButton type="button" color="white" onModal={props.onModal} />
          </div>
        </div>
        <div className="layout_header_date_range wrapperMobile">
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <DateFieldWithButtons
                label="From"
                disabled={!stats}
                value={dateBegin}
                onChange={(date) => handleDateChange(date, dateEnd)}
                disableYestedayButton="true"
                format="MMM Do, YY"
                fullWidth
                autoOk={true}
              />
              </Grid>
            <Grid item xs={6}>
              <DateFieldWithButtons
                label="To"
                disabled={!stats}
                value={dateEnd}
                onChange={(date) => handleDateChange(dateBegin, date)}
                disableYestedayButton="true"
                format="MMM Do, YY"
                fullWidth
                autoOk={true}
              />
              </Grid>
          </Grid>
          <IconButton className="header_button" onClick={(event) => setOpen(!open)} size="large">
            {open ? <Close color="action" /> : <ExpandMore color="action" />}
          </IconButton>
        </div>
      </header>
      <div className="layout_noscroll">
        <div className={(open ? "open" : "") + " suggestions wrapperMobile"}>
          <h4>Past months</h4>
          <Chip
            clickable
            style={styles.chips}
            label="Past 3 months"
            onClick={() => {
              const dateBegin = moment
                .utc()
                .subtract(3, "month")
                .startOf("month");
              const dateEnd = moment.utc().subtract(1, "month").endOf("month");
              handleDateChange(dateBegin, dateEnd, "Past 3 months");
            }}
          />
          <Chip
            clickable
            style={styles.chips}
            label="Past 6 months"
            onClick={() => {
              const dateBegin = moment
                .utc()
                .subtract(6, "month")
                .startOf("month");
              const dateEnd = moment.utc().subtract(1, "month").endOf("month");
              handleDateChange(dateBegin, dateEnd, "Past 6 months");
            }}
          />
          <Chip
            clickable
            style={styles.chips}
            label="Past 12 months"
            onClick={() => {
              const dateBegin = moment
                .utc()
                .subtract(12, "month")
                .startOf("month");
              const dateEnd = moment.utc().subtract(1, "month").endOf("month");
              handleDateChange(dateBegin, dateEnd, "Past 12 months");
            }}
          />
          <Chip
            clickable
            style={styles.chips}
            label="Past 24 months"
            onClick={() => {
              const dateBegin = moment
                .utc()
                .subtract(24, "month")
                .startOf("month");
              const dateEnd = moment.utc().subtract(1, "month").endOf("month");
              handleDateChange(dateBegin, dateEnd, "Past 24 months");
            }}
          />
          <h4>Per year</h4>
          {list_of_years.map((year) => {
            return (
              <Chip
                clickable
                style={styles.chips}
                key={year}
                label={year}
                onClick={() => {
                  const dateBegin = moment([year, 1, 1]).utc().startOf("year");
                  const dateEnd = moment([year, 11, 31]).utc().endOf("year");
                  handleDateChange(dateBegin, dateEnd, `${year}`);
                }}
              />
            );
          })}

          <h4>Others</h4>
          <Chip
            clickable
            style={styles.chips}
            label="All transactions"
            onClick={() => {
              handleDateChange(
                moment(youngest).utc(),
                moment(oldest).utc(),
                "All transactions"
              );
            }}
          />
          <Chip
            clickable
            style={styles.chips}
            label="Before today"
            onClick={() => {
              handleDateChange(
                moment(youngest).utc(),
                moment().utc().subtract(1, "day").endOf("day"),
                "Before today"
              );
            }}
          />
          <Chip
            clickable
            style={styles.chips}
            label="After today"
            onClick={() => {
              handleDateChange(
                moment().utc().add(1, "day").startOf("day"),
                moment(oldest).utc(),
                "After today"
              );
            }}
          />
        </div>
        <div className="layout_report layout_content wrapperMobile">
          <div className="column">
            { stats && stats.hasUnknownAmount && <ChangeRateUnknownAlert />}
            <div style={{ fontSize: "0.9rem", padding: "10px 20px 20px" }}>
              {title ? <h3>{title}</h3> : ""}
              <p>
                Total <strong>income</strong> of{" "}
                <span style={{ color: theme.palette.numbers.green }}>
                  {!stats ? (
                    <span className="loading w80" />
                  ) : (
                    <Amount value={stats.incomes} currency={selectedCurrency} />
                  )}
                </span>{" "}
                for a total of{" "}
                <span style={{ color: theme.palette.numbers.red }}>
                  {!stats ? (
                    <span className="loading w80" />
                  ) : (
                    <Amount
                      value={stats.expenses}
                      currency={selectedCurrency}
                    />
                  )}
                </span>{" "}
                in <strong>expenses</strong>, leaving a <strong>balance</strong>{" "}
                of{" "}
                <span style={{ color: theme.palette.numbers.blue }}>
                  {!stats ? (
                    <span className="loading w80" />
                  ) : (
                    <Amount
                      value={stats.expenses + stats.incomes}
                      currency={selectedCurrency}
                    />
                  )}
                </span>
                .
              </p>
              {!stats || stats.perPastMonth.duration > 0 ? (
                <p>
                  {stats && stats.perPastMonth.isPartial
                    ? "For the past"
                    : "For this period of"}{" "}
                  <span style={{ color: theme.palette.numbers.blue }}>
                    {!stats ? (
                      <span className="loading w20" />
                    ) : (
                      stats.perPastMonth.duration
                    )}
                  </span>{" "}
                  months, <strong>average monthly income</strong> is{" "}
                  <span style={{ color: theme.palette.numbers.green }}>
                    {!stats ? (
                      <span className="loading w80" />
                    ) : (
                      <Amount
                        value={stats.perPastMonth.income}
                        currency={selectedCurrency}
                      />
                    )}
                  </span>{" "}
                  and <strong>average monthly expense</strong> is{" "}
                  <span style={{ color: theme.palette.numbers.red }}>
                    {!stats ? (
                      <span className="loading w80" />
                    ) : (
                      <Amount
                        value={stats.perPastMonth.expense}
                        currency={selectedCurrency}
                      />
                    )}
                  </span>
                  .
                </p>
              ) : (
                ""
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <CalendarGraph
                values={calendar || []}
                isLoading={!stats || isConfidential}
                quantile={0.90}
                onClick={(year, month, day) => { navigate(`/transactions/${year}/${+month+1}/${day}`); }}
               />
            </div>
            <div style={{ position: 'relative', marginBottom: 80 }}>

              <MonthLineWithControls 
                disableRangeSelector 
                statistics={statistics} 
                isConfidential={isConfidential} />

              {/*<MonthLineGraph
                values={graph || []}
                ratio="50%"
                isLoading={!stats || isConfidential}
                color={theme.palette.text.primary}
              />*/}
            </div>

            <div className="camembert">
              <div className="item" style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    top: "0",
                    bottom: "0",
                    left: "0",
                    right: "0",
                  }}
                >
                  <PieGraph
                    values={stats ? stats.perCategories : []}
                    isLoading={!stats || isConfidential}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="column">
            <div>
              <div className="item">
                <Table style={{ background: "none" }}>
                  <TableHead>
                    <TableRow>
                      <TableCell />
                      <TableCell align="right">Expenses</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats && stats.perCategories
                      ? stats.perCategories.map((item) => {
                          const category = categories
                            ? categories.find((category) => {
                                return category.id == item.id;
                              })
                            : null;
                          return (
                            <TableRow key={item.id}>
                              <TableCell>
                                {category ? category.name : ""}
                              </TableCell>
                              <TableCell align="right">
                                <Amount
                                  tabularNums
                                  value={item.expenses}
                                  currency={selectedCurrency}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })
                      : [
                          "w120",
                          "w80",
                          "w120",
                          "w120",
                          "w120",
                          "w80",
                          "w120",
                          "w120",
                        ].map((value, i) => {
                          return (
                            <TableRow key={i}>
                              <TableCell>
                                <span className={`loading ${value}`} />
                              </TableCell>
                              <TableCell>
                                <span className="loading w30" />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}