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

import { BalancedAmount, ColoredAmount } from "../currency/Amount";
import CategoriesMultiSelector from "../categories/CategoriesMultiSelector";

import StatisticsActions from "../../actions/StatisticsActions";
import AccountsActions from "../../actions/AccountsActions";

export default function CityStats({ statistics, isLoading, setTitle }) {
  const dispatch = useDispatch();

  const account = useSelector(state => state.account);
  const [categoriesToExclude, setCategoriesToExclude] = useState(() =>
    account.preferences && account.preferences.nomadlist
      ? account.preferences.nomadlist
      : []
  );

  let { slug } = useParams();

  const [city, setCity] = useState(null);

  useEffect(() => {
    if (statistics) {
      const c = statistics.cities.find(c => c.place_slug == slug);
      if (c) {
        setCity(c);
        setTitle(c.place);
      }
    }
  }, [slug, statistics]);

  const selectedCurrency = useSelector(state =>
    state.account
      ? state.currencies.find(c => c.id === state.account.currency)
      : null
  );

  const nomadlist = useSelector(state =>
    state.user.socialNetworks ? state.user.socialNetworks.nomadlist || {} : {}
  );

  const [isModified, setIsModified] = useState(false);

  const reduxTransaction = useSelector(state => state.transactions);

  const [isSaving, setIsSaving] = useState(false);

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
        {city ? city.place : <span className="loading w150"></span>}
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
    </div>
  );
}