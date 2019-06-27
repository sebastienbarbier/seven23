import moment from "moment";

import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { withStyles } from "@material-ui/core/styles";

import List from "@material-ui/core/List";
import ListSubheader from "@material-ui/core/ListSubheader";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

import Modal from "@material-ui/core/Modal";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";

import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";

import UserActions from "../../actions/UserActions";

const styles = theme => ({
  card: {
    position: "absolute",
    top: 40,
    left: 40,
    right: 40,
    bottom: 40,
    display: "flex",
    flexDirection: "column"
  }
});

class ServerSettings extends Component {
  constructor(props, context) {
    super(props, context);
    this.history = props.history;
    this.state = {
      open: false,
      terms_and_conditions_date: moment(
        this.props.server.terms_and_conditions_date,
        "YYYY-MM-DD"
      ).format("MMMM Do,YYYY")
    };
  }

  _toggleTermsAndCondition = () => {
    this.setState({ open: !this.state.open });
  };

  _revokePassword = () => {
    const { dispatch } = this.props;

    dispatch(UserActions.revokeToken())
      .then(() => {
        this.history.replace("/logout");
      })
      .catch(error => {
        console.error(error);
      });
  };

  render() {
    const { terms_and_conditions_date, open } = this.state;
    const { classes, server, token, last_sync, last_edited } = this.props;
    return (
      <div
        className="wrapperMobile"
        subheader={
          <ListSubheader disableSticky={true}>Authentication</ListSubheader>
        }
      >
        <List>
          <ListItem>
            <ListItemText primary="Name" secondary={server.name} />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="API Version"
              secondary={server["api_version"].join(".")}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Administrator email"
              secondary={server.contact || "Not defined"}
            />
          </ListItem>

          <ListItem button onClick={this._toggleTermsAndCondition}>
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
          <ListItem>
            <ListItemText
              primary="Sign in"
              secondary={server.allow_account_creation ? "Enable" : "Disable"}
            />
          </ListItem>
          <ListItem>
            <ListItemText primary="Authentication Token" secondary={token} />
          </ListItem>
          <Divider />
          <ListItem button onClick={this._revokePassword}>
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
          onClose={this._toggleTermsAndCondition}
        >
          <Card className={classes.card}>
            <CardHeader
              title="Terms and conditions"
              subheader="Terms and condition are defined by the hosting platform, and can be
              different for every instance."
            />
            <CardContent
              style={{ overflow: "auto", flexShrink: 1, flexGrow: 1 }}
            >
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
              <Button onClick={this._toggleTermsAndCondition}>Close</Button>
            </CardActions>
          </Card>
        </Modal>
      </div>
    );
  }
}

ServerSettings.propTypes = {
  classes: PropTypes.object.isRequired,
  server: PropTypes.object.isRequired,
  token: PropTypes.string.isRequired,
  last_sync: PropTypes.string.isRequired,
  last_edited: PropTypes.string
};

const mapStateToProps = (state, ownProps) => {
  return {
    token: state.user.token,
    server: state.server,
    last_sync: state.server.last_sync,
    last_edited: state.server.last_edited
  };
};

export default connect(mapStateToProps)(withStyles(styles)(ServerSettings));
