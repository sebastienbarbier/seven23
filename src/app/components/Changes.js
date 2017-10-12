/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import muiThemeable from 'material-ui/styles/muiThemeable';

import { Card, CardText } from 'material-ui/Card';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn }
  from 'material-ui/Table';

import { orange800, grey400 } from 'material-ui/styles/colors';
import CircularProgress from 'material-ui/CircularProgress';

import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import FlatButton from 'material-ui/FlatButton';
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

  constructor(props) {
    super();
    this.state = {
      changes: null,
      chain: null,
      currencies: null, // List of used currency
      selectedChange: {},
      selectedCurrency: CurrencyStore.getSelectedCurrency(),
      usedCurrenciesOrdered: [],
      isLoading: true,
      primaryColor: props.muiTheme.palette.primary1Color,
      open: false,
    };
    // Timer is a 300ms timer on read event to let color animation be smooth
    this.timer = null;
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

    // Timeout of 350 is used to let perform CSS transition on toolbar
  _updateChange = (changes) => {
    if (this.timer) {
      // calculate duration
      const duration = (new Date().getTime()) - this.timer;
      this.timer = null; // reset timer
      if (duration < 350) {
        setTimeout(() => {
          this._performUpdateChange(changes);
        }, 350 - duration);
      } else {
        this._performUpdateChange(changes);
      }
    } else {
      this._performUpdateChange(changes);
    }
  };

  _performUpdateChange = (changes) => {
    if (changes && changes.changes && Array.isArray(changes.changes)) {

      let usedCurrency = [];
      if (changes.chain && changes.chain.length) {
        const arrayOfUsedCurrency = Array.from(changes.chain[0].rates.keys());
        console.log(this.state.selectedCurrency);
        usedCurrency = CurrencyStore.currenciesArray.filter((item) => { return arrayOfUsedCurrency.indexOf(item.id) != -1 && item.id != this.state.selectedCurrency; });
      }
      console.log(changes.chain);
      this.setState({
        changes: changes.changes,
        chain: changes.chain,
        currencies: usedCurrency,
        open: false
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
    this.timer = (new Date()).getTime();

    ChangeActions.read();
  }

  componentWillUnmount() {
    ChangeStore.removeChangeListener(this._updateChange);
    AccountStore.removeChangeListener(this._changeCurrency);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      open: false,
      primaryColor: nextProps.muiTheme.palette.primary1Color,
    });
  }

  render() {
    return (
      <div className="columnContent">
        <div className="column">
          <Card className="card">
            <div className="cardContainer">
              <header className="padding">
                <h2>Changes</h2>
              </header>
            </div>
          </Card>

          <FlatButton
            label="New exchange"
            primary={true}
            icon={<ContentAdd />}
            onTouchTap={this.handleOpenChange}
          />

          <div>
            {
              !this.state.changes && !this.state.currencies ?
              <div style={styles.loading}>
                <CircularProgress />
              </div>
              :
              <div>
              { this.state.currencies.map((currency) => {
                return (
                  <div key={currency.id}>
                    { this.state.chain[0].rates.get(currency.id).get(this.state.selectedCurrency) ?
                      <div>
                        <p>{ currency.name }</p>
                        <p>{ CurrencyStore.format(1, currency.id )} : { CurrencyStore.format(this.state.chain[0].rates.get(currency.id).get(this.state.selectedCurrency)) }</p>
                        <p>{ CurrencyStore.format(1)} : { CurrencyStore.format(1/this.state.chain[0].rates.get(currency.id).get(this.state.selectedCurrency), currency.id) }</p>
                      </div>
                      :
                      <div>
                        <p>{ currency.name } (second degree)</p>
                        <p>{ CurrencyStore.format(1, currency.id )} : { CurrencyStore.format(this.state.chain[0].secondDegree.get(currency.id).get(this.state.selectedCurrency)) }</p>
                        <p>{ CurrencyStore.format(1)} : { CurrencyStore.format(1/this.state.chain[0].secondDegree.get(currency.id).get(this.state.selectedCurrency), currency.id) }</p>
                      </div>
                    }
                  </div>
                )})
              }
              </div>
            }
          </div>

          <ChangeForm change={this.state.selectedChange} open={this.state.open}></ChangeForm>
        </div>
      </div>
    );
  }
}

// { [...this.state.changes].sort((a, b) => { return a.date > b.date ? -1 : 1;}).map((obj) => {
//   return (
//     <div key={obj.id} className="change">
//       <div className="data">
//         <div className="top">
//           <div className="date">{ moment(obj.date).format('DD MMM YY') }</div>
//           <div className="name">{ obj.name }</div>
//         </div>
//         <div className="bottom">
//           <div className="local">{ CurrencyStore.format(obj.local_amount, obj.local_currency) }</div>
//           <div className="new">{ CurrencyStore.format(obj.new_amount, obj.new_currency) }</div>
//         </div>
//       </div>
//       <div className="actions">
//         <IconMenu
//           iconButtonElement={iconButtonElement}
//           anchorOrigin={{horizontal: 'right', vertical: 'top'}}
//           targetOrigin={{horizontal: 'right', vertical: 'top'}}>
//           <MenuItem onTouchTap={() => {this.handleOpenChange(obj); }}>Edit</MenuItem>
//           <MenuItem onTouchTap={() => {this.handleDuplicateChange(obj); }}>Duplicate</MenuItem>
//           <Divider></Divider>
//           <MenuItem onTouchTap={() => {this.handleDeleteChange(obj); }}>Delete</MenuItem>
//         </IconMenu>
//       </div>
//     </div>
//   );
// })}

export default muiThemeable()(Changes);
