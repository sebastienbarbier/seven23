/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import "./SyncButton.scss";
import moment from "moment";

import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";

import MenuItem from "@material-ui/core/MenuItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

import LoopIcon from "@material-ui/icons/Loop";
import Tooltip from "@material-ui/core/Tooltip";
import Badge from "@material-ui/core/Badge";

import ServerActions from "../../actions/ServerActions";

const styles = theme => ({
  badge: {
    top: "50%",
    right: -3
  },
  badge2digits: {
    top: "50%",
    right: -5
  },
  badge3digits: {
    top: "50%",
    right: -8
  }
});

class SyncButton extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {};
  }

  sync = () => {
    const { dispatch, onClick } = this.props;
    // Propagate onClick action to parent element
    if (onClick) {
      onClick();
    }

    dispatch(ServerActions.sync());
  };

  componentDidMount() {}

  componentWillUnmount() {}

  render() {
    const { last_sync, className, isSyncing, classes, badge } = this.props;

    let badgeStyle = classes.badge;
    if (badge > 9 && badge <= 99) {
      badgeStyle = classes.badge2digits;
    } else if (badge > 99) {
      badgeStyle = classes.badge3digits;
    }

    return (
      <div className={className}>
        <Tooltip
          title={`Last sync ${moment(last_sync).fromNow()}`}
          enterDelay={450}
          placement="bottom"
        >
          <MenuItem
            disabled={isSyncing}
            onClick={() => {
              this.sync();
            }}
          >
            <ListItemIcon>
              <Badge
                badgeContent={badge > 99 ? "99+" : badge}
                invisible={isSyncing || !badge}
                classes={{ badge: badgeStyle }}
                color="primary"
              >
                <LoopIcon
                  className={
                    isSyncing ? "syncingAnimation" : "syncingAnimation stop"
                  }
                />
              </Badge>
            </ListItemIcon>
            <ListItemText>Sync</ListItemText>
          </MenuItem>
        </Tooltip>
      </div>
    );
  }
}

SyncButton.propTypes = {
  classes: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  last_sync: PropTypes.string,
  isSyncing: PropTypes.bool.isRequired,
  badge: PropTypes.number.isRequired
};

const mapStateToProps = (state, ownProps) => {
  return {
    isSyncing: state.state.isSyncing || state.state.isLoading,
    last_sync: state.server.last_sync,
    badge: state.sync.counter || 0
  };
};

export default connect(mapStateToProps)(withStyles(styles)(SyncButton));
