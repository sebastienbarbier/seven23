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
import Container from "@mui/material/Container";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import TransactionForm from "../transactions/TransactionForm";

import CircularProgress from "@mui/material/CircularProgress";

import { BalancedAmount, ColoredAmount } from "../currency/Amount";
import CategoriesMultiSelector from "../categories/CategoriesMultiSelector";

import StatisticsActions from "../../actions/StatisticsActions";
import AccountsActions from "../../actions/AccountsActions";
import AppActions from "../../actions/AppActions";

import useRouteTitle from "../../hooks/useRouteTitle";

export default function CityStats() {

  const dispatch = useDispatch();
  // Access routeTitle to get back button link for navbar
  const titleObject = useRouteTitle();

  const account = useSelector(state => state.account);

  // Handle state for loading UI
  const [isLoading, setIsLoading] = useState(true);

  // List of categories to excluse for calculations
  const [categoriesToExclude, setCategoriesToExclude] = useState(() =>
    account.preferences && account.preferences.nomadlist
      ? account.preferences.nomadlist
      : []
  );

  // Statistics to dispay data from Action
  const [statistics, setStatistic] = useState(null);

  // Slug used to access city object
  let { slug } = useParams();

  // Current city object
  const [city, setCity] = useState(null);

  // List of all transactions
  const transactions = useSelector(state => state.transactions);

  const isSyncing = useSelector(
    state => state.state.isSyncing || state.state.isLoading
  );

  useEffect(() => {
    if (transactions && !isSyncing && nomadlist && slug) {
      // We fetch nomadlist data with list if cities
      // TODO: investigate why this is needed

     setIsLoading(true);
      setTimeout(() => {
        dispatch(StatisticsActions.nomadlist())
          .then(result => {
            result.cities.sort((a, b) => {
              if (a.trips.length < b.trips.length) {
                return 1;
              } else {
                return -1;
              }
            });

            setStatistic(result);
            const c = result.cities.find(c => c.place_slug == slug);
            if (c) {
              setCity(c);
              dispatch(AppActions.setNavBar(`${c.place}`, titleObject.back));
              setIsLoading(false);
            }
          })
          .catch(exception => {
            console.error(exception);
          });
        }, 10);
    }
  }, [slug, transactions, isSyncing]);

  // Selected currency used to display numbers
  const selectedCurrency = useSelector(state =>
    state.account
      ? state.currencies.find(c => c.id === state.account.currency)
      : null
  );

  // Nomad list object
  const nomadlist = useSelector(state =>
    state.user.socialNetworks ? state.user.socialNetworks.nomadlist || {} : {}
  );

  // Handle states for category list
  const [isModified, setIsModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Save modifications on list of categories to ignore
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

  // When account is updated, we update category list to exclude
  useEffect(() => {
    if (account?.preferences?.nomadlist) {
      setCategoriesToExclude(account.preferences.nomadlist);
    } else {
      setCategoriesToExclude([]);
    }
  }, [account]);

  return (
    <div className="nomadListPanel">
      <header className="primaryColor hideMobile">
        <h2>
          {city ? city.place : <span className="loading w150"></span>}
        </h2>
      </header>

      <Container>
        <div>
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

        {city && statistics && !isLoading ? (
          <div>
            <h3>Trips</h3>

            <div style={{ overflow: "auto", paddingBottom: 40 }}>
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
            </div>
          </div>
        ) : (
          <CircularProgress />
        )}
      </Container>
    </div>
  );
}