import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import StorageIcon from "@material-ui/icons/Storage";

import ServerActions from "../../actions/ServerActions";

import Avatar from "@material-ui/core/Avatar";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";

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

  const [url, setUrl] = useState("");
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = event => {
    if (event) {
      event.preventDefault();
    }

    if (!url) {
      return;
    }

    // Start animation during login process
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

    // Connect to server
    dispatch(ServerActions.connect(_url))
      .then(() => {
        setUrl(_url);
        setLoading(false);
        props.setStep("CONNECT");
      })
      .catch(exception => {
        setUrl("");
        setLoading(false);
        setError({
          url: exception.message
        });
      });
  };

  return (
    <div className="welcoming__layout">
      <header>
        <h2>Select a server</h2>
      </header>
      <div className="content">
        <form style={styles.form} onSubmit={handleSubmit}>
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
          <br />
          <Button
            style={{ margin: "40px 0 40px 0" }}
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            onClick={() => handleSubmit()}
          >
            Connect
          </Button>
        </form>
        <h2>Shortcut</h2>
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
      </div>
      <footer className="spaceBetween">
        <Button onClick={() => props.setStep("CONNECT")} disabled={loading}>
          Cancel
        </Button>
      </footer>
    </div>
  );
}

// class ServerForm extends Component {
//   constructor(props, context) {
//     super(props, context);
//     this.context = context;
//     this.location = props.location;
//     this.state = {
//       loading: false,
//       error: {},
//       username: "",
//       password: "",
//       inputUrl: ""
//     };

//     // Send login action
//     const { dispatch } = this.props;

//   }

//   // Event on input typing
//   handleChangeUrl = event => {
//     this.setState({
//       inputUrl: event.target.value
//     });
//   };

//   setShortcut = url => {
//     this.setState({
//       inputUrl: url
//     });
//   };

//   handleSubmit = e => {
//     e.preventDefault();
//     if (!this.state.inputUrl) {
//       return;
//     }

//     // Start animation during login process
//     this.setState({
//       loading: true
//     });

//     const { dispatch, history } = this.props;

//     let url = this.state.inputUrl;

//     if (url.startsWith("localhost")) {
//       url = `http://${url}`;
//     } else if (
//       url.startsWith("http://192.") ||
//       url.startsWith("http://172.") ||
//       url.startsWith("http://localhost")
//     ) {
//       // Do nothing
//     } else if (url.startsWith("192.") || url.startsWith("localhost")) {
//       url = `http://${url}`;
//     } else if (url.startsWith("http://")) {
//       url = url.replace("http://", "https://");
//     } else if (!url.startsWith("https://")) {
//       url = `https://${url}`;
//     }

//     // Connect to server
//     dispatch(ServerActions.connect(url))
//       .then(() => {
//         history.push("/login");
//       })
//       .catch(exception => {
//         console.log(exception);
//         // TO BE DEFINED
//         this.setState({
//           url: null,
//           inputUrl: url,
//           loading: false,
//           connected: false,
//           error: {
//             url: exception.message
//           }
//         });
//       });
//   };

//   render() {
//     const { loading } = this.state;
//     return (
//       <div style={styles.container}>
//         <h1>Server</h1>
//         <p>
//           This application can connect different server.
//           <br />
//           If you decided to self-host your own server this is where you can
//           configure your application to connect.
//         </p>

//       </div>
//     );
//   }
// }
// export default withRouter(connect(mapStateToProps)(ServerForm));
