/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";

import IconButton from "@mui/material/IconButton";
import InsertChartOutlined from "@mui/icons-material/InsertChartOutlined";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import ListIcon from "@mui/icons-material/List";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LanguageIcon from "@mui/icons-material/Language";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
import Tooltip from "@mui/material/Tooltip";
import SearchIcon from "@mui/icons-material/Search";
import MapIcon from "@mui/icons-material/Map";

import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItem from "@mui/material/ListItem";

import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Popover from "@mui/material/Popover";

const styles = {
  separator: {
    margin: "0px 8px",
  },
  iconButton: {
    width: 55,
    height: 55,
    display: "flex",
    justifyContent: "center",
  },
  icon: {
    width: 25,
    height: 25,
  },
  drawer: {
    paddingTop: 20,
  },
  selected: {
    background: "rgba(0, 0, 0, 0.2)",
  },
};

export default function Navigation(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

  const [valueMobile, setValueMobile] = useState("dashboard");
  const [valueDesktop, setValueDesktop] = useState("dashboard");
  const [open, setOpen] = useState(false);

  const hasNomadlist = useSelector((state) =>
    Boolean(
      state.user.socialNetworks &&
        state.user.socialNetworks.nomadlist &&
        state.user.socialNetworks.nomadlist.username
    )
  );

  const accounts = useSelector((state) => [
    ...state.accounts.remote,
    ...state.accounts.local,
  ]);
  const id = open ? "footer-more-Popover" : null;

  const listennerLocation = (location) => {
    if (
      location.pathname == "/" ||
      location.pathname.startsWith("/dashboard")
    ) {
      setValueMobile("dashboard");
      setValueDesktop("dashboard");
    } else if (location.pathname.startsWith("/transactions")) {
      setValueMobile("transactions");
      setValueDesktop("transactions");
    } else if (location.pathname.startsWith("/categories")) {
      setValueMobile("categories");
      setValueDesktop("categories");
    } else {
      setValueMobile("more");
      if (location.pathname.startsWith("/changes")) {
        setValueDesktop("changes");
      } else if (location.pathname.startsWith("/report")) {
        setValueDesktop("viewer");
      } else if (location.pathname.startsWith("/search")) {
        setValueDesktop("search");
      } else if (location.pathname.startsWith("/convertor")) {
        setValueDesktop("convertor");
      } else if (location.pathname.startsWith("/nomadlist")) {
        setValueDesktop("nomadlist");
      } else {
        setValueDesktop("more");
      }
    }
    setOpen(false);
  };

  useEffect(() => {
    listennerLocation(location);
  }, [location]);

  const handleChange = (event, value) => {
    if (["dashboard", "transactions", "categories"].indexOf(value) >= 0) {
      navigate(`/${value}`, { replace: true });
    } else if (value === "more") {
      const { currentTarget } = event;

      setAnchorEl(currentTarget);
      setOpen(!open);
    }
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
    setOpen(false);
  };

  return (
    <div id="menu">
      <nav>
        <List
          style={{
            padding: "24px 0px 2px 0px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Link
            to={"/dashboard"}
            style={valueDesktop == "dashboard" ? styles.selected : {}}
          >
            <Tooltip title="Dashboard" enterDelay={450} placement="right">
              <IconButton style={styles.iconButton} size="large">
                <DashboardIcon style={{ color: "white" }} />
              </IconButton>
            </Tooltip>
          </Link>
          <Link
            to={"/transactions"}
            style={valueDesktop == "transactions" ? styles.selected : {}}
          >
            <Tooltip title="Transactions" enterDelay={450} placement="right">
              <IconButton style={styles.iconButton} size="large">
                <ListIcon style={{ color: "white" }} />
              </IconButton>
            </Tooltip>
          </Link>
          <Link
            to="/categories"
            style={valueDesktop == "categories" ? styles.selected : {}}
          >
            <Tooltip title="Categories" enterDelay={450} placement="right">
              <IconButton style={styles.iconButton} size="large">
                <LocalOfferIcon style={{ color: "white" }} />
              </IconButton>
            </Tooltip>
          </Link>
          <Link
            to="/changes"
            style={valueDesktop == "changes" ? styles.selected : {}}
          >
            <Tooltip title="Changes" enterDelay={450} placement="right">
              <IconButton style={styles.iconButton} size="large">
                <SwapHorizIcon style={{ color: "white" }} />
              </IconButton>
            </Tooltip>
          </Link>
          <Link
            to={"/report"}
            style={valueDesktop == "viewer" ? styles.selected : {}}
          >
            <Tooltip title="Report" enterDelay={450} placement="right">
              <IconButton style={styles.iconButton} size="large">
                <InsertChartOutlined style={{ color: "white" }} />
              </IconButton>
            </Tooltip>
          </Link>
          {hasNomadlist && (
            <Link
              to={"/nomadlist"}
              style={valueDesktop == "nomadlist" ? styles.selected : {}}
            >
              <Tooltip title="Nomadlist" enterDelay={450} placement="right">
                <IconButton style={styles.iconButton} size="large">
                  <MapIcon style={{ color: "white" }} />
                </IconButton>
              </Tooltip>
            </Link>
          )}
          <Link
            to={"/convertor"}
            style={valueDesktop == "convertor" ? styles.selected : {}}
          >
            <Tooltip title="Convertor" enterDelay={450} placement="right">
              <IconButton style={styles.iconButton} size="large">
                <LanguageIcon style={{ color: "white" }} />
              </IconButton>
            </Tooltip>
          </Link>
          <Link
            to={"/search"}
            style={valueDesktop == "search" ? styles.selected : {}}
          >
            <Tooltip title="Search" enterDelay={450} placement="right">
              <IconButton style={styles.iconButton} size="large">
                <SearchIcon style={{ color: "white" }} />
              </IconButton>
            </Tooltip>
          </Link>
        </List>
      </nav>

      {/*
        Mobile View with Material BottomNavigation component instead of custom Nav
      */}
      <footer className="showMobile">
        {accounts.length >= 1 ? <div></div> : ""}
        <BottomNavigation value={valueMobile} onChange={handleChange}>
          <BottomNavigationAction
            showLabel={true}
            label="Dashboard"
            value="dashboard"
            icon={<DashboardIcon />}
          />
          <BottomNavigationAction
            showLabel={true}
            label="Transactions"
            value="transactions"
            icon={<ListIcon />}
          />
          <BottomNavigationAction
            showLabel={true}
            label="Categories"
            value="categories"
            icon={<LocalOfferIcon />}
          />
          <BottomNavigationAction
            showLabel={true}
            label="More"
            value="more"
            icon={<MoreHoriz />}
          />
        </BottomNavigation>
        <Popover
          id={id}
          open={open}
          onClose={handleClosePopover}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
        >
          <List style={{ padding: 0, margin: 0 }}>
            <Link to="/search">
              <ListItem button>
                <ListItemIcon>
                  <SearchIcon />
                </ListItemIcon>
                <ListItemText primary="Search" />
              </ListItem>
            </Link>
            <Link to="/convertor">
              <ListItem button>
                <ListItemIcon>
                  <LanguageIcon />
                </ListItemIcon>
                <ListItemText primary="Convertor" />
              </ListItem>
            </Link>
            {hasNomadlist && (
              <Link to="/nomadlist">
                <ListItem button>
                  <ListItemIcon>
                    <MapIcon />
                  </ListItemIcon>
                  <ListItemText primary="Nomadlist" />
                </ListItem>
              </Link>
            )}
            <Link to="/report">
              <ListItem button>
                <ListItemIcon>
                  <InsertChartOutlined />
                </ListItemIcon>
                <ListItemText primary="Report" />
              </ListItem>
            </Link>
            <Link to="/changes">
              <ListItem button>
                <ListItemIcon>
                  <SwapHorizIcon />
                </ListItemIcon>
                <ListItemText primary="Changes" />
              </ListItem>
            </Link>
          </List>
        </Popover>
      </footer>
    </div>
  );
}