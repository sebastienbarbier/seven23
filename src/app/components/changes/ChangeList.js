import './ChangeList.scss';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';

import { withStyles } from '@material-ui/core/styles';

import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import IconButton from '@material-ui/core/IconButton';

import Divider from '@material-ui/core/Divider';

import MoreVertIcon from '@material-ui/icons/MoreVert';

import TrendingDown from '@material-ui/icons/TrendingDown';
import TrendingUp from '@material-ui/icons/TrendingUp';
import TrendingFlat from '@material-ui/icons/TrendingFlat';

import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';

import SwapHorizIcon from '@material-ui/icons/SwapHoriz';

import { Amount } from '../currency/Amount';

const styles = theme => ({
  icon: {
    fontSize: '20px',
  },
});

const ELEMENT_PER_PAGE = 20;

class ChangeList extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      changes: props.changes,
      pagination: ELEMENT_PER_PAGE,
      isLoading: props.isLoading,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      changes: nextProps.changes,
      isLoading: nextProps.isLoading,
    });
  }

  _openActionMenu = (event, change) => {
    this.setState({
      anchorEl: event.currentTarget,
      change,
    });
  };

  _closeActionMenu = () => {
    this.setState({ anchorEl: null });
  };

  _more = () => {
    this.setState({
      pagination: this.state.pagination + ELEMENT_PER_PAGE,
    });
  };

  sortChanges = (a, b) => {
    if (a.date > b.date) {
      return -1;
    } else if (a.date < b.date) {
      return 1;
    } else if (a.name > b.name) {
      return -1;
    }
    return 1;
  };


  render() {
    const { changes, isLoading, anchorEl, pagination } = this.state;
    const { selectedCurrency, currency, classes } = this.props;
    return (
      <div className="changes_list">
        { changes && !isLoading ?
          changes.sort(this.sortChanges).filter((item, index) => {
            return (
              !pagination || index < pagination
            );
          })
            .map(obj => {

              return (
                <div key={obj.id} className="changes_change">
                  <div className="changes_change_data">
                    <div className="date">
                      { moment(obj.date).format('DD MMM YY') }<br />

                      { obj.trend === 'up' ? <TrendingDown />  : '' }
                      { obj.trend === 'down' ? <TrendingUp />  : '' }
                      { obj.trend === 'flat' ? <TrendingFlat />  : '' }
                    </div>
                    <div className="description">
                      <strong>{ obj.name }</strong><br />
                      <small>{ currency && obj.local_currency.id == currency.id
                        ? <Amount value={obj.local_amount} currency={obj.local_currency} />
                        : <Amount value={obj.new_amount} currency={obj.new_currency} />
                      }
                      &nbsp;<Icon style={{ verticalAlign: 'bottom' }}><SwapHorizIcon className={classes.icon} fontSize='small' /></Icon>&nbsp;
                      { currency && obj.local_currency.id == currency.id
                        ? <Amount value={obj.new_amount} currency={obj.new_currency} />
                        : <Amount value={obj.local_amount} currency={obj.local_currency} />
                      }</small>
                      <div className="convertion">
                        <div><Amount value={1} currency={selectedCurrency} /> = <Amount value={obj.rate} currency={currency} accurate={obj.accurate} /></div>
                        <div><Amount value={1} currency={currency} /> = <Amount value={obj.rate ? 1 / obj.rate : null} currency={selectedCurrency} accurate={obj.accurate} /></div>
                      </div>
                    </div>
                  </div>
                  <div className="changes_change_actions">
                    <IconButton
                      onClick={(event) => this._openActionMenu(event, obj)}>
                      <MoreVertIcon />
                    </IconButton>
                  </div>
                </div>
              );
            })
          : [
            'w120',
            'w150',
            'w120',
            'w120',
            'w120',
            'w150',
            'w120',
            'w120',
          ].map((value, i) => {
            return (
              <div key={i} className="changes_change">
                <div className="changes_change_data">
                  <div className="date">
                    <span className="loading w50" />
                  </div>
                  <div className="description">
                    <strong><span className={`loading ${value}`}  /></strong><br />
                    <small>
                      <span className="loading w30" />
                      &nbsp;<Icon style={{ verticalAlign: 'bottom', opacity: 0.5 }}><SwapHorizIcon className={classes.icon} /></Icon>&nbsp;
                      <span className="loading w30" />
                    </small>
                    <div className="convertion">
                      <div><span className="loading w20" /> = <span className="loading w20" /></div>
                      <div><span className="loading w20" /> = <span className="loading w20" /></div>
                    </div>
                  </div>
                </div>
                <div className="changes_change_actions">
                  <IconButton disabled>
                    <MoreVertIcon />
                  </IconButton>
                </div>
              </div>
            );
          })
        }
        { changes && pagination < changes.length && !isLoading ? (
          <Button
            onClick={this._more}
            className="more">More</Button>
        ) : (
          ''
        )}

        <Menu
          anchorEl={ anchorEl }
          open={ Boolean(anchorEl) }
          onClose={this._closeActionMenu}>
          <MenuItem
            onClick={() => {
              this._closeActionMenu();
              this.props.onEditChange(this.state.change);
            }}
          >
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              this._closeActionMenu();
              this.props.onDuplicateChange(this.state.change);
            }}
          >
            Duplicate
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              this._closeActionMenu();
              this.props.onDeleteChange(this.state.change);
            }}
          >
            Delete
          </MenuItem>
        </Menu>

      </div>
    );
  }
}

ChangeList.propTypes = {
  classes: PropTypes.object.isRequired,
  selectedCurrency: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    selectedCurrency: state.currencies.find((c) => c.id === state.account.currency)
  };
};

export default connect(mapStateToProps)(withStyles(styles)(ChangeList));