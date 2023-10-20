/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";

import { grey } from '@mui/material/colors';
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import UserButton from "./settings/UserButton";
import Fab from "@mui/material/Fab";
import ContentAdd from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import InsertChartRoundedIcon from '@mui/icons-material/InsertChartRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import ListRoundedIcon from '@mui/icons-material/ListRounded';
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import LanguageIcon from "@mui/icons-material/Language";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
import Tooltip from "@mui/material/Tooltip";
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import Stack from "@mui/material/Stack";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItem from "@mui/material/ListItem";
import Popover from "@mui/material/Popover";

import { useTheme } from "../theme";
import AppActions from '../actions/AppActions';

import "./Navigation.scss";

export default function Navigation(props) {
  const location = useLocation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const hasNomadlist = useSelector((state) =>
    !!state.user.socialNetworks?.nomadlist?.username
  );
  const hasAccount = useSelector(
    (state) => (state.accounts.remote.length + state.accounts.local.length) >= 1
  );
  //
  // Keep current selected item
  //
  const [currentItem, setCurrentItem] = useState("dashboard");

  useEffect(() => {
    if (
      location.pathname == "/" ||
      location.pathname.startsWith("/dashboard")
    ) {
      setCurrentItem("dashboard");
    } else if (location.pathname.startsWith("/transactions")) {
      setCurrentItem("transactions");
    } else if (location.pathname.startsWith("/categories")) {
      setCurrentItem("categories");
    } else if (location.pathname.startsWith("/changes")) {
      setCurrentItem("changes");
    } else if (location.pathname.startsWith("/report")) {
      setCurrentItem("viewer");
    } else if (location.pathname.startsWith("/search")) {
      setCurrentItem("search");
    } else if (location.pathname.startsWith("/convertor")) {
      setCurrentItem("convertor");
    } else if (location.pathname.startsWith("/nomadlist")) {
      setCurrentItem("nomadlist");
    } else {
      setCurrentItem("more");
    }
    setOpen(false);
  }, [location.pathname]);

  //
  // Popup handler for more mobile view
  //

  // Anchors for more popup element
  const [open, setOpen] = useState(false); // Popover open state
  const [anchorEl, setAnchorEl] = useState(null);
  const handleOpenPopover = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  }

  const handleClosePopover = () => {
    setAnchorEl(null);
    setOpen(false);
  };

  //
  //  Handle FAB status, avoiding repaint on multiple location event
  //
  const isFabVisible = useSelector((state) => !!state.state.fab);
  const isFabEnable = useSelector((state) => state.state.fab?.enabled == true);
  const fabAction = useSelector((state) => state.state.fab?.action);

  // On navigation, we remove FAB. New view will handle event to display it again.
  useEffect(() => {
    if (isFabVisible) {
      dispatch(AppActions.closeFloatingAddButton());
    }
  }, [location.pathname]);

  return (
    <aside className='navigation'>
      <nav>
        <Stack
          spacing={0.5}
        >
          <Link to={"/dashboard"}>
            <Button disableRipple className={currentItem == "dashboard" ? 'selectedButton button' : 'button'}>
              <Box className="icon"><DashboardRoundedIcon /></Box>
              <Typography className="text">Dashboard</Typography>
            </Button>
          </Link>
          <Link to={"/transactions"}>
            <Button disableRipple className={currentItem == "transactions" ? 'selectedButton button' : 'button'}>
              <Box className="icon"><ListRoundedIcon /></Box>
              <Typography className="text">Transactions</Typography>
            </Button>
          </Link>
          <Link to={"/categories"}>
            <Button disableRipple className={currentItem == "categories" ? 'selectedButton button' : 'button'}>
              <Box className="icon"><LocalOfferIcon /></Box>
              <Typography className="text">Categories</Typography>
            </Button>
          </Link>
          <Link to={"/changes"}>
            <Button disableRipple className={currentItem == "changes" ? 'selectedButton button' : 'button'}>
              <Box className="icon"><SwapHorizRoundedIcon /></Box>
              <Typography className="text">Changes</Typography>
            </Button>
          </Link>
          <Link to={"/report"}>
            <Button disableRipple className={currentItem == "viewer" ? 'selectedButton button' : 'button'}>
              <Box className="icon"><InsertChartRoundedIcon /></Box>
              <Typography className="text">Report</Typography>
            </Button>
          </Link>
          {hasNomadlist && (<Link to={"/nomadlist"}>
              <Button disableRipple className={currentItem == "nomadlist" ? 'selectedButton button' : 'button'}>
                <Box className="icon"><MapRoundedIcon /></Box>
                <Typography className="text">Nomadlist</Typography>
              </Button>
            </Link>
          )}
          <Link to={"/convertor"}>
            <Button disableRipple className={currentItem == "convertor" ? 'selectedButton button' : 'button'}>
              <Box className="icon"><LanguageIcon /></Box>
              <Typography className="text">Convertor</Typography>
            </Button>
          </Link>
          <Link to={"/search"}>
            <Button disableRipple className={currentItem == "search" ? 'selectedButton button' : 'button'}>
              <Box className="icon"><SearchRoundedIcon /></Box>
              <Typography className="text">Search</Typography>
            </Button>
          </Link>
        </Stack>
        <div className="userButton">
          <UserButton direction='left' />
        </div>
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

        <div className="navigation_mobile showMobile" style={{ boxShadow: theme.shadows[2] }}>
          <Box className="navigation_mobile_stack">
            <Link to={"/dashboard"}>
              <Button disableRipple className={currentItem == "dashboard" ? 'selectedButton button' : 'button'}>
                <Box className="icon"><DashboardRoundedIcon /></Box>
                <Typography className="text">Dashboard</Typography>
              </Button>
            </Link>
            <Link to={"/transactions"}>
              <Button disableRipple className={currentItem == "transactions" ? 'selectedButton button' : 'button'}>
                <Box className="icon"><ListRoundedIcon /></Box>
                <Typography className="text">Transactions</Typography>
              </Button>
            </Link>
            <Link to={"/categories"}>
              <Button disableRipple className={currentItem == "categories" ? 'selectedButton button' : 'button'}>
                <Box className="icon"><LocalOfferIcon /></Box>
                <Typography className="text">Categories</Typography>
              </Button>
            </Link>
            <Button disableRipple className={`${["dashboard", "transactions", "categories"].indexOf(currentItem) == -1 ? 'selectedButton button' : 'button'} ${open ? 'hover': ''}`} onClick={handleOpenPopover}>
              <Box className="icon"><MoreHoriz /></Box>
              <Typography className="text">More</Typography>
            </Button>
          </Box>
          <Popover
            id={'footer-more-Popover'}
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
                    <SearchRoundedIcon />
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
                      <MapRoundedIcon />
                    </ListItemIcon>
                    <ListItemText primary="Nomadlist" />
                  </ListItem>
                </Link>
              )}
              <Link to="/report">
                <ListItem button>
                  <ListItemIcon>
                    <InsertChartRoundedIcon />
                  </ListItemIcon>
                  <ListItemText primary="Report" />
                </ListItem>
              </Link>
              <Link to="/changes">
                <ListItem button>
                  <ListItemIcon>
                    <SwapHorizRoundedIcon />
                  </ListItemIcon>
                  <ListItemText primary="Changes" />
                </ListItem>
              </Link>
            </List>
          </Popover>
        </div>
      </div>
    </aside>
  );
}