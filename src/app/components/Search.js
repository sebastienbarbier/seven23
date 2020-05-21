/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "../router";

import Card from "@material-ui/core/Card";
import TextField from "@material-ui/core/TextField";

import StatisticsActions from "../actions/StatisticsActions";
import TransactionTable from "./transactions/TransactionTable";

import UserButton from "./settings/UserButton";
import TransactionForm from "./transactions/TransactionForm";

let timer = null; // Store timeout to avoid search between each caracters
const DELAY_TYPE_TO_SEARCH = 500;

export default function Search(props) {
  const dispatch = useDispatch();
  const { history } = useRouter();
  const [text, setText] = useState("");

  const [statistics, setStatistics] = useState(null);
  const [error, setError] = useState({});
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

  // Perform search if transaction list change (to refresh on delete event for exemple)
  const reduxTransaction = useSelector((state) => state.transactions);

  useEffect(() => {
    if (reduxTransaction) {
      setSearch(text);
    } else {
      setStatistics(null);
    }
  }, [reduxTransaction]);

  // Handle transactions
  const [isOpen, setIsOpen] = useState(false);
  const [component, setComponent] = useState(null);

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
      <header className="layout_header">
        <div className="layout_header_top_bar showMobile">
          <h2>Search</h2>
          <div>
            <UserButton type="button" color="white" />
          </div>
        </div>
        <form
          className="layout_header_date_range wrapperMobile"
          onSubmit={(event) => event.preventDefault()}
        >
          <TextField
            label="Search"
            error={Boolean(error.text)}
            helperText={error.text}
            onChange={(event) => setSearch(event.target.value)}
            value={text}
            fullWidth
            autoFocus={true}
            margin="normal"
          />
        </form>
      </header>
      <div className="layout_report layout_content wrapperMobile">
        {statistics || isLoading ? (
          <div style={{ maxWidth: 750 }}>
            <TransactionTable
              transactions={statistics ? statistics.transactions : []}
              isLoading={isLoading}
              onEdit={handleEditTransaction}
              onDuplicate={handleDuplicateTransaction}
              pagination="40"
              dateFormat="DD MMM YY"
            />
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
