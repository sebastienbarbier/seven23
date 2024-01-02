/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";

import ChangeForm from "./changes/ChangeForm";
import LineGraph from "./charts/LineGraph";

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
  const changes = useSelector((state) => state.changes);
  //
  const [list, setList] = useState(null);

  const selectedCurrency = useSelector((state) =>
    state.currencies.find((c) => c.id == params.id)
  );

  const accountCurrencyId = useSelector((state) => state.account.currency);

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
      dispatch(
        AppActions.setFloatingAddButton(() => handleOpenChange(), !!changes)
      );
      dispatch(
        ChangeActions.process(selectedCurrency ? selectedCurrency.id : null)
      )
        .then((result) => {
          setGraph(result.graph);
          setUsedCurrencies(result.usedCurrency);
          setList(result.list);
        })
        .catch(() => {});
    }
  }, [changes, params.id]);

  const handleOpenChange = (change = null) => {
    dispatch(
      AppActions.openModal(
        <ChangeForm
          currency={selectedCurrency}
          change={change}
          onSubmit={() => dispatch(AppActions.closeModal())}
          onClose={() => dispatch(AppActions.closeModal())}
        />
      )
    );
  };

  const handleDuplicateChange = (change) => {
    const newChange = Object.assign({}, change);
    delete newChange.id;
    delete newChange.date;
    handleOpenChange(newChange);
  };

  return (
    <LayoutSideListPanel
      transparentRightPanel
      sidePanel={
        <div className={(selectedCurrency ? "hide " : "") + "wrapperMobile"}>
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
                "w120",
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
            <List
              sx={{ pt: { xs: 1, md: 0 } }}
              subheader={
                <ListSubheader disableSticky={true}>
                  Currencies ({usedCurrencies.length})
                </ListSubheader>
              }
            >
              {usedCurrencies && graph
                ? usedCurrencies.map((currency) => {
                    return (
                      <ListItem
                        button
                        key={currency.id}
                        selected={params.id == currency.id}
                        disabled={!list}
                        style={{ position: "relative" }}
                        onClick={(event) => {
                          if (list != null && currency.id != params.id) {
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
                            opacity: 0.5,
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
      }
    ></LayoutSideListPanel>
  );
}
