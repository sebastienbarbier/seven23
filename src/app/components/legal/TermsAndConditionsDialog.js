/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import FlatButton from "material-ui/FlatButton";
import TextField from "material-ui/TextField";
import Divider from "material-ui/Divider";

import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import CircularProgress from "material-ui/CircularProgress";

import { green500, red500 } from "material-ui/styles/colors";
import lightTheme from "../../themes/light";

import Dialog from "material-ui/Dialog";

import ServerStore from "../../stores/ServerStore";

const styles = {
  actions: {
    textAlign: "right",
  },
};

class TermsAndConditionsDialog extends Component {
  constructor(props, context) {
    super(props, context);
    // Set default values
    this.state = {
      open: false,
    };

    this.actions = [
      <FlatButton label="Close" primary={true} onTouchTap={this.handleClose} />,
    ];
  }

  handleClose = () => {
    this.setState({
      open: false,
    });
  };

  componentWillMount() {
    this.setState({
      server: ServerStore.server,
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      open: nextProps.open,
    });
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(lightTheme)}>
        <Dialog
          title="Terms and conditions"
          actions={this.actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
          autoScrollBodyContent={true}
        >
          <p>
            Terms and condition are defined by the hosting platform, and can be
            different for every instance.
          </p>
          <Divider />
          <p>
            Published on{" "}
            {moment(
              this.state.server.terms_and_conditions_date,
              "YYYY-MM-DD"
            ).format("MMMM Do,YYYY")}
          </p>
          <div
            dangerouslySetInnerHTML={{
              __html: this.state.server.terms_and_conditions,
            }}
          />
        </Dialog>
      </MuiThemeProvider>
    );
  }
}

export default TermsAndConditionsDialog;
