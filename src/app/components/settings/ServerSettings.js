import moment from "moment";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';

import List from "@mui/material/List";
import ListSubheader from "@mui/material/ListSubheader";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";

import Modal from "@mui/material/Modal";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";

import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LoopIcon from "@mui/icons-material/Loop";
import ArticleIcon from '@mui/icons-material/Article';

import Switch from "@mui/material/Switch";

import UserActions from "../../actions/UserActions";
import AccountsActions from "../../actions/AccountsActions";
import AppActions from "../../actions/AppActions";

export default function ServerSettings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const token = useSelector(state => state.user.token);
  const server = useSelector(state => state.server);
  const account = useSelector(state => state.account);
  const last_sync = useSelector(state => state.server.last_sync);
  const last_edited = useSelector(state => state.server.last_edited);
  const isDeveloper = useSelector(state => state.app.isDeveloper);
  const isAutoSyncEnabled = useSelector(state => state.user.profile.profile.auto_sync);

  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const terms_and_conditions_date = moment(
    server.terms_and_conditions_date,
    "YYYY-MM-DD"
  ).format("MMMM Do,YYYY");

  const _toggleAutoSync = () => {
    if (!isLoading) {
      setIsLoading(true);
      dispatch(UserActions.update({ profile: { auto_sync: !isAutoSyncEnabled }}))
        .catch(error => {
          console.error(error);
          dispatch(
            AppActions.snackbar(
              "Can't access server to updated sync preferences"
            )
          );
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  const _toggleTermsAndCondition = () => {
    setOpen(!open);
  };

  const _revokePassword = () => {
    dispatch(UserActions.revokeToken())
      .then(() => {
        dispatch(UserActions.logout())
          .then(() => {
            navigate("/");
          });
      })
      .catch(error => {
        console.error(error);
      });
  };

  return (
    <div>
      <List
        subheader={
          <ListSubheader disableSticky={true}>Server/Sync</ListSubheader>
            }
          >
        <ListItem>
          <ListItemText
            primary="Last sync"
            secondary={moment(last_sync).fromNow()}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Last modification"
            secondary={moment(last_edited).fromNow()}
          />
        </ListItem>
        <ListItem button onClick={_toggleAutoSync} disabled={isLoading}>
          <ListItemIcon>
            <LoopIcon />
          </ListItemIcon>
          <ListItemText
            primary="Auto sync"
            secondary="Push modifications on each edit"
          />
          <ListItemSecondaryAction>
            <Switch
              checked={isAutoSyncEnabled}
              onChange={_toggleAutoSync}
              color="primary"
              disabled={isLoading}
              inputProps={{ "aria-label": "primary checkbox" }}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem button onClick={_toggleTermsAndCondition}>
          <ListItemIcon>
            <ArticleIcon />
          </ListItemIcon>
          <ListItemText
            primary="Terms and conditions"
            secondary={
              server.terms_and_conditions
                ? `Published on ${terms_and_conditions_date}`
                : "NA"
            }
          />
          <KeyboardArrowRight />
        </ListItem>
      </List>
      <Divider />
      <List
        subheader={
          <ListSubheader disableSticky={true}>Connected server</ListSubheader>
        }>
        <ListItem>
          <ListItemText primary="Name" secondary={server.name} />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Administrator email"
            secondary={server.contact || "Not defined"}
          />
        </ListItem>
      { isDeveloper && <>
          <ListItem>
            <ListItemText
              primary="URL"
              secondary={server.url}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="API Version"
              secondary={server["api_version"].join(".")}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Sign Up"
              secondary={server.allow_account_creation ? "Enable" : "Disable"}
            />
          </ListItem>
          <ListItem>
            <ListItemText primary="Authentication Token" secondary={token} />
          </ListItem>
        </> }
        <ListItem button onClick={_revokePassword}>
          <ListItemIcon>
            <DeleteForeverIcon />
          </ListItemIcon>
          <ListItemText
            primary="Revoke Token"
            secondary="Delete the token and logout"
          />
        </ListItem>
      </List>

      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={open}
        onClose={_toggleTermsAndCondition}
      >
        <Card sx={{
          position: "absolute",
          top: 40,
          left: 40,
          right: 40,
          bottom: 40,
          display: "flex",
          flexDirection: "column"
        }}>
          <CardHeader
            title="Terms and conditions"
            subheader="Terms and condition are defined by the hosting platform, and can be
            different for every instance."
          />
          <CardContent style={{ overflow: "auto", flexShrink: 1, flexGrow: 1 }}>
            {server.terms_and_conditions ? (
              <div>
                <h3>
                  Publised on{" "}
                  {moment(
                    server.terms_and_conditions_date,
                    "YYYY-MM-DD"
                  ).format("MMMM Do,YYYY")}
                </h3>
                <div
                  dangerouslySetInnerHTML={{
                    __html: server.terms_and_conditions
                  }}
                />
              </div>
            ) : (
              <p>This server has no terms and conditions defined.</p>
            )}
          </CardContent>
          <CardActions
            style={{
              display: "flex",
              justifyContent: "flex-end",
              padding: "10px 20px"
            }}
          >
            <Button onClick={_toggleTermsAndCondition}>Close</Button>
          </CardActions>
        </Card>
      </Modal>
    </div>
  );
}