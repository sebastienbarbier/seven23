/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import moment from "moment";
import countryFlagEmoji from "country-flag-emoji";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "../router";

import Card from "@material-ui/core/Card";
import TextField from "@material-ui/core/TextField";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import IconButton from "@material-ui/core/IconButton";

import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";

import StatisticsActions from "../actions/StatisticsActions";
import TransactionTable from "./transactions/TransactionTable";
import TransactionForm from "./transactions/TransactionForm";

import UserButton from "./settings/UserButton";

export default function Nomadlist({ match }) {
  const dispatch = useDispatch();
  const { history } = useRouter();

  const nomadlist = useSelector(state =>
    state.user.socialNetworks ? state.user.socialNetworks.nomadlist || {} : {}
  );

  const [selectedTrip, setSelectedTrip] = useState(null);
  const [tabs, setTabs] = useState("trip");

  // Handle transactions
  const [isOpen, setIsOpen] = useState(false);
  const [component, setComponent] = useState(null);
  const [tripName, setTripName] = useState("");

  const trips = nomadlist ? nomadlist.data.trips : null;

  const [statistics, setStatistic] = useState(null);

  const performSearch = () => {
    if (!match.params.id) {
      setSelectedTrip(null);
      setStatistic(null);
    } else {
      const id = parseInt(match.params.id) - 1;
      if (id < trips.length) {
        setSelectedTrip(id);
        setTripName(`${trips[id].place}`);
        setStatistic(null);

        dispatch(
          StatisticsActions.report(
            moment(trips[id].date_start).toDate(),
            moment(trips[id].date_end)
              .endOf("day")
              .toDate()
          )
        ).then(result => {
          setStatistic(result);
        });
      }
    }
  };

  useEffect(() => {
    performSearch();
  }, [match.params.id]);

  const reduxTransaction = useSelector(state => state.transactions);

  useEffect(() => {
    if (reduxTransaction) {
      performSearch();
    } else {
      setStatistic(null);
    }
  }, [reduxTransaction]);

  const onSelection = i => {
    history.push("/nomadlist/" + (i + 1));
  };

  const handleEditTransaction = (transaction = {}) => {
    const component = (
      <TransactionForm
        transaction={transaction}
        onSubmit={() => setIsOpen(false)}
        onClose={() => setIsOpen(false)}
      />
    );
    setComponent(component);
    setIsOpen(true);
  };

  const handleDuplicateTransaction = (transaction = {}) => {
    const newTransaction = Object.assign({}, transaction);
    delete newTransaction.id;
    delete newTransaction.date;
    handleEditTransaction(newTransaction);
  };

  return (
    <div className="layout">
      <div className={"modalContent " + (isOpen ? "open" : "close")}>
        <Card square className="modalContentCard">
          {component}
        </Card>
      </div>
      <header className="layout_header showMobile">
        <div className="layout_header_top_bar">
          <div
            className={
              (selectedTrip == null ? "show " : "") +
              "layout_header_top_bar_title"
            }
          >
            <h2>Nomadlist</h2>
          </div>
          <div
            className={
              (selectedTrip != null ? "show " : "") +
              "layout_header_top_bar_title"
            }
            style={{ right: 80 }}
          >
            <IconButton onClick={() => history.push("/nomadlist")}>
              <KeyboardArrowLeft style={{ color: "white" }} />
            </IconButton>
            <h2 style={{ paddingLeft: 4 }}>{tripName}</h2>
          </div>
          <div className="showMobile">
            <UserButton type="button" color="white" />
          </div>
        </div>
      </header>

      <div className="layout_two_columns">
        <div
          className={(selectedTrip != null ? "hide " : "") + "layout_noscroll"}
        >
          <div className="layout_content wrapperMobile">
            {trips && !trips.length ? (
              <div className="emptyContainer">
                <p>No trips</p>
              </div>
            ) : (
              ""
            )}

            {trips && trips.length ? (
              <List className=" wrapperMobile" style={{ paddingBottom: 70 }}>
                {trips.map((trip, i) => {
                  return (
                    <ListItem
                      button
                      key={i}
                      selected={selectedTrip !== null && selectedTrip === i}
                      onClick={event => {
                        onSelection(i);
                      }}
                    >
                      <ListItemText
                        primary={`${trip.place} - ${
                          countryFlagEmoji.get(trip.country_code)
                            ? countryFlagEmoji.get(trip.country_code).emoji
                            : ""
                        } ${trip.country}`}
                        secondary={`${moment(trip.date_start).format("LL")}, ${
                          trip.length
                        }`}
                      />
                      <KeyboardArrowRight />
                    </ListItem>
                  );
                })}
              </List>
            ) : (
              ""
            )}

            {!trips ? (
              <List>
                {[
                  "w120",
                  "w150",
                  "w120",
                  "w120",
                  "w120",
                  "w150",
                  "w120",
                  "w120"
                ].map((value, i) => {
                  return (
                    <ListItem button key={i} disabled={true}>
                      <ListItemText
                        primary={<span className={`loading ${value}`} />}
                        secondary={<span className="loading w50" />}
                      />
                      <KeyboardArrowRight />
                    </ListItem>
                  );
                })}
              </List>
            ) : (
              ""
            )}
          </div>
        </div>

        {selectedTrip !== null ? (
          <div className="layout_content wrapperMobile">
            {statistics && statistics.transactions && (
              <TransactionTable
                transactions={statistics.transactions}
                onEdit={handleEditTransaction}
                onDuplicate={handleDuplicateTransaction}
                pagination="40"
                dateFormat="DD MMM YY"
              />
            )}
            {!statistics && (
              <TransactionTable
                transactions={[]}
                isLoading={true}
                pagination="40"
                dateFormat="DD MMM YY"
              />
            )}
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
