/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";

import StatisticsActions from "../actions/StatisticsActions";
import TransactionTable from "./transactions/TransactionTable";

import TransactionForm from "./transactions/TransactionForm";

import LayoutFullWidth from "./layout/LayoutFullWidth";
import AppActions from "../actions/AppActions";
import InputBase from "@mui/material/InputBase";
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import IconButton from "@mui/material/IconButton";

let timer = null; // Store timeout to avoid search between each caracters
const DELAY_TYPE_TO_SEARCH = 500;


import SearchIcon from "@mui/icons-material/Search";

import './Search.scss';

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

  // Handle transactions
  const handleEditTransaction = (transaction = {}) => {
    dispatch(AppActions.openModal(<TransactionForm
      transaction={transaction}
      onSubmit={() => dispatch(AppActions.closeModal())}
      onClose={() => dispatch(AppActions.closeModal())}
    />))
  };

  const handleDuplicateTransaction = (transaction = {}) => {
    const newTransaction = Object.assign({}, transaction);
    delete newTransaction.id;
    delete newTransaction.date;
    handleEditTransaction(newTransaction);
  };

  return (
    <LayoutFullWidth className="search">
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
          <IconButton onClick={(event) => setSearch('')} size="large" className={`resetSearch ${text ? 'show' : ''}`}>
            <HighlightOffIcon color="action" />
          </IconButton>
        </div>
      </header>
      <div style={{ position: 'relative' }}>
        { (statistics || isLoading) ?
          <div style={{ maxWidth: 750 }}>
            <TransactionTable
              transactions={statistics ? statistics.transactions : []}
              isLoading={isLoading}
              onEdit={handleEditTransaction}
              onDuplicate={handleDuplicateTransaction}
              pagination="40"
              dateFormat="DD MMM YY"
            />
          </div> : <div className="placeholder"></div> }

      </div>
    </LayoutFullWidth>
  );
}