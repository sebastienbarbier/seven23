import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from 'react-router-dom';
import useRouteTitle from "../../hooks/useRouteTitle";

import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import StorageIcon from "@mui/icons-material/Storage";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";

import ServerActions from "../../actions/ServerActions";

import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";

import ModalLayoutComponent from '../layout/ModalLayoutComponent';

const styles = {
  container: {
    textAlign: "left",
    maxWidth: "400px",
    flex: "100%",
    overflow: "auto"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around"
  },
  listItemText: {
    whitespace: "nowrap",
    overflow: "hidden",
    textoverflow: "ellipsis"
  }
};

export default function ServerForm(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const titleObject = useRouteTitle();

  const [url, setUrl] = useState("");
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);

  const servers = useSelector(state => state.server.servers);

  const is_in_modal = Boolean(props.onClose);

  const handleSubmit = event => {
    if (event) {
      event.preventDefault();
    }

    if (url == '') {
      setError({
        url: 'Server url is required'
      });
      return;
    }

    // Start animation during login process
    setError({});
    setLoading(true);

    let _url = url;

    if (_url.startsWith("localhost")) {
      _url = `http://${_url}`;
    } else if (
      _url.startsWith("http://192.") ||
      _url.startsWith("http://172.") ||
      _url.startsWith("http://localhost")
    ) {
      // Do nothing
    } else if (_url.startsWith("192.") || url.startsWith("localhost")) {
      _url = `http://${url}`;
    } else if (_url.startsWith("http://")) {
      _url = _url.replace("http://", "https://");
    } else if (!url.startsWith("https://")) {
      _url = `https://${_url}`;
    }

    if (_url == 'https://seven23.io') {
      _url = `https://api.seven23.io`;
    }

    if (servers.find(s => s.url == _url)) {
      setError({
        url: 'Server is already registered'
      });
      setLoading(false);
    } else {
      // If in modal, we always add server
      dispatch(ServerActions.add(_url));
      // Connect to server
      dispatch(ServerActions.connect(_url))
        .then(() => {
          setLoading(false);
          if (props.onSubmit) {
            props.onSubmit();
          } else {
            navigate('/login');
          }
        })
        .catch(exception => {
          setLoading(false);
          if (props.onClose) {
            props.onClose();
          } else {
            dispatch(ServerActions.remove(_url));
            setError({
              url: exception.message
            });
          }

        });
    }

  };

  const handleCancel = event => {
    if (props.onClose) {
      props.onClose();
    } else {
      navigate('/select-account-type');
    }
  }

  return (
    <ModalLayoutComponent
      title={props.onClose ? 'Add a server' : 'Change instance'}
      content={<>
        <Container style={{ paddingTop: 18 }}>
          <form style={styles.form} onSubmit={handleSubmit}>
            <Stack spacing={2}>
            <TextField
              InputLabelProps={{ shrink: Boolean(url) }}
              label="Server url"
              placeholder="https://"
              value={url}
              id={'cy_server_name'}
              disabled={loading}
              error={Boolean(error.url)}
              helperText={error.url}
              onChange={event => setUrl(event.target.value)}
            />
            <Button
              fullWidth
              variant="contained"
              disableElevation
              color="primary"
              disabled={loading}
              onClick={() => handleSubmit()}
            >
              Connect
            </Button>
            </Stack>
          </form>

          <Grid container spacing={2} style={{ paddingTop: 40, paddingBottom: 40 }}>
            <Grid item md={12}>
              <h3>Deploy your own instance.</h3>
              <p>You can deploy and <strong>run your own instance</strong> following our official documentation</p>
              <a href="https://seven23-server.readthedocs.io/en/latest/"><Button>Visit our documentation</Button></a>
            </Grid>
          </Grid>
        </Container>
      </>}
      footer={<>
        <Stack direction='row' spacing={2} style={{ justifyContent: 'space-between'}}>
          <Button disabled={loading} color='inherit' onClick={() => handleCancel()}>
            Cancel
          </Button>
        </Stack>
      </>}
      isLoading={loading}
    />
  );
}