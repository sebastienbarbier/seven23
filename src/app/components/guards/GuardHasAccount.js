import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function GuardHasAccount ({ children }) {

  const hasAccount = useSelector(
    (state) => (state.accounts.remote.length + state.accounts.local.length) >= 1
  );

  if (hasAccount) {
    return children;
  } else {
    return <Navigate to="/" />
  }
};