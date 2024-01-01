/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";

import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";

import MoreVertIcon from "@mui/icons-material/MoreVert";

import AccountsActions from "../../actions/AccountsActions";
import AppActions from "../../actions/AppActions";
import AccountDeleteForm from "../settings/accounts/AccountDeleteForm";
import AccountForm from "../settings/accounts/AccountForm";

export default function AccountsSettings(props) {
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const [isMigrating, setIsMigrating] = useState(false);

  const accounts = useSelector((state) => state.accounts);
  const server = useSelector((state) => state.server);
  const isLogged = useSelector((state) => state.server.isLogged);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(AppActions.setFloatingAddButton(() => _openAccount()));
  }, []);

  const _openAccount = (account = null) => {
    dispatch(
      AppActions.openModal(
        <AccountForm
          account={account}
          onSubmit={() => dispatch(AppActions.closeModal())}
          onClose={() => dispatch(AppActions.closeModal())}
        />
      )
    );
  };

  const _deleteAccount = (account) => {
    dispatch(
      AppActions.openModal(
        <AccountDeleteForm
          account={account}
          onSubmit={() => {
            const mergedList = [...accounts.remote, ...accounts.local];
            if (mergedList.length === 1 && mergedList[0].id === account.id) {
              navigate("/");
            } else {
              dispatch(AppActions.closeModal());
            }
          }}
          onClose={() => dispatch(AppActions.closeModal())}
        />
      )
    );
  };

  const _openActionMenu = (event, account) => {
    setOpen(true);
    setAnchorEl(event.currentTarget);
    setSelectedAccount(account);
  };

  const _closeActionMenu = () => {
    setOpen(false);
    setTimeout(() => setAnchorEl(null), 500);
  };

  const _migrateAccount = (account = selectedAccount) => {
    if (account) {
      setIsMigrating(true);
      dispatch(AccountsActions.migrate(account))
        .then(() => {
          setIsMigrating(false);
        })
        .catch(() => {
          setIsMigrating(false);
        });
    }
  };

  const should_migrate_account = useSelector(
    (state) => state.server.isLogged && state.accounts.remote.length === 0
  );

  return (
    <div>
      {isMigrating && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            zIndex: 1000,
          }}
        >
          <CircularProgress size={80} />
        </Box>
      )}

      {accounts.remote && Boolean(accounts.remote.length) && (
        <List>
          <ListSubheader disableSticky={true}>{server.name}</ListSubheader>
          {accounts.remote
            .sort((a, b) => {
              if (a.name.toLowerCase() < b.name.toLowerCase()) {
                return -1;
              } else if (a.name.toLowerCase() > b.name.toLowerCase()) {
                return 1;
              } else if (a.id < b.id) {
                return -1;
              } else {
                return 1;
              }
            })
            .map((account) => (
              <ListItem key={account.id}>
                <ListItemText primary={account.name} />
                <ListItemSecondaryAction>
                  <IconButton
                    disabled={isMigrating}
                    onClick={(event) => _openActionMenu(event, account)}
                    size="large"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
        </List>
      )}

      {accounts.local && Boolean(accounts.local.length) && (
        <List>
          <ListSubheader disableSticky={true}>On device</ListSubheader>
          {accounts.local
            .sort((a, b) => {
              if (a.name.toLowerCase() < b.name.toLowerCase()) {
                return -1;
              } else if (a.name.toLowerCase() > b.name.toLowerCase()) {
                return 1;
              } else if (a.id < b.id) {
                return -1;
              } else {
                return 1;
              }
            })
            .map((account) => (
              <ListItem key={account.id}>
                <ListItemText primary={account.name} />
                <ListItemSecondaryAction>
                  <IconButton
                    disabled={isMigrating}
                    onClick={(event) => _openActionMenu(event, account)}
                    size="large"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
        </List>
      )}

      {should_migrate_account && !isMigrating && (
        <Container style={{ paddingTop: 12 }}>
          <Grid container spacing={2}>
            <Grid xs={12} md={12}>
              <Alert severity="info" id="cy_migrate_alert">
                <AlertTitle>Migrate your account</AlertTitle>
                <p>
                  This account is currently ony available on your device.
                  Migrate it to the cloud so it can be synced and saved for you.
                </p>
                <p>
                  To migrate, open the three dot menu of an account and click on{" "}
                  <strong>'Migrate to a server'</strong>
                </p>
              </Alert>
            </Grid>
          </Grid>
        </Container>
      )}

      <Menu anchorEl={anchorEl} open={Boolean(open)} onClose={_closeActionMenu}>
        <MenuItem
          onClick={() => {
            _closeActionMenu();
            _openAccount(selectedAccount);
          }}
        >
          Edit
        </MenuItem>
        <Divider />
        {selectedAccount && isLogged && (
          <MenuItem
            onClick={() => {
              _migrateAccount(selectedAccount);
              _closeActionMenu();
            }}
          >
            {selectedAccount.isLocal
              ? "Migrate to server"
              : "Migrate to device"}
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            _closeActionMenu();
            _deleteAccount(selectedAccount);
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </div>
  );
}
