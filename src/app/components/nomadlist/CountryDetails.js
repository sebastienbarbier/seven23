import moment from "moment";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

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
import TransactionForm from "../transactions/TransactionForm";

import { BalancedAmount, ColoredAmount } from "../currency/Amount";
import CategoriesMultiSelector from "../categories/CategoriesMultiSelector";

import StatisticsActions from "../../actions/StatisticsActions";
import AccountsActions from "../../actions/AccountsActions";
import AppActions from "../../actions/AppActions";

import useRouteTitle from "../../hooks/useRouteTitle";

export default function CountryStats() {
  const dispatch = useDispatch();
  // Access routeTitle to get back button link for navbar
  const titleObject = useRouteTitle();

  // Handle state for loading UI
  const [isLoading, setIsLoading] = useState(true);

  const account = useSelector(state => state.account);
  const [categoriesToExclude, setCategoriesToExclude] = useState(() =>
    account.preferences && account.preferences.nomadlist
      ? account.preferences.nomadlist
      : []
  );

  // Nomad list object
  const nomadlist = useSelector(state =>
    state.user.socialNetworks ? state.user.socialNetworks.nomadlist || {} : {}
  );

  // Coutnry slug to use for this.
  let { slug } = useParams();

  // Selected country based on slug
  const [country, setCountry] = useState(null);

  // List of all transactions
  const transactions = useSelector(state => state.transactions);

  // Is the app syncing, if so we probably should wait
  const isSyncing = useSelector(
    state => state.state.isSyncing || state.state.isLoading
  );

  // Statistics to dispay data from Action
  const [statistics, setStatistic] = useState(null);

  useEffect(() => {
    if (transactions && !isSyncing && nomadlist && slug) {
      setIsLoading(true);
      // We fetch nomadlist data with list if cities
      // TODO: investigate why this is needed
      setTimeout(() => {
        dispatch(StatisticsActions.nomadlist())
          .then(result => {
            result.countries.sort((a, b) => {
              if (a.trips.length < b.trips.length) {
                return 1;
              } else {
                return -1;
              }
            });

            setStatistic(result);
            const c = result.countries.find(c => c.country_slug == slug);
            if (c) {
              setCountry(c);
              dispatch(AppActions.setNavBar(`${c.country}`, titleObject.back));
              setIsLoading(false);
            }
          })
          .catch(exception => {
            console.error(exception);
          });
        }, 200);
    }
  }, [slug, transactions, isSyncing]);

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
        <CircularProgress />
      )}
    </div>
  );
}