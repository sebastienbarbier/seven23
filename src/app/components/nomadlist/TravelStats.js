import moment from "moment";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";

import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import Button from "@material-ui/core/Button";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import CircularProgress from "@material-ui/core/CircularProgress";

import { BalancedAmount, ColoredAmount } from "../currency/Amount";
import CategoriesMultiSelector from "../categories/CategoriesMultiSelector";

import StatisticsActions from "../../actions/StatisticsActions";
import AccountsActions from "../../actions/AccountsActions";

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
  const account = useSelector(state => state.account);
  const [categoriesToExclude, setCategoriesToExclude] = useState(() =>
    account.preferences ? account.preferences.nomadlist : []
  );

  const selectedCurrency = useSelector(state =>
    state.account
      ? state.currencies.find(c => c.id === state.account.currency)
      : null
  );
  const categories = useSelector(state => state.categories.list);

  const nomadlist = useSelector(state =>
    state.user.socialNetworks ? state.user.socialNetworks.nomadlist || {} : {}
  );

  const [isModified, setIsModified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const reduxTransaction = useSelector(state => state.transactions);

  const performSearch = () => {
    if (nomadlist && reduxTransaction) {
      setStatistic(null);
      dispatch(StatisticsActions.nomadlist(null, categoriesToExclude))
        .then(result => {
          result.cities.sort((a, b) => {
            if (a.trips.length < b.trips.length) {
              return 1;
            } else {
              return -1;
            }
          });

          result.countries.sort((a, b) => {
            if (a.trips.length < b.trips.length) {
              return 1;
            } else {
              return -1;
            }
          });
          setStatistic(result);
        })
        .catch(exception => {
          console.error(exception);
        });
    }
  };

  const saveModification = () => {
    setIsLoading(true);
    dispatch(
      AccountsActions.setPreferences({
        nomadlist: categoriesToExclude
      })
    )
      .then(() => {
        setIsModified(false);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    performSearch();
  }, [reduxTransaction, nomadlist, categoriesToExclude]);

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

      <CategoriesMultiSelector
        value={categoriesToExclude}
        onChange={values => {
          setIsModified(true);
          setCategoriesToExclude(values ? values.map(c => c.value) : []);
        }}
      />

      {isModified && (
        <div style={{ paddingTop: 20, paddingBottom: 20 }}>
          <Button
            onClick={saveModification}
            disabled={isLoading}
            variant="contained"
            color="primary"
          >
            Save modification
          </Button>
        </div>
      )}

      {statistics ? (
        <div>
          <h3>Trips</h3>

          {statistics.cities.map((city, i) => {
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
                        <TableCell align="right">Duration</TableCell>
                        <TableCell align="right">Total expenses</TableCell>
                        <TableCell align="right">Per month</TableCell>
                        <TableCell align="right">Per day</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {city.trips.map((trip, i) => (
                        <TableRow key={`${trip.date_start}-${i}`}>
                          <TableCell component="th" scope="row">
                            {moment(trip.date_start).format("LL")}
                          </TableCell>
                          <TableCell align="right">
                            {moment(trip.date_end).diff(
                              moment(trip.date_start),
                              "day"
                            )}{" "}
                            days
                          </TableCell>
                          <TableCell align="right">
                            <ColoredAmount
                              value={trip.stats.expenses}
                              currency={selectedCurrency}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <ColoredAmount
                              value={trip.perMonth}
                              currency={selectedCurrency}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <ColoredAmount
                              value={trip.perDay}
                              currency={selectedCurrency}
                            />
                          </TableCell>
                        </TableRow>
                      ))}

                      {city.trips && city.trips.length > 1 && (
                        <TableRow>
                          <TableCell align="right">
                            <strong>Average :</strong>
                          </TableCell>
                          <TableCell align="right">
                            {parseInt(city.averageStay)} days
                          </TableCell>
                          <TableCell align="right">
                            <ColoredAmount
                              value={city.averageExpenses}
                              currency={selectedCurrency}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <ColoredAmount
                              value={city.averagePerMonth}
                              currency={selectedCurrency}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <ColoredAmount
                              value={city.averagePerDay}
                              currency={selectedCurrency}
                            />
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ExpansionPanelDetails>
              </ExpansionPanel>
            );
          })}
        </div>
      ) : (
        <CircularProgress />
      )}

      {statistics ? (
        <div>
          <h3>Country</h3>

          {statistics.countries.map((city, i) => {
            return (
              <ExpansionPanel key={i}>
                <ExpansionPanelSummary
                  key={i}
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography className={classes.heading}>
                    {city.country}
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
                        <TableCell>Place</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Duration</TableCell>
                        <TableCell align="right">Total expenses</TableCell>
                        <TableCell align="right">Per month</TableCell>
                        <TableCell align="right">Per day</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {city.trips.map((trip, i) => (
                        <TableRow key={`${trip.date_start}-${i}`}>
                          <TableCell>{trip.place}</TableCell>
                          <TableCell component="th" scope="row">
                            {moment(trip.date_start).format("LL")}
                          </TableCell>
                          <TableCell align="right">
                            {moment(trip.date_end).diff(
                              moment(trip.date_start),
                              "day"
                            )}{" "}
                            days
                          </TableCell>
                          <TableCell align="right">
                            <ColoredAmount
                              value={trip.stats.expenses}
                              currency={selectedCurrency}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <ColoredAmount
                              value={trip.perMonth}
                              currency={selectedCurrency}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <ColoredAmount
                              value={trip.perDay}
                              currency={selectedCurrency}
                            />
                          </TableCell>
                        </TableRow>
                      ))}

                      {city.trips && city.trips.length > 1 && (
                        <TableRow>
                          <TableCell colSpan="2" align="right">
                            <strong>Average :</strong>
                          </TableCell>
                          <TableCell align="right">
                            {parseInt(city.averageStay)} days
                          </TableCell>
                          <TableCell align="right">
                            <ColoredAmount
                              value={city.averageExpenses}
                              currency={selectedCurrency}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <ColoredAmount
                              value={city.averagePerMonth}
                              currency={selectedCurrency}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <ColoredAmount
                              value={city.averagePerDay}
                              currency={selectedCurrency}
                            />
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ExpansionPanelDetails>
              </ExpansionPanel>
            );
          })}
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
