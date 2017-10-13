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
  grid: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly'
  },
  items: {
    margin: '10px 10px',
    padding: '4px 20px 10px 20px',
    minWidth: '300px',
    flexGrow: '1'
  },
  title: {
    fontSize: '1.6em',
  },
  row: {
    rootElement: {
      listStyle: 'none',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '4px 10px 4px 15px'
    },
    text: {
      flexGrow: '1',
    },
    title: {
      fontSize: '1.6em',
      margin: '0 0 4px 0',
      fontWeight: '300'
    },
    subtitle: {
      display: 'flex',
      width: '100%',
      fontSize: '0.9em',
      flexDirection: 'row',
      justifyContent: 'space-between',
      color: '#666',
      textTransform: 'uppercase',
      fontWeight: '400'
    },
    span: {
      textTransform: 'capitalize',
    },
    warning: {
      display: 'inline',
      height: '17px',
      verticalAlign: 'top'
    },
    price: {
      width: '300px',
      fontSize: '1.2em',
      textAlign: 'right',
      fontWeight: '300'
    },
    menu: {
      width: '60px',
    }
  }
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
      change: {},
      pagination: 20,
      selectedCurrency: CurrencyStore.getSelectedCurrency(),
      usedCurrenciesOrdered: [],
      isLoading: true,
      primaryColor: props.muiTheme.palette.primary1Color,
      open: false
    };
    // Timer is a 300ms timer on read event to let color animation be smooth
    this.timer = null;
  }

  more = () => {
    this.setState({
      pagination: this.state.pagination + 20,
    });
  };

  handleOpenChange = (change = {}) => {
    this.setState({
      change: change,
      open: true,
    });
  };

  handleCloseChange = () => {
    this.setState({
      change: null,
      open: false,
    });
  };

  handleDuplicateChange = (change) => {
    let duplicatedItem = {};
    for(var key in change){
      duplicatedItem[key] = change[key];
    }
    delete duplicatedItem.id;
    this.setState({
      change: duplicatedItem,
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
        usedCurrency = CurrencyStore.currenciesArray.filter((item) => { return arrayOfUsedCurrency.indexOf(item.id) != -1 && item.id != this.state.selectedCurrency; });
      }
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
    return [
      <div className={'modalContent ' + (this.state.open ? 'open' : 'close')}>
        <Card>
          <ChangeForm
            change={this.state.change}
            onSubmit={this.handleCloseChange}
            onClose={this.handleCloseChange}
            >
          </ChangeForm>
        </Card>
      </div>
      ,
      <div className="columnContent">
        <div className="column">
          <Card className="card">
            <div className="cardContainer">
              <header className="padding">
                <h2>Changes</h2>
              </header>
            </div>
          </Card>

          <div>
            {
              !this.state.changes && !this.state.currencies ?
              <div style={styles.loading}>
                <CircularProgress />
              </div>
              :
              <div style={styles.grid}>
              { this.state.currencies.map((currency) => {
                return (
                  <Card key={currency.id} style={styles.items}>
                    { this.state.chain[0].rates.get(currency.id).get(this.state.selectedCurrency) ?
                      <div>
                        <h3 style={styles.title}>{ currency.name }</h3>
                        <p>{ CurrencyStore.format(1, currency.id )} : { CurrencyStore.format(this.state.chain[0].rates.get(currency.id).get(this.state.selectedCurrency)) }<br/>
                        <strong>{ CurrencyStore.format(1)} : { CurrencyStore.format(1/this.state.chain[0].rates.get(currency.id).get(this.state.selectedCurrency), currency.id) }</strong></p>
                      </div>
                      :
                      <div>
                        <h3 style={styles.title}>{ currency.name } (second degree)</h3>
                        <p>{ CurrencyStore.format(1, currency.id )} : { CurrencyStore.format(this.state.chain[0].secondDegree.get(currency.id).get(this.state.selectedCurrency)) }<br/>
                        <strong>{ CurrencyStore.format(1)} : { CurrencyStore.format(1/this.state.chain[0].secondDegree.get(currency.id).get(this.state.selectedCurrency), currency.id) }</strong></p>
                      </div>
                    }
                  </Card>
                )})
              }
              </div>
            }
          </div>

          {
            !this.state.changes && !this.state.currencies ?
            <div style={styles.loading}>
            </div>
            :
            <div style={{display: 'flex', flexDirection: 'row-reverse', padding: '10px 30px 0 0'}}>
              <FlatButton
                label="New exchange"
                primary={true}
                icon={<ContentAdd />}
                onTouchTap={this.handleOpenChange}
              />
            </div>
          }

          <div style={{padding: '0 10px 40px 10px'}}>
            {
              !this.state.changes && !this.state.currencies ?
              <div style={styles.loading}>
              </div>
              :
              <ul style={{padding: '0 0 10px 0'}}>
                { [...this.state.changes].sort((a, b) => { return a.date < b.date ? 1 : -1 }).filter((item, index) => { return !this.state.pagination || index < this.state.pagination; }).map((obj) => {
                  return (
                    <li key={obj.id} style={styles.row.rootElement}>
                      <div style={styles.row.text}>
                        <p style={styles.row.title}>{ obj.name }</p>
                        <div style={styles.row.subtitle}>
                          <p style={{margin: 0}}>
                            { moment(obj.date).format('DD MMM YY') }
                          </p>
                        </div>
                      </div>
                      <p style={styles.row.price}>{ CurrencyStore.format(obj.local_amount, obj.local_currency) } > { CurrencyStore.format(obj.new_amount, obj.new_currency) }</p>
                      <div style={styles.row.menu}>
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
                    </li>
                  );
                })}
              </ul>
            }

          { this.state.changes && this.state.pagination < this.state.changes.length ?
            <div style={{padding: '0 40px 0 0'}}>
              <FlatButton
                label="More"
                onTouchTap={this.more}
                fullWidth={true} />
            </div>
            : '' }
            </div>
        </div>
      </div>
    ];
  }
}


export default muiThemeable()(Changes);
