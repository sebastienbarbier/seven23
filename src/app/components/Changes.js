/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';
import moment from 'moment';

import { Card, CardText } from 'material-ui/Card';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn }
  from 'material-ui/Table';

import { orange800 } from 'material-ui/styles/colors';
import CircularProgress from 'material-ui/CircularProgress';

import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import { grey400 } from 'material-ui/styles/colors';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import ChangeForm from './changes/ChangeForm';

import ChangeActions from '../actions/ChangeActions';

import ChangeStore from '../stores/ChangeStore';
import CurrencyStore from '../stores/CurrencyStore';
import AccountStore from '../stores/AccountStore';

const styles = {
  alignRight: {
    textAlign: 'right',
  },
  actions: {
    width: '20px',
  },
  loading: {
    textAlign: 'center',
    padding: '50px 0',
  },
};

const iconButtonElement = (
  <IconButton
    touch={true}
  >
    <MoreVertIcon color={grey400} />
  </IconButton>
);


class Changes extends Component {

  constructor() {
    super();
    this.state = {
      changes: null,
      selectedChange: {},
      selectedCurrency: CurrencyStore.getSelectedCurrency(),
      isLoading: true,
      open: false,
    };
  }

  handleOpenChange = (change = {}) => {
    this.setState({
      selectedChange: change,
      open: true,
    });
  };

  handleDuplicateChange = (change) => {
    let duplicatedItem = {};
    for(var key in change){
      duplicatedItem[key] = change[key];
    }
    delete duplicatedItem.id;
    this.setState({
      selectedChange: duplicatedItem,
      open: true,
    });
  };

  handleDeleteChange = (change) => {
    ChangeActions.delete(change);
  };

  _updateChange = (changes) => {
    if (changes && Array.isArray(changes)) {
      this.setState({
        changes: changes,
        open: false,
      });
    } else {
      ChangeActions.read();
    }
  };

  _changeCurrency = () => {
    this.setState({
      selectedCurrency: CurrencyStore.getSelectedCurrency(),
      open: false,
      isLoading: true,
    });
    ChangeActions.read();
  };

  componentWillMount() {
    ChangeStore.addChangeListener(this._updateChange);
    AccountStore.addChangeListener(this._changeCurrency);
  }

  componentDidMount() {
    // Timout allow allow smooth transition in navigation
    setTimeout(() => {
      ChangeActions.read();
    }, 350);
  }

  componentWillUnmount() {
    ChangeStore.removeChangeListener(this._updateChange);
    AccountStore.removeChangeListener(this._changeCurrency);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      open: false,
    });
  }

  render() {
    return (
      <div>
        <div className="changesLayout">
          <Card className="column">
            <div className="columnHeader">
              <header className="primaryColorBackground small">
                <h1 style={styles.headerTitle}>Changes</h1>
                <FloatingActionButton className="addButton" onTouchTap={this.handleOpenChange}>
                  <ContentAdd />
                </FloatingActionButton>
              </header>
              {
                !this.state.changes ?
                <div style={styles.loading}>
                  <CircularProgress />
                </div>
                :
                <article className="changeList">
                  <div className="changeHeader">
                    <div className="data">
                      <div className="top">
                        <div className="date">Date</div>
                        <div className="name">Name</div>
                      </div>
                      <div className="bottom">
                        <div className="local">Local amount</div>
                        <div className="new">New Amount</div>
                      </div>
                    </div>
                    <div className="actions"></div>
                  </div>
                  { [...this.state.changes].sort((a, b) => { return a.date > b.date ? -1 : 1;}).map((obj) => {
                    return (
                      <div key={obj.id} className="change">
                        <div className="data">
                          <div className="top">
                            <div className="date">{ moment(obj.date).format('DD MMM YY') }</div>
                            <div className="name">{ obj.name }</div>
                          </div>
                          <div className="bottom">
                            <div className="local">{ CurrencyStore.format(obj.local_amount, obj.local_currency) }</div>
                            <div className="new">{ CurrencyStore.format(obj.new_amount, obj.new_currency) }</div>
                          </div>
                        </div>
                        <div className="actions">
                          <IconMenu
                            iconButtonElement={iconButtonElement}
                            anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                            targetOrigin={{horizontal: 'right', vertical: 'top'}}>
                            <MenuItem onTouchTap={() => {this.handleOpenChange(obj); }}>Edit</MenuItem>
                            <MenuItem onTouchTap={() => {this.handleDuplicateChange(obj); }}>Duplicate</MenuItem>
                            <Divider></Divider>
                            <MenuItem onTouchTap={() => {this.handleDeleteChange(obj); }}>Delete</MenuItem>
                          </IconMenu>
                        </div>
                      </div>
                    );
                  })}
                </article>
              }
            </div>
          </Card>
        </div>

        <FloatingActionButton className="addButtonBottom" onTouchTap={this.handleOpenChange}>
          <ContentAdd />
        </FloatingActionButton>
        <ChangeForm change={this.state.selectedChange} open={this.state.open}></ChangeForm>
      </div>
    );
  }
}

export default Changes;
