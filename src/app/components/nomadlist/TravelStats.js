import moment from "moment";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";

import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import { BalancedAmount, ColoredAmount } from "../currency/Amount";

import StatisticsActions from "../../actions/StatisticsActions";

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%"
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: "33.33%",
    flexShrink: 0
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary
  }
}));

export default function TravelStats() {
  const dispatch = useDispatch();
  const classes = useStyles();

  const [statistics, setStatistic] = useState(null);
  const selectedCurrency = useSelector(state =>
    state.account
      ? state.currencies.find(c => c.id === state.account.currency)
      : null
  );

  const nomadlist = useSelector(state =>
    state.user.socialNetworks ? state.user.socialNetworks.nomadlist || {} : {}
  );

  const performSearch = () => {
    if (nomadlist) {
      setStatistic(null);
      dispatch(StatisticsActions.nomadlist()).then(result => {
        result.cities.sort((a, b) => {
          if (a.trips.length < b.trips.length) {
            return 1;
          } else {
            return -1;
          }
        });
        setStatistic(result.cities);
      });
    }
  };

  useEffect(() => {
    performSearch();
  }, [nomadlist]);

  return (
    <div style={{ padding: "2px 20px" }}>
      <h2
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }}
      >
        {nomadlist.data.username}
      </h2>

      {statistics ? (
        <div>
          <h3>Trips</h3>

          {statistics.map((city, i) => {
            return (
              <ExpansionPanel key={i}>
                <ExpansionPanelSummary
                  key={i}
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography className={classes.heading}>
                    {city.place}
                  </Typography>
                  <Typography className={classes.secondaryHeading}>
                    {city.trips.length} trips, {city.stay} days,{" "}
                    {city.transactions_length} transactions
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails style={{ overflow: "auto" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell align="right">Expenses</TableCell>
                        <TableCell align="right">Transactions</TableCell>
                        <TableCell align="right"></TableCell>
                        <TableCell align="right"></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {city.trips.map((trip, i) => (
                        <TableRow key={`${trip.date_start}-${i}`}>
                          <TableCell component="th" scope="row">
                            {moment(trip.date_start).format("LL")}
                          </TableCell>
                          <TableCell>{trip.length}</TableCell>
                          <TableCell align="right">
                            <ColoredAmount
                              value={trip.stats.expenses}
                              currency={selectedCurrency}
                            />
                          </TableCell>
                          <TableCell align="right">
                            {trip.transactions.length}
                          </TableCell>
                          <TableCell align="right"></TableCell>
                          <TableCell align="right"></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ExpansionPanelDetails>
              </ExpansionPanel>
            );
          })}
        </div>
      ) : (
        <span className="loading W200"></span>
      )}
    </div>
  );
}
