import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function GuardIsDeveloper ({ children }) {

  const isDeveloper = useSelector(state => state.app.isDeveloper);

  if (isDeveloper) {
    return children;
  } else {
    return <Navigate to="/" />
  }
};