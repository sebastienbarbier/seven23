/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import Card from "@mui/material/Card";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";

import IconButton from "@mui/material/IconButton";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";

import ContentAdd from "@mui/icons-material/Add";

import LineGraph from "./charts/LineGraph";
import ChangeForm from "./changes/ChangeForm";
import ChangeList from "./changes/ChangeList";

import AppActions from "../actions/AppActions";
import ChangeActions from "../actions/ChangeActions";

import useRouteTitle from "../hooks/useRouteTitle";

import LayoutSideListPanel from "./layout/LayoutSideListPanel";

export default function Changes(props) {
  const dispatch = useDispatch();
  const params = useParams();
  const navigate = useNavigate();

  const location = useLocation();
  const titleObject = useRouteTitle();

  // All used currencies
  const [currencies, setCurrencies] = useState(null);

  // Selected currency based on props.params.id
  const [currencyTitle, setCurrencyTitle] = useState(null);
  //
  const [graph, setGraph] = useState(null);

  const [usedCurrencies, setUsedCurrencies] = useState(null);
  //
  const changes = useSelector(state => state.changes);
  //
  const [list, setList] = useState(null);

  const selectedCurrency = useSelector(state =>
    state.currencies.find(c => c.id == params.id)
  );

  const accountCurrencyId = useSelector(state => state.account.currency);

  useEffect(() => {
    if (params.id == accountCurrencyId) {
      navigate("/changes");
    }
  }, [accountCurrencyId]);

  // When changes is udpated
  useEffect(() => {
    if (!changes) {
      setGraph(null);
      setUsedCurrencies(null);
      setList(null);
    } else {
      setCurrencyTitle(selectedCurrency ? selectedCurrency.name : "");
      dispatch(AppActions.setFloatingAddButton(() => handleOpenChange(), !!changes));
      dispatch(
        ChangeActions.process(selectedCurrency ? selectedCurrency.id : null)
      )
        .then(result => {
          setGraph(result.graph);
          setUsedCurrencies(result.usedCurrency);
          setList(result.list);
        })
        .catch(() => {});
    }
  }, [changes, params.id]);

  useEffect(() => {
    if (selectedCurrency) {
      dispatch(AppActions.setNavBar(`${selectedCurrency.name}`, titleObject.back));
    }
  }, [location]);

  const handleOpenChange = (change = null) => {
    dispatch(AppActions.openModal(<ChangeForm
      currency={selectedCurrency}
      change={change}
      onSubmit={() => dispatch(AppActions.closeModal())}
      onClose={() => dispatch(AppActions.closeModal())}
    />))
  };

  const handleDuplicateChange = change => {
    const newChange = Object.assign({}, change);
    delete newChange.id;
    delete newChange.date;
    handleOpenChange(newChange);
  };

  return (
    <LayoutSideListPanel
      sidePanel={
        <div
          className={
            (selectedCurrency ? "hide " : "") +
            "wrapperMobile mobile_footer_padding"
          }
        >
          {usedCurrencies && !usedCurrencies.length ? (
            <div className="emptyContainer">
              <p>No changes</p>
            </div>
          ) : (
            ""
          )}

          {!usedCurrencies
            ? [
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
              })
            : ""}

          {usedCurrencies && usedCurrencies.length ? (
            <List>
              {usedCurrencies && graph
                ? usedCurrencies.map(currency => {
                    return (
                      <ListItem
                        button
                        key={currency.id}
                        selected={params.id == currency.id}
                        disabled={!list}
                        style={{ position: "relative" }}
                        onClick={event => {
                          if (
                            list != null &&
                            currency.id != params.id
                          ) {
                            setList();
                            navigate("/changes/" + currency.id);
                          }
                        }}
                      >
                        <ListItemText
                          primary={currency.name}
                          secondary={currency.code}
                        />
                        <div
                          style={{
                            position: "absolute",
                            width: 100,
                            right: 60,
                            top: 0,
                            bottom: 0,
                            opacity: 0.5
                          }}
                        >
                          <LineGraph
                            values={[{ values: graph[currency.id] }]}
                          />
                        </div>
                        <KeyboardArrowRight />
                      </ListItem>
                    );
                  })
                : ""}
            </List>
          ) : (
            ""
          )}
        </div>
      }>
      {/*<div className="layout_two_columns">
        {selectedCurrency ? (
          <div className="layout_content wrapperMobile mobile_footer_padding">
            <h1 className="hideMobile" style={{ padding: "18px 30px 0" }}>
              {selectedCurrency.name}
            </h1>
            <ChangeList
              changes={list || []}
              currency={selectedCurrency}
              currencies={usedCurrencies}
              isLoading={!list}
              onEditChange={handleOpenChange}
              onDuplicateChange={handleDuplicateChange}
              onDeleteChange={change => {
                dispatch(ChangeActions.delete(change));
              }}
            />
          </div>
        ) : (
          ""
        )}
      </div>*/}
    </LayoutSideListPanel>
  );
}