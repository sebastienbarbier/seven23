/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import IconButton from '@material-ui/core/IconButton';
import InsertChartOutlined from '@material-ui/icons/InsertChartOutlined';
import SwapHorizIcon from '@material-ui/icons/SwapHoriz';
import ListIcon from '@material-ui/icons/List';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import DashboardIcon from '@material-ui/icons/Dashboard';
import MoreHoriz from '@material-ui/icons/MoreHoriz';
import Tooltip from '@material-ui/core/Tooltip';

import List from '@material-ui/core/List';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItem from '@material-ui/core/ListItem';

import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';

import Popover from '@material-ui/core/Popover';

const styles = {
  separator: {
    margin: '0px 8px',
  },
  iconButton: {
    width: 55,
    height: 55,
  },
  icon: {
    width: 25,
    height: 25,
  },
  drawer: {
    paddingTop: 20
  },
};

class Navigation extends Component {
  constructor(props, context) {
    super(props, context);
    this.context = context;
    this.removeListener = null;

    this.location = props.location;
    this.history = props.history;

    this.state = {
      valueMobile: 'dashboard',
      valueDesktop: 'dashboard',
      anchorEl: null,
      open: false,
    };

  }

  componentWillMount() {
    // Init footer
    this.listennerLocation(this.history.location);

    this.removeListener = this.history.listen(this.listennerLocation);
  }

  componentWillUnmount() {
    this.removeListener();
  }

  handleChange = (event, value) => {
    if (['dashboard', 'transactions', 'categories'].indexOf(value) >= 0) {
      this.history.push(`/${value}`);
    } else if (value === 'more') {
      const { currentTarget } = event;
      this.setState(state => ({
        anchorEl: currentTarget,
        open: !state.open,
      }));
    }
  };

  handleClosePopover = () => {
    this.setState({
      anchorEl: null,
      open: false,
    });
  }

  listennerLocation = (location) => {
    if (location.pathname == '/' || location.pathname.startsWith('/dashboard')) {
      this.setState({
        valueMobile: 'dashboard',
        valueDesktop: 'dashboard',
        open: false,
      });
    } else if (location.pathname.startsWith('/transactions')) {
      this.setState({
        valueMobile: 'transactions',
        valueDesktop: 'transactions',
        open: false,
      });
    } else if (location.pathname.startsWith('/categories')) {
      this.setState({
        valueMobile: 'categories',
        valueDesktop: 'categories',
        open: false,
      });
    } else if (location.pathname.startsWith('/changes')) {
      this.setState({
        valueMobile: 'more',
        valueDesktop: 'changes',
        open: false,
      });
    } else if (location.pathname.startsWith('/viewer')) {
      this.setState({
        valueMobile: 'more',
        valueDesktop: 'viewer',
        open: false,
      });
    } else {
      this.setState({
        valueMobile: 'more',
        valueDesktop: 'more',
        open: false,
      });
    }
  };

  render() {
    const { accounts } = this.props;
    const { valueMobile, anchorEl, open } = this.state;

    const id = open ? 'footer-more-Popover' : null;

    return (
      <div id="menu">
        {accounts && accounts.length != 0 ? (
          <nav>
            <List style={{
              padding: '24px 2px 2px 2px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Link to={'/dashboard'}>
                <Tooltip title="Dashboard" enterDelay={450} placement="right">
                  <IconButton style={styles.iconButton}>
                    <DashboardIcon style={{ color: 'white' }} />
                  </IconButton>
                </Tooltip>
              </Link>
              <Link to={'/transactions'}>
                <Tooltip title="Transactions" enterDelay={450} placement="right">
                  <IconButton style={styles.iconButton}>
                    <ListIcon style={{ color: 'white' }} />
                  </IconButton>
                </Tooltip>
              </Link>
              <Link to="/categories">
                <Tooltip title="Categories" enterDelay={450} placement="right">
                  <IconButton style={styles.iconButton}>
                    <LocalOfferIcon style={{ color: 'white' }} />
                  </IconButton>
                </Tooltip>
              </Link>
              <Link to="/changes">
                <Tooltip title="Changes" enterDelay={450} placement="right">
                  <IconButton style={styles.iconButton}>
                    <SwapHorizIcon style={{ color: 'white' }} />
                  </IconButton>
                </Tooltip>
              </Link>
              <Link to={'/analytics'}>
                <Tooltip title="Analytics" enterDelay={450} placement="right">
                  <IconButton style={styles.iconButton}>
                    <InsertChartOutlined style={{ color: 'white' }} />
                  </IconButton>
                </Tooltip>
              </Link>
            </List>
          </nav>
        ) : '' }

        <footer className="showMobile">
          { accounts.length >= 1 ?
            <div></div>
            : '' }
          <BottomNavigation value={valueMobile} onChange={this.handleChange}>
            <BottomNavigationAction showLabel={true} label="Dashboard" value="dashboard" icon={<DashboardIcon />} />
            <BottomNavigationAction showLabel={true} label="Transactions" value="transactions" icon={<ListIcon />} />
            <BottomNavigationAction showLabel={true} label="Categories" value="categories" icon={<LocalOfferIcon />} />
            <BottomNavigationAction showLabel={true} label="More" value="more" icon={<MoreHoriz />} />
          </BottomNavigation>
          <Popover
            id={id}
            open={open}
            onClose={this.handleClosePopover}
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}>
            <List style={{ padding: 0, margin: 0 }}>
              <Link to='/changes'>
                <ListItem button>
                  <ListItemIcon>
                    <SwapHorizIcon />
                  </ListItemIcon>
                  <ListItemText primary='Changes' />
                </ListItem>
              </Link>
              <Link to='/analytics'>
                <ListItem button>
                  <ListItemIcon>
                    <InsertChartOutlined />
                  </ListItemIcon>
                  <ListItemText primary='Analytics' />
                </ListItem>
              </Link>
            </List>
          </Popover>
        </footer>
      </div>
    );
  }
}



Navigation.propTypes = {
  accounts: PropTypes.array,
};

const mapStateToProps = (state, ownProps) => {
  return {
    accounts: state.user.accounts
  };
};

export default connect(mapStateToProps)(Navigation);