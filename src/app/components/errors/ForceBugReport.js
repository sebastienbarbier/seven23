import React, { useEffect } from "react";
import moment from "moment";
import { useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom';

import List from "@mui/material/List";
import ListSubheader from "@mui/material/ListSubheader";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import Divider from "@mui/material/Divider";
import RefreshIcon from "@mui/icons-material/Refresh";
import ExitToApp from "@mui/icons-material/ExitToApp";
import DeleteForever from "@mui/icons-material/DeleteForever";
import BugReportIcon from "@mui/icons-material/BugReport";
import ReportIcon from '@mui/icons-material/Report';

import UserActions from "../../actions/UserActions";
import AppActions from "../../actions/AppActions";

export default function ForceBugReport() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const show_bug_report = () => {
    let test = useState(false);
  }

  return (
    <div
      className="layout_content wrapperMobile"
      subheader={
        <ListSubheader disableSticky={true}>Authentication</ListSubheader>
      }
    >
        { test ? <TEST /> : null }
    </div>
  );
}