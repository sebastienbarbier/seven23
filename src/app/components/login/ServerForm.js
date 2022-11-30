import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from 'react-router-dom';

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

  const [url, setUrl] = useState("");
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = event => {
    if (event) {
      event.preventDefault();
    }

    const url_patter = new RegExp(/^(?!-)[A-Za-z0-9-]+([\-\.]{1}[a-z0-9]+)*\.[A-Za-z]{2,6}$/);

    if (!url || !url_patter.test(url.replace('http://', '').replace('https://', ''))) {
      setError({
        url: `Provided url is not valid.`
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
        setError({
          url: exception.message
        });
      });
  };

  const handleCancel = event => {
    if (props.onClose) {
      props.onClose();
    } else {
      navigate('/select-account-type');
    }
  }

  return (
    <div className="layout dashboard mobile">
      <header className="layout_header">
        <Container className="layout_header_top_bar">
          <h2>Select a server</h2>
        </Container>
      </header>
      <main className="layout_content">
        <Container style={{ paddingTop: 18 }}>
          <form style={styles.form} onSubmit={handleSubmit}>
            <Stack spacing={2}>
            <TextField
              InputLabelProps={{ shrink: Boolean(url) }}
              label="Server url"
              placeholder="https://"
              value={url}
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
            <Grid item md={6}>
              <h3>Use the official server</h3>
              <p>The application provide an official instance hosted on the <strong>seven23.io</strong> domain. 
              Set your server to this url to support the product.</p>
              <Button onClick={() => setUrl("https://seven23.io")}>Set to default</Button>
            </Grid>
            <Grid item md={6}>
              <h3>Deploy your own instance.</h3>
              <p>You can deploy and <strong>run your own instance</strong> following our official documentation</p>
              <a href="https://seven23.io"><Button>Visit our documentation</Button></a>
            </Grid>
          </Grid>

          <h3>Previously used</h3>
          <List>
            <ListItem button onClick={() => setUrl("https://seven23.io")}>
              <ListItemAvatar>
                <Avatar>
                  <StorageIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="seven23.io"
                secondary="Official server"
                style={styles.listItemText}
              />
            </ListItem>
            <ListItem button onClick={() => setUrl("localhost:8000")}>
              <ListItemAvatar>
                <Avatar>
                  <StorageIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="localhost:8000"
                primaryTypographyProps={styles.listItemText}
              />
            </ListItem>
          </List>
        </Container>
      </main>      
      <footer className="layout_footer">
        <Container>
          <Stack direction='row' spacing={2} style={{ justifyContent: 'space-between'}}>
            <Button disabled={loading} color='inherit' onClick={() => handleCancel()}>
              Cancel
            </Button>
          </Stack>
        </Container>
      </footer>
    </div>
  );
}