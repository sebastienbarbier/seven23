import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import AppActions from "../../actions/AppActions";
import StatisticsActions from "../../actions/StatisticsActions";
import useRouteTitle from "../../hooks/useRouteTitle";

import TransactionList from "../transactions/TransactionList";

export default function TripDetails() {
  const dispatch = useDispatch();

  // Nomadlist object
  const nomadlist = useSelector((state) =>
    state.user.socialNetworks ? state.user.socialNetworks.nomadlist || {} : {}
  );

  // trip id from url
  let { id } = useParams();

  // List of all trips from reducer nomadlist trips object
  const trips = nomadlist ? nomadlist.data.trips : null;

  // Current selected trip
  const [trip, setTrip] = useState(trips[parseInt(id) - 1]);

  // Is loading StatisticsActions
  const [isLoading, setIsLoading] = useState(true);
  // Report from staristicsAction with list of trnsactions
  const [report, setReport] = useState(null);

  // List of all transactions, will be used to trigger a refresh if changed
  const transactions = useSelector((state) => state.transactions);

  // If app is syncing, we wait ... it means data are being fetched on backend
  const isSyncing = useSelector(
    (state) => state.state.isSyncing || state.state.isLoading
  );

  // Access routeTitle to get back button link for navbar
  const titleObject = useRouteTitle();

  // Load list of transactions to display
  useEffect(() => {
    if (!isSyncing && transactions && nomadlist) {
      const _trip = trips[parseInt(id) - 1];
      setTrip(_trip);
      dispatch(
        AppActions.setNavBar(
          `${_trip.place} - ${_trip.country}`,
          titleObject.back
        )
      );

      setReport(null);
      setIsLoading(true);

      // TODO: debug why this is needed ...
      setTimeout(() => {
        dispatch(
          StatisticsActions.report(
            moment(_trip.date_start).toDate(),
            moment(_trip.date_end).endOf("day").toDate()
          )
        )
          .then((result) => {
            setReport(result);
            setIsLoading(false);
          })
          .catch((exception) => {
            console.error(exception);
          });
      }, 10);
    }
  }, [id, transactions, isSyncing, nomadlist]);

  return (
    <Box className="nomadListPanel">
      {trip && (
        <header className="hideMobile primaryColor">
          <h2>
            {trip.place} - {trip.country}
          </h2>
          <p>
            <strong>
              {moment(trip.date_end).diff(moment(trip.date_start), "day")} days
            </strong>
            , from <strong>{moment(trip.date_start).format("LL")}</strong> until{" "}
            <strong>{moment(trip.date_end).format("LL")}</strong>
          </p>
        </header>
      )}
      <Container className="paper">
        <h3>
          {report && report.transactions && !isLoading ? (
            report.transactions.length
          ) : (
            <span className="loading w80"></span>
          )}{" "}
          transactions
        </h3>
        {report && report.transactions && !isLoading && (
          <TransactionList
            transactions={report.transactions}
            pagination="40"
            dateFormat="DD MMM YY"
          />
        )}
        {(!report || isLoading) && (
          <TransactionList
            transactions={[]}
            isLoading={true}
            pagination="40"
            dateFormat="DD MMM YY"
          />
        )}
      </Container>
    </Box>
  );
}
