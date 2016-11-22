/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';
import moment from 'moment';

import { Card, CardText } from 'material-ui/Card';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn}
  from 'material-ui/Table';

import {orange800} from 'material-ui/styles/colors';

import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import {grey400} from 'material-ui/styles/colors';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import ChangeForm from './changes/ChangeForm';

import ChangeActions from '../actions/ChangeActions';

import ChangeStore from '../stores/ChangeStore';
import CurrencyStore from '../stores/CurrencyStore';
import AccountStore from '../stores/AccountStore';

const styles = {
  header: {
    margin: '5px 0px',
    color: 'white',
    background: orange800,
    padding: '20px 0px 30px 20px',
  },
  headerTitle: {
    color: 'white',
    fontSize: '4em',
  },
  headerText: {
    color: 'white',
  },
  buttonFloating: {
    position: 'absolute',
    right: '85px',
  },
  boxPadding: {
    marginBottom: '10px',
    textAlign: 'left',
  },
  alignRight: {
    textAlign: 'right',
  },
  button: {
    float: 'right',
    marginTop: '18px',
    marginRight: '10px',
  },
  actions: {
    width: '20px',
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
      changes: new Set(ChangeStore.changes),
      selectedCurrency: CurrencyStore.getSelectedCurrency(),
      selectedChange: {},
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

  _updateData = () => {
    this.setState({
      changes: new Set(ChangeStore.changes),
      open: false,
    });
  };

  _changeCurrency = () => {
    this.setState({
      selectedCurrency: CurrencyStore.getSelectedCurrency(),
      open: false,
    });
  };

  componentWillMount() {
    ChangeStore.addChangeListener(this._updateData);
    AccountStore.addChangeListener(this._changeCurrency);
  }

  componentWillUnmount() {
    ChangeStore.removeChangeListener(this._updateData);
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
          <Card style={styles.header}>
            <CardText style={styles.headerText}>
              <h1 style={styles.headerTitle}>Changes</h1>
            </CardText>
            <FloatingActionButton onTouchTap={this.handleOpenChange} style={styles.buttonFloating}>
              <ContentAdd />
            </FloatingActionButton>
          </Card>
          <Card style={styles.boxPadding}>
            <CardText>
              <Table>
                <TableHeader
                  displaySelectAll={false}
                  adjustForCheckbox={false}>
                  <TableRow>
                    <TableHeaderColumn>Date</TableHeaderColumn>
                    <TableHeaderColumn>Name</TableHeaderColumn>
                    <TableHeaderColumn style={styles.alignRight}>Local amount</TableHeaderColumn>
                    <TableHeaderColumn>New Amount</TableHeaderColumn>
                    <TableHeaderColumn style={styles.actions}></TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody
                  displayRowCheckbox={false}
                  showRowHover={true}
                  stripedRows={false}
                >
                { [...this.state.changes].sort((a, b) => { return a.date > b.date ? -1 : 1;}).map((obj) => {
                  return (
                    <TableRow key={obj.id}>
                      <TableRowColumn>{ moment(obj.date).format('DD MMM YYYY') }</TableRowColumn>
                      <TableRowColumn>{ obj.name }</TableRowColumn>
                      <TableRowColumn style={styles.alignRight}>
                        { CurrencyStore.format(obj.local_amount, obj.local_currency) }
                      </TableRowColumn>
                      <TableRowColumn>{ CurrencyStore.format(obj.new_amount, obj.new_currency) }</TableRowColumn>
                      <TableRowColumn style={styles.actions}>
                        <IconMenu
                          iconButtonElement={iconButtonElement}
                          anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                          targetOrigin={{horizontal: 'right', vertical: 'top'}}>
                          <MenuItem onTouchTap={() => {this.handleOpenChange(obj); }}>Edit</MenuItem>
                          <MenuItem onTouchTap={() => {this.handleDuplicateChange(obj); }}>Duplicate</MenuItem>
                          <Divider></Divider>
                          <MenuItem onTouchTap={() => {this.handleDeleteChange(obj); }}>Delete</MenuItem>
                        </IconMenu>
                      </TableRowColumn>
                    </TableRow>
                  );
                })}
                </TableBody>
              </Table>
            </CardText>
          </Card>
          <ChangeForm change={this.state.selectedChange} open={this.state.open}></ChangeForm>
      </div>
    );
  }
}

/*

<Card style={styles.boxPadding}>
  <CardText>
    { [...ChangeStore.chain[0].rates.get(this.state.selectedCurrency).keys()].map((key) => {
      return <p key={key}>{ CurrencyStore.get(key).name }</p>
    }) }
  </CardText>
</Card>

 */

export default Changes;
