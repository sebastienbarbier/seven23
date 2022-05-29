import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import withStyles from '@mui/styles/withStyles';

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

const styles = theme => ({
  expand: {
    transform: "rotate(0deg)",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest
    }),
    marginLeft: "auto"
  },
  expandOpen: {
    transform: "rotate(180deg)"
  }
});

class SecuritySettings extends Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    const { cipher } = this.props;
    return (
      <List className="wrapperMobile">
        <ListItem>
          <ListItemText primary="Encryption key" secondary={cipher} />
        </ListItem>
      </List>
    );
  }
}

SecuritySettings.propTypes = {
  classes: PropTypes.object.isRequired,
  cipher: PropTypes.string.isRequired
};

const mapStateToProps = (state, ownProps) => {
  return {
    cipher: state.user.cipher
  };
};

export default connect(mapStateToProps)(withStyles(styles)(SecuritySettings));