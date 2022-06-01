/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

import Button from "@mui/material/Button";

import AccountActions from "../../../actions/AccountsActions";

export default function AccountDeleteForm({ account, onSubmit, onClose }) {
  const dispatch = useDispatch();

  const accounts = useSelector(state => state.accounts.remote);

  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);

  const onDelete = e => {
    if (e) {
      e.preventDefault();
    }

    dispatch(AccountActions.delete(account))
      .then(() => {
        onSubmit();
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
      });
  };

  return (
    <form onSubmit={onDelete} className="content">
      <header>
        <h2 style={{ color: "white" }}>Account</h2>
      </header>
      {loading ? <LinearProgress mode="indeterminate" /> : ""}

      <div className="form">
        <p>
          You are about to delete this account. All informations will be
          permanently lost.
        </p>
      </div>

      <footer>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          style={{ marginLeft: "8px" }}
          onClick={onDelete}
        >
          Delete this account
        </Button>
      </footer>
    </form>
  );
}
