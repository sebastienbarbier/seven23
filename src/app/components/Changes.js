/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import Card from "@material-ui/core/Card";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";

import UserButton from "./settings/UserButton";
import Fab from "@material-ui/core/Fab";

import IconButton from "@material-ui/core/IconButton";
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";

import ContentAdd from "@material-ui/icons/Add";

import LineGraph from "./charts/LineGraph";
import ChangeForm from "./changes/ChangeForm";
import ChangeList from "./changes/ChangeList";

import ChangeActions from "../actions/ChangeActions";

export default function Changes(props) {
  const dispatch = useDispatch();

  // Is component panel open ?
  const [isOpen, setIsOpen] = useState(false);
  // Component to display on popup menu
  const [component, setComponent] = useState(null);

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
    state.currencies.find(c => c.id == props.match.params.id)
  );

  const accountCurrencyId = useSelector(state => state.account.currency);

  useEffect(() => {
    if (props.match.params.id == accountCurrencyId) {
      props.history.push("/changes");
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
  }, [changes, props.match.params.id]);

  const handleOpenChange = (change = null) => {
    const component = (
      <ChangeForm
        currency={selectedCurrency}
        change={change}
        onSubmit={() => setIsOpen(false)}
        onClose={() => setIsOpen(false)}
      />
    );
    setComponent(component);
    setIsOpen(true);
  };

  const handleDuplicateChange = change => {
    const newChange = Object.assign({}, change);
    delete newChange.id;
    delete newChange.date;
    handleOpenChange(newChange);
  };

  return (
    <div className="layout">
      <div className={"modalContent " + (isOpen ? "open" : "")}>
        <Card square className="modalContentCard">
          {component}
        </Card>
      </div>

      <header className="layout_header showMobile">
        <div className="layout_header_top_bar">
          <div
            className={
              (!selectedCurrency ? "show " : "") + "layout_header_top_bar_title"
            }
          >
            <h2>Changes</h2>
          </div>
          <div
            className={
              (selectedCurrency ? "show " : "") + "layout_header_top_bar_title"
            }
            style={{ right: 80 }}
          >
            <IconButton onClick={() => props.history.push("/changes")}>
              <KeyboardArrowLeft style={{ color: "white" }} />
            </IconButton>
            <h2 style={{ paddingLeft: 4 }}>{currencyTitle}</h2>
          </div>
          <div className="showMobile">
            <UserButton type="button" color="white" />
          </div>
        </div>
      </header>

      <div className="layout_two_columns">
        <div
          className={
            (selectedCurrency ? "hide " : "") +
            "layout_content wrapperMobile large"
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
                        selected={props.match.params.id == currency.id}
                        disabled={!list}
                        style={{ position: "relative" }}
                        onClick={event => {
                          if (
                            list != null &&
                            currency.id != props.match.params.id
                          ) {
                            setList();
                            props.history.push("/changes/" + currency.id);
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

        {selectedCurrency ? (
          <div className="layout_content wrapperMobile">
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
      </div>

      <Fab
        color="primary"
        aria-label="Add"
        className="layout_fab_button show"
        disabled={!usedCurrencies}
        onClick={() => handleOpenChange()}
      >
        <ContentAdd />
      </Fab>
    </div>
  );
}
