/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

import Container from "@mui/material/Container";
import Button from "@mui/material/Button";

import AccountActions from "../../../actions/AccountsActions";
import ModalLayoutComponent from "../../layout/ModalLayoutComponent";

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
    <ModalLayoutComponent
      title={'Account'}
      isLoading={loading}
      content={<>
        <Container>
          <p>
            You are about to delete the account <strong>{ account.name }</strong>. All informations will be
            permanently lost.
          </p>
        </Container>
      </>}
      footer={<>
        <Button color='inherit' onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          disableElevation
          style={{ marginLeft: "8px" }}
          onClick={onDelete}
        >
          Delete this account
        </Button>
      </>}
    />
  );
}