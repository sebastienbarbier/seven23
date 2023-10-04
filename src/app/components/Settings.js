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

import AccountsSettings from "./settings/AccountsSettings";
import ProfileSettings from "./settings/ProfileSettings";
import HelpSettings from "./settings/HelpSettings";
import ServerSettings from "./settings/ServerSettings";
import AppSettings from "./settings/AppSettings";
import SecuritySettings from "./settings/SecuritySettings";
import CurrenciesSettings from "./settings/CurrenciesSettings";
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

  const SETTINGS = {
    PROFILE: {
      title: "User profile",
      url: "/settings/profile/",
      subtitle: "Configure your data",
      icon: <AccountBoxIcon />,
    },
    ACCOUNTS: {
      title: "Accounts",
      url: "/settings/accounts/",
      subtitle: "Manage yours accounts",
      icon: <AvLibraryBooks />,
    },
    CURRENCIES: {
      title: "Currencies",
      url: "/settings/currencies/",
      subtitle: "Select currencies to show",
      icon: <MoneyIcon />,
    },
    LOGIN: {
      title: "Log in / Sign up",
      url: "/settings/login/",
      subtitle: "Connect and sync to the cloud",
      icon: <CloudQueueIcon />,
    },
    SERVER: {
      title: "Server/Sync",
      url: "/settings/server/",
      subtitle: "Details about your hosting",
      icon: <StorageIcon />,
    },
    SECURITY: {
      title: "Security",
      url: "/settings/security/",
      subtitle: "Encryption key",
      icon: <Lock />,
    },
    SUBSCRIPTION: {
      title: "Subscription",
      url: "/settings/subscription/",
      subtitle: "Payment, invoice, and extend",
      icon: <CreditCard />,
    },
    IMPORT_EXPORT: {
      title: "Import / Export",
      url: "/settings/import/export/",
      subtitle: "Backup and restore your data",
      icon: <ImportExport />,
    },
    SOCIAL_NETWORKS: {
      title: "Social networks",
      url: "/settings/social/",
      subtitle: "Connect your accounts",
      icon: <AccountTreeIcon />,
    },
    THEME: {
      title: "Theme",
      url: "/settings/theme/",
      subtitle: "Light or dark mode",
      icon: <StyleIcon />,
    },
    APP: {
      title: "About the App",
      url: "/settings/application/",
      subtitle: "Version, force refresh",
      icon: <SettingsApplications />,
    },
    DEVELOPER: {
      title: "Dev tools",
      url: "/settings/development/",
      subtitle: "For testing and debugging",
      icon: <DeveloperModeIcon />,
    },
    HELP: {
      title: "Help / Support",
      url: "/settings/help/",
      subtitle: "Issues or questions",
      icon: <HelpIcon />,
    },
  };

  const server = useSelector((state) => state.server);

  const [page, setPage] = useState(
    SETTINGS[
      Object.keys(SETTINGS).find((key) =>
        location.pathname.startsWith(SETTINGS[key].url)
      )
    ]
  );
  const [isLogout, setIsLogout] = useState(false);
  const [pageTitle, setPageTitle] = useState(page ? page.title : "");

  useEffect(() => {
    if (page) {
      setPageTitle(page.title);
    }
  }, [page]);

  const drawListItem = (_page) => {
    return (
      <ListItem
        button
        onClick={(event, index) => {
          setPage(_page);
          navigate(_page.url);
        }}
        selected={page && _page && page.url.startsWith(_page.url)}
      >
        <ListItemIcon>{_page.icon}</ListItemIcon>
        <ListItemText
          primary={_page ? _page.title : ""}
          secondary={_page ? _page.subtitle : ""}
        />
        <KeyboardArrowRight />
      </ListItem>
    );
  };

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
      <header className="layout_header showMobile">
        <div className="layout_header_top_bar">
          <div
            className={(!page ? "show " : "") + "layout_header_top_bar_title"}
          >
            <h2>Settings</h2>
          </div>
          <div
            className={(page ? "show " : "") + "layout_header_top_bar_title"}
            style={{ right: 80 }}
          >
            <IconButton
              onClick={() => {
                setPage(null);
                navigate("/settings");
              }}
              size="large">
              <KeyboardArrowLeft style={{ color: "white" }} />
            </IconButton>
            <h2 style={{ paddingLeft: 4 }}>{pageTitle}</h2>
          </div>
          <div className="showMobile">
            <UserButton type="button" color="white" onModal={props.onModal} />
          </div>
        </div>
      </header>

      <div className="layout_two_columns">
        <div className={(page ? "hide " : "") + "layout_content wrapperMobile"}>
          <List
            subheader={
              <ListSubheader disableSticky={true}>Your account</ListSubheader>
            }
          >
            {drawListItem(SETTINGS.ACCOUNTS)}
            {drawListItem(SETTINGS.IMPORT_EXPORT)}
            {drawListItem(SETTINGS.THEME)}
            {drawListItem(SETTINGS.SOCIAL_NETWORKS)}
          </List>

          <List
              subheader={
                <ListSubheader disableSticky={true}>Hosting</ListSubheader>
              }
            >
          {server.isLogged ? (
            <>
              {drawListItem(SETTINGS.PROFILE)}
              {drawListItem(SETTINGS.SERVER)}
              {drawListItem(SETTINGS.SECURITY)}
              {server.saas ? drawListItem(SETTINGS.SUBSCRIPTION) : ""}
              <ListItem button onClick={() => handleLogout()} id="cy_logout_button">
                <ListItemIcon>
                  <PowerSettingsNewIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Logout"
                  secondary={`Disconnect from ${server.name}`}
                />
              </ListItem>
            </>
          ) : (
            <>
              {drawListItem(SETTINGS.LOGIN)}
            </>
          )}
          </List>
          <List
            subheader={
              <ListSubheader disableSticky={true}>More settings</ListSubheader>
            }
          >
            {drawListItem(SETTINGS.APP)}
            {drawListItem(SETTINGS.HELP)}
          </List>


          { isDeveloper && <List
            subheader={
              <ListSubheader disableSticky={true}>Developement mode</ListSubheader>
            }
          >
            { drawListItem(SETTINGS.DEVELOPER) }

          </List>}

          <Typography sx={{ opacity: 0.4, textAlign: 'center',  mb: 1, fontSize: '0.8em' }}>v{package_json.version}</Typography>
        </div>

        <div className="layout_noscroll">
          <Outlet />
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