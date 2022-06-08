import moment from "moment";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import makeStyles from '@mui/styles/makeStyles';

import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Button from "@mui/material/Button";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import CircularProgress from "@mui/material/CircularProgress";

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

export default function CountryStats({ statistics, isLoading, setTitle }) {
  const dispatch = useDispatch();
  const classes = useStyles();

  const account = useSelector(state => state.account);
  const [categoriesToExclude, setCategoriesToExclude] = useState(() =>
    account.preferences && account.preferences.nomadlist
      ? account.preferences.nomadlist
      : []
  );

  let { slug } = useParams();

  const [country, setCountry] = useState(null);

  useEffect(() => {
    if (statistics) {
      const c = statistics.countries.find(c => c.country_slug == slug);
      if (c) {
        setCountry(c);
        setTitle(c.country);
      }
    }
  }, [slug, statistics]);

  const selectedCurrency = useSelector(state =>
    state.account
      ? state.currencies.find(c => c.id === state.account.currency)
      : null
  );

  const [isModified, setIsModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const reduxTransaction = useSelector(state => state.transactions);

  const saveModification = () => {
    setIsSaving(true);
    dispatch(
      AccountsActions.setPreferences({
        nomadlist: categoriesToExclude
      })
    )
      .then(() => {
        setIsModified(false);
        setIsSaving(false);
      })
      .catch(() => {
        setIsSaving(false);
      });
  };

  useEffect(() => {
    if (account && account.preferences && account.preferences.nomadlist) {
      setCategoriesToExclude(account.preferences.nomadlist);
    } else {
      setCategoriesToExclude([]);
    }
  }, [account]);

  return (
    <div style={{ padding: "2px 20px" }}>
      <h2
        className="hideMobile"
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          marginBottom: 0
        }}
      >
        {country ? country.country : <span className="loading w150"></span>}
      </h2>

      <div style={{ paddingTop: 20 }}>
        <CategoriesMultiSelector
          value={categoriesToExclude}
          onChange={values => {
            setIsModified(true);
            setCategoriesToExclude(values ? values.map(c => c.value) : []);
          }}
        />
      </div>

      {isModified && (
        <div style={{ paddingTop: 20, paddingBottom: 20 }}>
          <Button
            onClick={saveModification}
            disabled={isLoading || isSaving}
            variant="contained"
            color="primary"
          >
            Save modification
          </Button>
        </div>
      )}

      {country && statistics && !isLoading ? (
        <div>
          <h3>Country</h3>

          <div style={{ overflow: "auto", paddingBottom: 40 }}>
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
                {country.trips.map((trip, i) => (
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

                {country.trips && country.trips.length > 1 && (
                  <TableRow>
                    <TableCell colSpan="2" align="right">
                      <strong>Average :</strong>
                    </TableCell>
                    <TableCell align="right">
                      {parseInt(country.averageStay)} days
                    </TableCell>
                    <TableCell align="right">
                      <ColoredAmount
                        value={country.averageExpenses}
                        currency={selectedCurrency}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <ColoredAmount
                        value={country.averagePerMonth}
                        currency={selectedCurrency}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <ColoredAmount
                        value={country.averagePerDay}
                        currency={selectedCurrency}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}