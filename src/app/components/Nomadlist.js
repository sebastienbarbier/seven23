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
  Routes,
  useParams,
  useLocation,
  useNavigate
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";

import List from "@mui/material/List";
import ListSubheader from "@mui/material/ListSubheader";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";

import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";

import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LoopIcon from "@mui/icons-material/Loop";
import Tooltip from "@mui/material/Tooltip";

import TransactionForm from "./transactions/TransactionForm";

import TripDetails from "./nomadlist/TripDetails";
import CityDetails from "./nomadlist/CityDetails";
import CountryDetails from "./nomadlist/CountryDetails";

import StatisticsActions from "../actions/StatisticsActions";
import UserActions from "../actions/UserActions";
import AppActions from "../actions/AppActions";

import useRouteTitle from "../hooks/useRouteTitle";

export default function Nomadlist(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  let location = useLocation();
  let path = location.pathname;

  const titleObject = useRouteTitle();
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
    if (tripName) {
      dispatch(AppActions.setNavBar(`${tripName}`, titleObject.back));
    }
  }, [location]);

  useEffect(() => {
    if (!statistics || (!isSyncing && nomadlist && account)) {
      setIsLoading(Boolean(!statistics));
      let excluseCategories = [];
      if (account.preferences && account.preferences.nomadlist) {
        excluseCategories = account.preferences.nomadlist;
      }
      dispatch(StatisticsActions.nomadlist(null, excluseCategories))
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
          setIsLoading(false);
        })
        .catch(exception => {
          console.error(exception);
        });
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
      navigate("/nomadlist/trip/" + (i + 1));
    } else {
      navigate("/nomadlist");
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
      <div className="layout_two_columns">
        <div
          className={
            (selectedTrip != null || showTravelStats ? "hide " : "") +
            "layout_noscroll"
          }
        >
          <div className="layout_content wrapperMobile mobile_footer_padding">
            <div style={{ postion: "relative" }}>
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
              <div className="stickyHeader">
                <ButtonGroup
                  disabled={isLoading}
                  color="primary"
                  size="small"
                  aria-label="small outlined button group"
                >
                  <Button
                    variant={
                      !isLoading && viewList == "trips"
                        ? "contained"
                        : "outlined"
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
                              navigate("/nomadlist/trip/" + (i + 1));
                              setTripName(`${trip.place}`);
                              setShowTravelStats(true);
                            }}
                          >
                            <ListItemText
                              primary={`${trip.place} - ${
                                countryFlagEmoji.get(trip.country_code)
                                  ? countryFlagEmoji.get(trip.country_code)
                                      .emoji
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

                  {statistics &&
                  statistics.cities &&
                  statistics.cities.length ? (
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
                            disabled={!city.place_slug}
                            selected={
                              location.pathname ==
                              `/nomadlist/city/${city.place_slug}`
                            }
                            onClick={event => {
                              navigate(
                                `/nomadlist/city/${city.place_slug}`
                              );
                              setTripName(`${city.place}`);
                              setShowTravelStats(true);
                            }}
                          >
                            <ListItemText
                              primary={`${city.place} - ${
                                countryFlagEmoji.get(city.country_code)
                                  ? countryFlagEmoji.get(city.country_code)
                                      .emoji
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
                              navigate(
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
        </div>

        {location.pathname.startsWith("/nomadlist/") && (
          <div className="layout_content wrapperMobile mobile_footer_padding">
            <Routes>
              <Route path={`/trip/:id`} element={
                <TripDetails
                  statistics={statistics}
                  isLoading={isLoading}
                  setTitle={setTripName}
                  onEdit={handleEditTransaction}
                  onDuplicate={handleDuplicateTransaction}
                />}>
              </Route>
              <Route path={`/city/:slug`} element={
                <CityDetails
                  statistics={statistics}
                  isLoading={isLoading}
                  setTitle={setTripName}
                />}>
              </Route>
              <Route path={`/country/:slug`} element={
                <CountryDetails
                  statistics={statistics}
                  isLoading={isLoading}
                  setTitle={setTripName}
                />}>
              </Route>
            </Routes>
          </div>
        )}
      </div>
    </div>
  );
}