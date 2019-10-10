/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import moment from "moment";
import countryFlagEmoji from "country-flag-emoji";
import React, { useState, useEffect } from "react";

import {
  Router,
  Route,
  Redirect,
  Switch,
  useRouteMatch,
  useParams,
  useLocation
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "../router";

import Card from "@material-ui/core/Card";
import TextField from "@material-ui/core/TextField";

import List from "@material-ui/core/List";
import ListSubheader from "@material-ui/core/ListSubheader";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import IconButton from "@material-ui/core/IconButton";

import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";

import TransactionForm from "./transactions/TransactionForm";

import TravelStats from "./nomadlist/TravelStats";
import TripDetails from "./nomadlist/TripDetails";

import UserButton from "./settings/UserButton";

export default function Nomadlist({ match }) {
  const dispatch = useDispatch();
  const { history } = useRouter();

  let { path } = useRouteMatch();
  let location = useLocation();

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

  const [showTravelStats, setShowTravelStats] = useState(false);

  // TODO : Refactor, dirty code to match sidebar with route id
  useEffect(() => {
    if (location.pathname.startsWith("/nomadlist/trip/")) {
      const id = location.pathname.replace("/nomadlist/trip/", "");
      if (id) {
        setSelectedTrip(id);
        setTripName(`${trips[id - 1].place}`);
      } else {
        setSelectedTrip(null);
      }
      setShowTravelStats(false);
    } else if (location.pathname.startsWith("/nomadlist/stats")) {
      setTripName(`Overview`);
      setSelectedTrip(null);
      setShowTravelStats(true);
    } else {
      setSelectedTrip(null);
      setShowTravelStats(false);
    }
  }, [location.pathname]);

  const onSelection = i => {
    if (i !== null) {
      history.push("/nomadlist/trip/" + (i + 1));
    } else {
      history.push("/nomadlist");
    }
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
              (selectedTrip == null && !showTravelStats ? "show " : "") +
              "layout_header_top_bar_title"
            }
          >
            <h2>Nomadlist</h2>
          </div>
          <div
            className={
              (selectedTrip != null || showTravelStats ? "show " : "") +
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
          className={
            (selectedTrip != null || showTravelStats ? "hide " : "") +
            "layout_noscroll"
          }
        >
          <div className="layout_content wrapperMobile">
            <List
              className=" wrapperMobile"
              subheader={
                <ListSubheader disableSticky component="div">
                  Nomadlist @{nomadlist.username}
                </ListSubheader>
              }
            >
              <ListItem
                button
                selected={selectedTrip === null && showTravelStats}
                onClick={event => {
                  setTripName(`Overview`);
                  history.push("/nomadlist/stats");
                  setShowTravelStats(true);
                }}
              >
                <ListItemText
                  primary={`Overview`}
                  secondary={`Per city or per country`}
                />
                <KeyboardArrowRight />
              </ListItem>
            </List>

            {trips && !trips.length ? (
              <div className="emptyContainer">
                <p>No trips</p>
              </div>
            ) : (
              ""
            )}

            {trips && trips.length ? (
              <List
                className=" wrapperMobile"
                style={{ paddingBottom: 70 }}
                subheader={
                  <ListSubheader disableSticky component="div">
                    Your trips ({trips.length})
                  </ListSubheader>
                }
              >
                {trips.map((trip, i) => {
                  return (
                    <ListItem
                      button
                      key={i}
                      selected={selectedTrip !== null && selectedTrip == i + 1}
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

        <div className="layout_content wrapperMobile">
          <Switch>
            <Route exact path={`${path}/stats`}>
              <TravelStats />
            </Route>
            <Route path={`${path}/trip/:id`}>
              <TripDetails
                onEdit={handleEditTransaction}
                onDuplicate={handleDuplicateTransaction}
              />
            </Route>
          </Switch>
        </div>
      </div>
    </div>
  );
}
