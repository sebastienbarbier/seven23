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

export default function Nomadlist(props) {
  const dispatch = useDispatch();
  const { history } = useRouter();

  // Handle transactions
  const [isOpen, setIsOpen] = useState(false);
  const [component, setComponent] = useState(null);

  return (
    <div className="layout">
      <div className={"modalContent " + (isOpen ? "open" : "close")}>
        <Card square className="modalContentCard">
          {component}
        </Card>
      </div>
      <header className="layout_header">
        <div className="layout_header_top_bar showMobile">
          <h2>Nomadlist</h2>
          <div>
            <UserButton type="button" color="white" />
          </div>
        </div>
      </header>
      <div className="layout_report layout_content wrapperMobile">
        <p>Nomadlist</p>
      </div>
    </div>
  );
}
