/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Box from "@mui/material/Box";

import StatisticsActions from "../actions/StatisticsActions";
import TransactionList from "./transactions/TransactionList";

import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import LayoutFullWidth from "./layout/LayoutFullWidth";

let timer = null; // Store timeout to avoid search between each caracters
const DELAY_TYPE_TO_SEARCH = 500;

import SearchIcon from "@mui/icons-material/Search";

import "./Search.scss";

export default function Search(props) {
  const dispatch = useDispatch();
  const [text, setText] = useState("");

  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [categories] = useSelector((state) => state.categories.list);

  // Trigger on typing
  const setSearch = (text) => {
    setText(text);
    if (!text) {
      setStatistics(null);
      setIsLoading(false);
    } else {
      setIsLoading(true);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        dispatch(StatisticsActions.search(text))
          .then((result) => {
            setIsLoading(false);
            setStatistics(result);
          })
          .catch((error) => {
            if (error) {
              console.error(error);
            }
          });
      }, DELAY_TYPE_TO_SEARCH);
    }
  };

  // This selector listen to changes on transaciton list (eg. receiving new transactions from sync)
  const reduxTransaction = useSelector((state) => state.transactions);

  useEffect(() => {
    if (reduxTransaction) {
      setSearch(text);
    } else {
      setStatistics(null);
    }
  }, [reduxTransaction]);

  return (
    <LayoutFullWidth>
      <Box className="search">
        <header>
          <div className="searchInput">
            <SearchIcon color="action" />
            <InputBase
              placeholder="Search"
              fullWidth
              value={text}
              autoFocus={true}
              onChange={(event) => setSearch(event.target.value)}
              style={{ margin: "2px 10px 0 10px" }}
            />
            <IconButton
              onClick={(event) => setSearch("")}
              size="large"
              className={`resetSearch ${text ? "show" : ""}`}
            >
              <HighlightOffIcon color="action" />
            </IconButton>
          </div>
        </header>
        <div style={{ position: "relative" }}>
          {statistics || isLoading ? (
            <div style={{ maxWidth: 750 }}>
              <TransactionList
                transactions={statistics ? statistics.transactions : []}
                isLoading={isLoading}
                pagination="40"
                dateFormat="DD MMM YY"
              />
            </div>
          ) : (
            <div className="placeholder"></div>
          )}
        </div>
      </Box>
    </LayoutFullWidth>
  );
}
