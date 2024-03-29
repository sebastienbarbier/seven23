/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useTheme } from "@mui/material/styles";
import { useLocation, useNavigate } from "react-router-dom";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";

import Typography from "@mui/material/Typography";

import AccountBoxIcon from "@mui/icons-material/AccountBox";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import MoneyIcon from "@mui/icons-material/AttachMoney";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import CreditCard from "@mui/icons-material/CreditCard";
import DeveloperModeIcon from "@mui/icons-material/DeveloperMode";
import ImportExport from "@mui/icons-material/ImportExport";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import AvLibraryBooks from "@mui/icons-material/LibraryBooks";
import Lock from "@mui/icons-material/Lock";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import SettingsApplications from "@mui/icons-material/SettingsApplications";
import StorageIcon from "@mui/icons-material/Storage";
import StyleIcon from "@mui/icons-material/Style";

import UserActions from "../../actions/UserActions";

import package_json from "../../../../package.json";

export default function SettingsNavigation(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const theme = useTheme();

  const isDeveloper = useSelector((state) => state.app.isDeveloper);

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
      title: "Sign In / Sign Up",
      url: "/settings/login/",
      subtitle: "Sync your data to the cloud",
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

  useEffect(() => {
    setPage(
      SETTINGS[
        Object.keys(SETTINGS).find((key) =>
          location.pathname.startsWith(SETTINGS[key].url)
        )
      ]
    );
  }, [location.pathname]);

  const drawListItem = (_page) => {
    return (
      <ListItem
        button
        onClick={(event, index) => {
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
      })
      .catch(() => {
        setIsLogout(false);
      });
  };

  return (
    <div
      className={
        "wrapperMobile" +
        (props.hideMobile ? " hideMobile" : "") +
        (props.showMobile ? " showMobile" : "")
      }
    >
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
        subheader={<ListSubheader disableSticky={true}>Hosting</ListSubheader>}
      >
        {server.isLogged ? (
          <>
            {drawListItem(SETTINGS.PROFILE)}
            {drawListItem(SETTINGS.SERVER)}
            {drawListItem(SETTINGS.SECURITY)}
            {server.saas ? drawListItem(SETTINGS.SUBSCRIPTION) : ""}
            <ListItem
              button
              onClick={() => handleLogout()}
              id="cy_logout_button"
            >
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
          <>{drawListItem(SETTINGS.LOGIN)}</>
        )}
      </List>
      <List
        subheader={
          <ListSubheader disableSticky={true}>More settings</ListSubheader>
        }
      >
        {drawListItem(SETTINGS.APP)}
      </List>

      {isDeveloper && (
        <List
          subheader={
            <ListSubheader disableSticky={true}>
              Developement mode
            </ListSubheader>
          }
        >
          {drawListItem(SETTINGS.DEVELOPER)}
        </List>
      )}

      <Typography
        sx={{ opacity: 0.4, textAlign: "center", mb: 1, fontSize: "0.8em" }}
      >
        v{package_json.version}
      </Typography>
    </div>
  );
}
