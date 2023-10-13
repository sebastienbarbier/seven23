/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { useTheme } from "../theme";

import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import Fab from "@mui/material/Fab";
import ContentAdd from "@mui/icons-material/Add";

import { grey } from '@mui/material/colors';

import AppActions from '../actions/AppActions';

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
import Stack from "@mui/material/Stack";

import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItem from "@mui/material/ListItem";

import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Popover from "@mui/material/Popover";

import "./Navigation.scss";

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
  const dispatch = useDispatch();
  const theme = useTheme();
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

  const nbAccount = useSelector(
    (state) => state.accounts.remote.length + state.accounts.local.length
  );

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

    }
  };

  const handleOpenPopover = (event) => {
      const { currentTarget } = event;
      setAnchorEl(currentTarget);
      setOpen(true);
  }

  const handleClosePopover = () => {
    setAnchorEl(null);
    setOpen(false);
  };

  const isFabVisible = useSelector((state) => !!state.state.fab);
  const isFabEnable = useSelector((state) => state.state.fab?.enabled == true);
  const fabAction = useSelector((state) => state.state.fab?.action);

  let [previousLocation, setPreviousLocation] = useState(undefined);
  useEffect(() => {
    if (previousLocation && previousLocation != location.pathname) {
      setPreviousLocation(location.pathname);
      if (isFabVisible) {
        dispatch(AppActions.closeFloatingAddButton());
      }
    }
    if (previousLocation == undefined) {
      setPreviousLocation(location.pathname);
    }
  }, [location]);

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


      <div className="navigation_mobile_wrapper">

        <Fab
          color="primary"
          className={
            (isFabVisible ? "show " : "") + "layout_fab_button"
          }
          disabled={!isFabEnable}
          aria-label="Add"
          onClick={() => fabAction && fabAction()}
        >
          <ContentAdd />
        </Fab>

        <div className="navigation_mobile showMobile" style={{ boxShadow: theme.shadows[3] }}>
          <Stack className="navigation_mobile_stack" direction="row" spacing={0.5}>
            <Link to={"/dashboard"}>
              <Button sx={{ minWidth: 'auto', height: 50, width: 80, paddingTop: 1 }} color={valueMobile == "dashboard" ? 'primary' : 'inherit'}>
                <Stack spacing={0.5} alignItems="center">
                  <DashboardIcon sx={{ fontSize: 24, color: valueMobile == "dashboard" ? 'auto' : theme.palette.text.secondary }} />
                  <Typography sx={{ fontSize: 12, textTransform: 'capitalize' }}>Dashboard</Typography>
                </Stack>
              </Button>
            </Link>
            <Link to={"/transactions"}>
              <Button sx={{ minWidth: 'auto', height: 50, width: 80, paddingTop: 1 }} color={valueMobile == "transactions" ? 'primary' : 'inherit'}>
                <Stack spacing={0.5} alignItems="center">
                  <ListIcon sx={{ fontSize: 24, color: valueMobile == "transactions" ? 'auto' : theme.palette.text.secondary }} />
                  <Typography sx={{ fontSize: 12, textTransform: 'capitalize' }}>Transactions</Typography>
                </Stack>
              </Button>
            </Link>
            <Link to={"/categories"}>
              <Button sx={{ minWidth: 'auto', height: 50, width: 80, paddingTop: 1 }} color={valueMobile == "categories" ? 'primary' : 'inherit'}>
                <Stack spacing={0.5} alignItems="center">
                  <LocalOfferIcon sx={{ fontSize: 24, color: valueMobile == "categories" ? 'auto' : theme.palette.text.secondary }} />
                   <Typography sx={{ fontSize: 12, textTransform: 'capitalize' }}>Categories</Typography>
                </Stack>
              </Button>
            </Link>
            <Button sx={{ minWidth: 'auto', height: 50, width: 80, paddingTop: 1 }} color={valueMobile == "more" ? 'primary' : 'inherit'} onClick={handleOpenPopover}>
              <Stack spacing={0.5} alignItems="center">
                <MoreHoriz sx={{ fontSize: 24, color: valueMobile == "more" ? 'auto' : theme.palette.text.secondary }} />
                <Typography sx={{ fontSize: 12, textTransform: 'capitalize' }}>More</Typography>
              </Stack>
            </Button>
          </Stack>
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
        </div>
      </div>
    </div>
  );
}