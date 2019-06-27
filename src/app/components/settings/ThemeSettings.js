import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { withStyles } from "@material-ui/core/styles";

import Switch from "@material-ui/core/Switch";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";

import UserActions from "../../actions/UserActions";

const styles = theme => ({});

class ThemeSettings extends Component {
  constructor(props, context) {
    super(props, context);
    this.history = props.history;
  }

  _switchTheme = () => {
    const { dispatch, theme } = this.props;
    dispatch(UserActions.setTheme(theme === "dark" ? "light" : "dark"));
  };

  render() {
    const { theme } = this.props;
    return (
      <List className="wrapperMobile">
        <ListItem>
          <ListItemText primary="Dark mode" />
          <ListItemSecondaryAction>
            <Switch onChange={this._switchTheme} checked={theme === "dark"} />
          </ListItemSecondaryAction>
        </ListItem>
      </List>
    );
  }
}

ThemeSettings.propTypes = {
  dispatch: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  theme: PropTypes.string.isRequired
};

const mapStateToProps = (state, ownProps) => {
  return {
    theme: state.user.theme
  };
};

export default connect(mapStateToProps)(withStyles(styles)(ThemeSettings));
