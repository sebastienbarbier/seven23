import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';

import Divider from '@material-ui/core/Divider';

const styles = theme => ({
  expand: {
    transform: 'rotate(0deg)',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
    marginLeft: 'auto',
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
});

class SecuritySettings extends Component {
  constructor(props, context) {
    super(props, context);
    this.history = props.history;
  }

  render() {
    const { cipher } = this.props;
    return (
      <div className="grid">
        <div className="card small">
          <Card>
            <CardHeader
              title="Security"
            />
            <CardContent style={{ padding: '0px' }}>
              <List>
                <Divider />
                <ListItem>
                  <ListItemText primary="Encryption key" secondary={cipher} />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
}

SecuritySettings.propTypes = {
  classes: PropTypes.object.isRequired,
  cipher: PropTypes.string.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    cipher:  state.user.cipher,
  };
};

export default connect(mapStateToProps)(withStyles(styles)(SecuritySettings));
