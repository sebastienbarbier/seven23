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

import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";

import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";
import LoopIcon from "@material-ui/icons/Loop";
import Tooltip from "@material-ui/core/Tooltip";

import TransactionForm from "./transactions/TransactionForm";

import TripDetails from "./nomadlist/TripDetails";
import CityDetails from "./nomadlist/CityDetails";
import CountryDetails from "./nomadlist/CountryDetails";

import StatisticsActions from "../actions/StatisticsActions";
import UserActions from "../actions/UserActions";

import UserButton from "./settings/UserButton";

export default function Nomadlist({ match }) {
  const dispatch = useDispatch();
  const { history } = useRouter();

  let { path } = useRouteMatch();
  let location = useLocation();

  const nomadlist = useSelector(state =>
    state.user.socialNetworks ? state.user.socialNetworks.nomadlist || {} : {}
  );

  const [isLoading, setIsLoading] = useState(true);

  const [selectedTrip, setSelectedTrip] = useState(null);
  const [tabs, setTabs] = useState("trip");

  // Handle transactions
  const [isOpen, setIsOpen] = useState(false);
  const [component, setComponent] = useState(null);
  const [tripName, setTripName] = useState("");

  const trips = nomadlist ? nomadlist.data.trips : null;

  let currentview = null;
  if (location.pathname.startsWith("/nomadlist/trip/")) {
    currentview = "trips";
  }
  if (location.pathname.startsWith("/nomadlist/city/")) {
    currentview = "cities";
  }
  if (location.pathname.startsWith("/nomadlist/country/")) {
    currentview = "countries";
  }

  const [showTravelStats, setShowTravelStats] = useState(Boolean(currentview));
  const [viewList, setViewList] = useState(currentview || "trips");
  const account = useSelector(state => state.account);
  const [statistics, setStatistic] = useState(null);

  const isSyncing = useSelector(
    state => state.state.isSyncing || state.state.isLoading
  );

  useEffect(() => {
    if (!isSyncing) {
      setIsLoading(true);
      let excluseCategories = [];
      if (account.preferences && account.preferences.nomadlist) {
        excluseCategories = account.preferences.nomadlist;
      }
      dispatch(StatisticsActions.nomadlist(null, excluseCategories)).then(
        result => {
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
          setIsLoading(false);
        }
      );
    }
  }, [nomadlist, account, isSyncing]);

  // TODO : Refactor, dirty code to match sidebar with route id
  useEffect(() => {
    if (location.pathname.startsWith("/nomadlist/trip/")) {
      const id = location.pathname.replace("/nomadlist/trip/", "");
      if (id) {
        setSelectedTrip(id);
      } else {
        setSelectedTrip(null);
      }
    } else if (location.pathname == "/nomadlist") {
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

  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshNomadlist = () => {
    setIsRefreshing(true);
    dispatch(UserActions.updateNomadlist())
      .then(() => {
        setIsRefreshing(false);
      })
      .catch(exception => {
        styleetIsRefreshing(false);
        console.error(exception);
      });
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <List
                subheader={
                  <ListSubheader disableSticky component="div">
                    Nomadlist @{nomadlist.username}
                  </ListSubheader>
                }
              ></List>
              {account.isLocal && (
                <Tooltip title="Refresh nomadlist profile" aria-label="add">
                  <IconButton
                    size="small"
                    disabled={isRefreshing}
                    style={{ marginRight: 15, marginBottom: 6 }}
                    onClick={refreshNomadlist}
                  >
                    <LoopIcon
                      className={
                        isRefreshing
                          ? "syncingAnimation"
                          : "syncingAnimation stop"
                      }
                    />
                  </IconButton>
                </Tooltip>
              )}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                paddingTop: 10,
                paddingBottom: 20,
                position: "sticky",
                top: 0,
                zIndex: 99,
                background:
                  "linear-gradient(var(--paper-color) 0%, var(--paper-color) 90%, transparent 100%)"
              }}
            >
              <ButtonGroup
                disabled={isLoading}
                color="primary"
                size="small"
                aria-label="small outlined button group"
              >
                <Button
                  variant={
                    !isLoading && viewList == "trips" ? "contained" : "outlined"
                  }
                  onClick={() => setViewList("trips")}
                >
                  Trips
                </Button>
                <Button
                  variant={
                    !isLoading && viewList == "cities"
                      ? "contained"
                      : "outlined"
                  }
                  onClick={() => setViewList("cities")}
                >
                  Cities
                </Button>
                <Button
                  variant={
                    !isLoading && viewList == "countries"
                      ? "contained"
                      : "outlined"
                  }
                  onClick={() => setViewList("countries")}
                >
                  Countries
                </Button>
              </ButtonGroup>
            </div>

            {isLoading ? (
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

            {!isLoading && viewList == "trips" ? (
              <div>
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
                          selected={
                            location.pathname == `/nomadlist/trip/${i + 1}`
                          }
                          onClick={event => {
                            history.push("/nomadlist/trip/" + (i + 1));
                            setTripName(`${trip.place}`);
                            setShowTravelStats(true);
                          }}
                        >
                          <ListItemText
                            primary={`${trip.place} - ${
                              countryFlagEmoji.get(trip.country_code)
                                ? countryFlagEmoji.get(trip.country_code).emoji
                                : ""
                            } ${trip.country}`}
                            secondary={`${moment(trip.date_start).format(
                              "LL"
                            )}, ${trip.length}`}
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
            ) : (
              ""
            )}

            {!isLoading && viewList == "cities" ? (
              <div>
                {statistics &&
                statistics.cities &&
                !statistics.cities.length ? (
                  <div className="emptyContainer">
                    <p>No cities</p>
                  </div>
                ) : (
                  ""
                )}

                {statistics && statistics.cities && statistics.cities.length ? (
                  <List
                    className=" wrapperMobile"
                    style={{ paddingBottom: 70 }}
                    subheader={
                      <ListSubheader disableSticky component="div">
                        Your cities ({statistics.cities.length})
                      </ListSubheader>
                    }
                  >
                    {statistics.cities.map((city, i) => {
                      return (
                        <ListItem
                          button
                          key={i}
                          selected={
                            location.pathname ==
                            `/nomadlist/city/${city.place_slug}`
                          }
                          onClick={event => {
                            history.push(`/nomadlist/city/${city.place_slug}`);
                            setTripName(`${city.place}`);
                            setShowTravelStats(true);
                          }}
                        >
                          <ListItemText
                            primary={`${city.place} - ${
                              countryFlagEmoji.get(city.country_code)
                                ? countryFlagEmoji.get(city.country_code).emoji
                                : ""
                            } ${city.country}`}
                            secondary={`${city.trips.length} trips, ${city.stay} days, ${city.transactions_length} transactions`}
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
            ) : (
              ""
            )}
            {!isLoading && viewList == "countries" ? (
              <div>
                {statistics &&
                statistics.countries &&
                !statistics.countries.length ? (
                  <div className="emptyContainer">
                    <p>No countries</p>
                  </div>
                ) : (
                  ""
                )}

                {statistics &&
                statistics.countries &&
                statistics.countries.length ? (
                  <List
                    className=" wrapperMobile"
                    style={{ paddingBottom: 70 }}
                    subheader={
                      <ListSubheader disableSticky component="div">
                        Your countries ({statistics.countries.length})
                      </ListSubheader>
                    }
                  >
                    {statistics.countries.map((country, i) => {
                      return (
                        <ListItem
                          button
                          key={i}
                          selected={
                            location.pathname ==
                            `/nomadlist/country/${country.country_slug}`
                          }
                          onClick={event => {
                            history.push(
                              `/nomadlist/country/${country.country_slug}`
                            );
                            setTripName(`${country.country}`);
                            setShowTravelStats(true);
                          }}
                        >
                          <ListItemText
                            primary={`${
                              countryFlagEmoji.get(country.country_code)
                                ? countryFlagEmoji.get(country.country_code)
                                    .emoji
                                : ""
                            } ${country.country}`}
                            secondary={`${country.trips.length} trips, ${country.stay} days, ${country.transactions_length} transactions`}
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
            ) : (
              ""
            )}
          </div>
        </div>

        {location.pathname.startsWith("/nomadlist/") && (
          <div className="layout_content wrapperMobile">
            <Switch>
              <Route path={`${path}/trip/:id`}>
                <TripDetails
                  statistics={statistics}
                  isLoading={isLoading}
                  onEdit={handleEditTransaction}
                  onDuplicate={handleDuplicateTransaction}
                />
              </Route>
              <Route path={`${path}/city/:slug`}>
                <CityDetails statistics={statistics} isLoading={isLoading} />
              </Route>
              <Route path={`${path}/country/:slug`}>
                <CountryDetails statistics={statistics} isLoading={isLoading} />
              </Route>
            </Switch>
          </div>
        )}
      </div>
    </div>
  );
}
