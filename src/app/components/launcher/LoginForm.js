import "./LoginForm.scss";

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from 'react-router-dom';

import Button from "@mui/material/Button";
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import TextField from "@mui/material/TextField";

import useRouteTitle from "../../hooks/useRouteTitle";
import CircularProgress from '@mui/material/CircularProgress';

import List from "@mui/material/List";
import ListItemButton from '@mui/material/ListItemButton';
import ListItem from "@mui/material/ListItem";

import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";

import UploadFileIcon from '@mui/icons-material/UploadFile';
import StorageIcon from "@mui/icons-material/Storage";

import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import Edit from "@mui/icons-material/Edit";
import Close from "@mui/icons-material/Close";

import PasswordField from '../forms/PasswordField';
import UserActions from "../../actions/UserActions";

import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";

import ModalLayoutComponent from '../layout/ModalLayoutComponent';

import ServerSelector from '../settings/servers/ServerSelector';

export default function LoginForm(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const titleObject = useRouteTitle();
  const server = useSelector((state) => state.server);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);

  const [hasToken, setHasToken] = useState(false);

  const handleSubmit = (event) => {
    if (event) {
      event.preventDefault();
    }

    setLoading(true);

    dispatch(UserActions.fetchToken(username, password))
      .then((res) => {
        // Switch to loading animation
        setHasToken(true);
        return dispatch(UserActions.login());
      })
      .then((res) => {
        setLoading(false);
        navigate("/");
      })
      .catch((error) => {
        if (error && error.response && error.response.data) {
          setLoading(false);
          setError({
            non_field_errors: error.response.data.non_field_errors,
            username: error.response.data.username,
            password: error.response.data.password,
          });
        } else {
          setLoading(false);
          setError({
            non_field_errors: "An error occured",
          });
        }
      });
  };

  const handleForgottenPassword = () => {
    if (props.onForgottenPassword) {
      props.onForgottenPassword();
    } else {
      navigate("/password/reset");
    }
  };

  const handleChangeServer = () => {
    if (props.onChangeServer) {
      props.onChangeServer();
    } else {
      navigate("/server");
    }
  };

  const handleCancel = () => {
    if (props.onClose) {
      props.onClose();
    } else {
      navigate("/get-started");
    }
  };

  return (
    <ModalLayoutComponent
      title={ titleObject.title }
      content={<>

        <ListSubheader disableSticky={true} sx={{ pt: 0.5 }}>Connect to {server.name}</ListSubheader>
        <Container className="loginForm" sx={{ pb: 4 }}>
          <form id="cy_login_form" onSubmit={handleSubmit} className={`${hasToken ? 'hidden' : ''}`}>
            <Stack spacing={2} sx={{ marginTop: 2 }}>
              <TextField
                id="cy_username"
                label="Username"
                margin="normal"
                fullWidth
                disabled={loading}
                value={username}
                error={Boolean(error.username) || Boolean(error.non_field_errors)}
                helperText={error.username}
                onChange={(event) => setUsername(event.target.value)}
              />
              <PasswordField
                id="cy_password"
                label="Password"
                type="password"
                margin="normal"
                fullWidth
                disabled={loading}
                value={password}
                error={Boolean(error.password) || Boolean(error.non_field_errors)}
                helperText={error.password}
                onChange={(event) => setPassword(event.target.value)}
              />
              { error.non_field_errors &&
                <Alert severity="error">
                  { error.non_field_errors }
                </Alert>
              }
              <Button
                variant="contained"
                disableElevation
                color="primary"
                fullWidth
                disabled={loading}
                type="submit"
              >
                Log in
              </Button>
            </Stack>
          </form>
          <div className={`loadingAnimation ${hasToken ? 'show' : ''}`}>
            <Stack
            direction="column"
            justifyContent="center"
            alignItems="center"
            spacing={2}>
              <CircularProgress size={60} />
              <p>Loading user profile</p>
            </Stack>
          </div>
        </Container>

        { !props.onClose && <>
          <List subheader={
            <ListSubheader disableSticky={true}>Server</ListSubheader>
          }>
            <ListItemButton disabled={loading} component={Link} to="/server">
              <ListItemIcon>
                <StorageIcon />
              </ListItemIcon>
              <ListItemText
                primary={`Change server`}
                secondary={`Use your own instance`}
              />
              <KeyboardArrowRight />
            </ListItemButton>
          </List>
          <List
            subheader={
              <ListSubheader disableSticky={true}>On device only</ListSubheader>
            }
          >
            <ListItemButton disabled={loading} component={Link} to="/import-account">
              <ListItemIcon>
                <UploadFileIcon />
              </ListItemIcon>
              <ListItemText
                primary="Import .json file"
                secondary={`Use a backup generated previously by the application`}
              />
              <KeyboardArrowRight />
            </ListItemButton>
          </List>
        </>}
      </>}
      footer={<>
        { !hasToken &&
          <Stack direction='row-reverse' spacing={2} style={{ width: '100%', justifyContent: 'space-between'}}>
            <Button
              disabled={loading}
              color='inherit'
              onClick={() => handleForgottenPassword()}
            >
              Forgotten password ?
            </Button>
            <Button
              disabled={loading}
              onClick={() => handleCancel()}
              color='inherit'
            >
              Cancel
            </Button>
          </Stack> }
      </>}
    />
  );
}