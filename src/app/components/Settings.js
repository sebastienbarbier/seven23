/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import PropTypes from "prop-types";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { useTheme } from '@mui/material/styles';

import Card from "@mui/material/Card";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";

import IconButton from "@mui/material/IconButton";

import Typography from "@mui/material/Typography";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import HelpIcon from "@mui/icons-material/HelpOutline";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import MoneyIcon from "@mui/icons-material/AttachMoney";
import CreditCard from "@mui/icons-material/CreditCard";
import StorageIcon from "@mui/icons-material/Storage";
import AvLibraryBooks from "@mui/icons-material/LibraryBooks";
import SettingsApplications from "@mui/icons-material/SettingsApplications";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import Lock from "@mui/icons-material/Lock";
import ImportExport from "@mui/icons-material/ImportExport";
import StyleIcon from "@mui/icons-material/Style";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';

import SettingsNavigation from "./settings/SettingsNavigation";

import AccountsSettings from "./settings/AccountsSettings";
import ProfileSettings from "./settings/ProfileSettings";
import HelpSettings from "./settings/HelpSettings";
import ServerSettings from "./settings/ServerSettings";
import AppSettings from "./settings/AppSettings";
import SecuritySettings from "./settings/SecuritySettings";
import ImportExportSettings from "./settings/ImportExportSettings";
import ThemeSettings from "./settings/ThemeSettings";
import SubscriptionSettings from "./settings/SubscriptionSettings";
import SocialNetworksSettings from "./settings/SocialNetworksSettings";

import UserButton from "./settings/UserButton";

import UserActions from "../actions/UserActions";

import package_json from "../../../package.json";

export default function Settings(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const theme = useTheme();

  const isDeveloper = useSelector(state => state.app.isDeveloper);

  const server = useSelector((state) => state.server);

  const [isLogout, setIsLogout] = useState(false);


  const handleLogout = () => {
    setIsLogout(true);
    navigate("/settings");
    dispatch(UserActions.logout())
      .then(() => {
        setIsLogout(false);
        navigate("/");
      }).catch(() => {
        setIsLogout(false);
      });
  };

  return (
    <div className="layout">

      <div className="layout_two_columns">
        <div className="hideMobile">
          <SettingsNavigation />
        </div>
        <div className="layout_noscroll">
          <Outlet>
            <SettingsNavigation />
          </Outlet>
        </div>

        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={isLogout}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </div>
    </div>
  );
}