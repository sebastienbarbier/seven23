import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import red from '@material-ui/core/colors/red';
import orange from '@material-ui/core/colors/orange';
import green from '@material-ui/core/colors/green';

import LinearProgress from '@material-ui/core/LinearProgress';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import { Amount } from '../currency/Amount';

const styles = theme => ({
  card: {
    margin: '0 10px 20px 10px',
  },
  cardHeader: {
    background: theme.palette.cardheader
  },
  linearColorPrimaryRed: {
    backgroundColor: red[100],
  },
  linearBarColorPrimaryRed: {
    backgroundColor: red[500],
  },
  linearColorPrimaryGreen: {
    backgroundColor: green[100],
  },
  linearBarColorPrimaryGreen: {
    backgroundColor: green[500],
  },
  linearColorPrimaryOrange: {
    backgroundColor: orange[100],
  },
  linearBarColorPrimaryOrange: {
    backgroundColor: orange[500],
  },
});

class GoalList extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      anchorEl: null,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({});
  }

  _openActionMenu = (event, goal) => {
    this.setState({
      anchorEl: event.currentTarget,
      selectedGoal: goal
    });
  };

  _closeActionMenu = () => {
    this.setState({ anchorEl: null });
  };

  render() {

    const { isLoading, goals, categories, selectedCurrency, currencies, classes, onEdit, onDelete } = this.props;
    const { anchorEl } = this.state;

    return (
      <div style={{ width: '100%' }}>
        { isLoading ? (
          <ul>
            {[
              'w120',
              'w120',
              'w80',
              'w120',
              'w80',
              'w150',
            ].map((value, i) => {
              return (
                <li key={i}  style={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                    <span className={'loading ' + value} /><br />
                  </div>
                  { onEdit && onDelete &&
                  <IconButton disabled={true} style={{ flexGrow: 0, margin: '2px 10px' }}>
                    <MoreVertIcon fontSize="small" color="action" />
                  </IconButton> }
                </li>
              );
            })}
          </ul>
        ) : '' }

        { !isLoading && (!goals || goals.length == 0) ? (
          <p>No goals</p>
        ) : '' }


        { !isLoading && goals && goals.length ?
          <ul style={{ padding: 0, listStyle: 'none' }}>
            { goals && goals.map(goal => {
              var categorie_name = goal.category ? categories.find(category => {
                return '' + category.id === '' + goal.category;
              }).name : null;
              var currency = goal.currency != selectedCurrency.id ? currencies.find(currency => {
                return '' + currency.id === '' + goal.currency;
              }) : null;
              var { pourcentage } = goal;
              return (
                <li key={goal.id}>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between',}}>
                      <span>{ categorie_name } { currency ? <small> (<Amount value={ goal.original_amount } currency={ currency } />)</small> : '' }</span>
                      <span>
                        <Amount value={ goal.sum } currency={ selectedCurrency } /> / <Amount value={ goal.amount } currency={ selectedCurrency } />
                      </span>
                    </div>
                    <LinearProgress
                      variant="determinate"
                      value={pourcentage}
                      classes={{
                        colorPrimary: pourcentage < 100 ? (pourcentage < 80 ? classes.linearColorPrimaryGreen : classes.linearColorPrimaryOrange) : classes.linearColorPrimaryRed,
                        barColorPrimary: pourcentage < 100 ? (pourcentage < 80 ? classes.linearBarColorPrimaryGreen : classes.linearBarColorPrimaryOrange) : classes.linearBarColorPrimaryRed,
                      }}
                      style={{ width: '100%', marginTop: 4 }} /><br />

                  </div>
                  { onEdit && onDelete &&
                    <IconButton onClick={(event) => this._openActionMenu(event, goal)} style={{ flexGrow: 0, margin: '2px 10px' }}>
                      <MoreVertIcon fontSize="small" color="action" />
                    </IconButton>
                  }
                </li>
              );
            }) }
          </ul> : ''
        }

        { onEdit && onDelete ?
          <Menu
            anchorEl={ anchorEl }
            open={ Boolean(anchorEl) }
            onClose={this._closeActionMenu}
          >
            <MenuItem
              onClick={() => {
                this._closeActionMenu();
                onEdit(this.state.selectedGoal);
              }}
            >
              Edit
            </MenuItem>
            <MenuItem
              onClick={() => {
                this._closeActionMenu();
                onDelete(this.state.selectedGoal);
              }}
            >
              Delete
            </MenuItem>
          </Menu>
          : '' }
      </div>
    );
  }
}

GoalList.propTypes = {
  goals: PropTypes.array,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  classes: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  categories: PropTypes.array.isRequired,
  currencies: PropTypes.array.isRequired,
  selectedCurrency: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    categories: state.categories.list,
    currencies: state.currencies,
    selectedCurrency: state.currencies.find((c) => c.id === state.account.currency),
  };
};



export default connect(mapStateToProps)(withStyles(styles)(GoalList));