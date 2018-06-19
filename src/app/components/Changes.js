/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';
import moment from 'moment';
import muiThemeable from 'material-ui/styles/muiThemeable';

import Card from '@material-ui/core/Card';

import { grey400 } from 'material-ui/styles/colors';

import LineGraph from './charts/LineGraph';

import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

import Button from '@material-ui/core/Button';
import ContentAdd from '@material-ui/icons/Add';
import SwapHorizIcon from '@material-ui/icons/SwapHoriz';

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
    justifyContent: 'space-between',
  },
  items: {
    margin: '10px 10px',
    padding: '4px 20px 10px 20px',
    minWidth: '260px',
    flexGrow: '1',
    position: 'relative',
  },
  title: {
    fontSize: '1.6em',
    zIndex: 10,
  },
  paragraph: {
    zIndex: 10,
  },
  notaccurate: {
    color: '#888',
    fontWeight: '400',
    fontSize: '0.5em',
  },
  row: {
    rootElement: {
      listStyle: 'none',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '4px 0px 8px 15px',
    },
    text: {
      flexGrow: '1',
    },
    title: {
      fontSize: '16px',
      margin: '0 0 4px 0',
    },
    subtitle: {
      display: 'flex',
      width: '100%',
      fontSize: '14px',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    span: {
      textTransform: 'capitalize',
    },
    warning: {
      display: 'inline',
      height: '17px',
      verticalAlign: 'top',
    },
    price: {
      fontSize: '15px',
      textAlign: 'right',
    },
    menu: {
      width: '60px',
    },
  },
  changeIcon: {
    verticalAlign: 'bottom',
    position: 'relative',
    top: '2px',
    paddingLeft: '10px',
    paddingRight: '10px',
  },
  graph: {
    position: 'absolute',
    opacity: '0.5',
    bottom: '0%',
    height: '60px',
    left: '50%',
    right: '0px',
    zIndex: 1,
  },
};

const iconButtonElement = (
  <IconButton touch={true}>
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
      graph: {},
      pagination: 20,
      selectedCurrency: CurrencyStore.getSelectedCurrency(),
      usedCurrenciesOrdered: [],
      isLoading: true,
      component: null,
      primaryColor: props.muiTheme.palette.primary1Color,
      open: false,
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
    const component = (
      <ChangeForm
        change={this.state.change}
        onSubmit={this.handleCloseChange}
        onClose={this.handleCloseChange}
      />
    );
    this.setState({
      change: change,
      component: component,
      open: true,
    });
  };

  handleCloseChange = () => {
    this.setState({
      change: null,
      component: null,
      open: false,
    });
    ChangeActions.read();
  };

  handleDuplicateChange = change => {
    let duplicatedItem = {};
    for (var key in change) {
      duplicatedItem[key] = change[key];
    }
    delete duplicatedItem.id;
    this.setState({
      change: duplicatedItem,
      open: true,
    });
  };

  handleDeleteChange = change => {
    ChangeActions.delete(change);
  };

  // Timeout of 350 is used to let perform CSS transition on toolbar
  _updateChange = changes => {
    if (this.timer) {
      // calculate duration
      const duration = new Date().getTime() - this.timer;
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

  _performUpdateChange = changes => {
    if (changes && changes.changes && Array.isArray(changes.changes)) {
      let usedCurrency = [];
      if (changes.chain && changes.chain.length) {
        const arrayOfUsedCurrency = Array.from(changes.chain[0].rates.keys());
        usedCurrency = CurrencyStore.currenciesArray.filter(item => {
          return (
            arrayOfUsedCurrency.indexOf(item.id) != -1 &&
            item.id != this.state.selectedCurrency
          );
        });
      }

      let graph = {};

      changes.chain.forEach(block => {
        // console.log(block.date);
        Array.from(block.rates.entries()).forEach(rates => {
          if (rates[0] != this.state.selectedCurrency) {
            // console.log(rates[0], rates[1]);
            let r = rates[1].get(this.state.selectedCurrency);
            // console.log(r);
            if (!r && block.secondDegree) {
              r = block.secondDegree.get(rates[0])
                ? block.secondDegree
                  .get(rates[0])
                  .get(this.state.selectedCurrency)
                : null;
            }

            if (r) {
              if (!graph['' + rates[0]]) {
                graph['' + rates[0]] = [];
              }
              // console.log(this.state.selectedCurrency, rates[0], r);
              graph['' + rates[0]].push({ date: block.date, value: 1 / r });
            }
          }
        });
      });

      this.setState({
        changes: changes.changes,
        chain: changes.chain,
        graph: graph,
        currencies: usedCurrency,
        open: false,
      });
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
    this.timer = new Date().getTime();

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
      <div
        key="modal"
        className={'modalContent ' + (this.state.open ? 'open' : 'close')}
      >
        <Card>{this.state.component}</Card>
      </div>,
      <div key="content" className="columnContent">
        <div className="column">
          <Card
            className="card"
            style={{ marginLeft: '10px', marginRight: '10px' }}
          >
            <div className="cardContainer">
              <header className="padding">
                <h2>Changes</h2>
              </header>
            </div>
          </Card>

          <div style={styles.grid}>
            {this.state.changes && this.state.currencies
              ? this.state.currencies.map(currency => {
                return (
                  <Card key={currency.id} style={styles.items}>
                    {this.state.chain[0].rates
                      .get(currency.id)
                      .get(this.state.selectedCurrency) ? (
                        <div>
                          <h3 style={styles.title}>{currency.name}</h3>
                          <p style={styles.paragraph}>
                            {CurrencyStore.format(1, currency.id)} :{' '}
                            {CurrencyStore.format(
                              this.state.chain[0].rates
                                .get(currency.id)
                                .get(this.state.selectedCurrency),
                            )}
                            <br />
                            <strong>
                              {CurrencyStore.format(1)} :{' '}
                              {CurrencyStore.format(
                                1 /
                                  this.state.chain[0].rates
                                    .get(currency.id)
                                    .get(this.state.selectedCurrency),
                                currency.id,
                              )}
                            </strong>
                          </p>
                        </div>
                      ) : (
                        <div>
                          <h3 style={styles.title}>
                            {currency.name}{' '}
                            <small style={styles.notaccurate}>
                              Not accurate
                            </small>
                          </h3>
                          <p style={styles.paragraph}>
                            {CurrencyStore.format(1, currency.id)} :{' '}
                            {this.state.chain[0].secondDegree.length
                              ? CurrencyStore.format(
                                this.state.chain[0].secondDegree
                                  .get(currency.id)
                                  .get(this.state.selectedCurrency),
                              )
                              : ''}
                            <br />
                            <strong>
                              {CurrencyStore.format(1)} :{' '}
                              {this.state.chain[0].secondDegree.length
                                ? CurrencyStore.format(
                                  1 /
                                      this.state.chain[0].secondDegree
                                        .get(currency.id)
                                        .get(this.state.selectedCurrency),
                                  currency.id,
                                )
                                : ''}
                            </strong>
                          </p>
                        </div>
                      )}
                    <div style={styles.graph}>
                      {this.state.graph[currency.id] ? (
                        <LineGraph
                          values={[{ values: this.state.graph[currency.id] }]}
                        />
                      ) : (
                        ''
                      )}
                    </div>
                  </Card>
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
                  <Card key={i} style={styles.items}>
                    <div>
                      <h3 style={styles.title}>
                        <span className={`loading ${value}`} />
                      </h3>
                      <p style={styles.paragraph}>
                        <span className="loading w50" />{' '}
                        <span className="loading w30" />
                        <br />
                        <strong>
                          <span className="loading w30" />{' '}
                          <span className="loading w50" />
                        </strong>
                      </p>
                    </div>
                    <div style={styles.graph} />
                  </Card>
                );
              })}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'row-reverse',
              padding: '10px 30px 0 0',
            }}
          >
            <Button
              primary={true}
              disabled={!this.state.changes && !this.state.currencies}
              onClick={this.handleOpenChange}>
              <ContentAdd /> New exchange
            </Button>
          </div>

          <div style={{ padding: '0 0px 40px 0px' }}>
            <ul style={{ padding: '0 0 10px 0' }}>
              {this.state.changes && this.state.currencies
                ? [...this.state.changes]
                  .sort((a, b) => {
                    return a.date < b.date ? 1 : -1;
                  })
                  .filter((item, index) => {
                    return (
                      !this.state.pagination || index < this.state.pagination
                    );
                  })
                  .map(obj => {
                    return (
                      <li key={obj.id} style={styles.row.rootElement}>
                        <div style={styles.row.text}>
                          <p style={styles.row.title}>{obj.name}</p>
                          <div style={styles.row.subtitle}>
                            <p style={{ margin: 0 }}>
                              {moment(obj.date).format('DD MMM YY')}
                            </p>
                          </div>
                        </div>
                        <p style={styles.row.price}>
                          {CurrencyStore.format(
                            obj.local_amount,
                            obj.local_currency,
                          )}{' '}
                          <SwapHorizIcon style={styles.changeIcon} />{' '}
                          {CurrencyStore.format(
                            obj.new_amount,
                            obj.new_currency,
                          )}
                        </p>
                        <div style={styles.row.menu}>
                          <IconMenu
                            iconButtonElement={iconButtonElement}
                            anchorOrigin={{
                              horizontal: 'right',
                              vertical: 'top',
                            }}
                            targetOrigin={{
                              horizontal: 'right',
                              vertical: 'top',
                            }}
                          >
                            <MenuItem
                              onClick={() => {
                                this.handleOpenChange(obj);
                              }}
                            >
                              Edit
                            </MenuItem>
                            <MenuItem
                              onClick={() => {
                                this.handleDuplicateChange(obj);
                              }}
                            >
                              Duplicate
                            </MenuItem>
                            <Divider />
                            <MenuItem
                              onClick={() => {
                                this.handleDeleteChange(obj);
                              }}
                            >
                              Delete
                            </MenuItem>
                          </IconMenu>
                        </div>
                      </li>
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
                    <li key={i} style={styles.row.rootElement}>
                      <div style={styles.row.text}>
                        <p style={styles.row.title}>
                          <span className={`loading ${value}`} />
                        </p>
                        <div style={styles.row.subtitle}>
                          <p style={{ margin: 0 }}>
                            <span className="loading w50" />
                          </p>
                        </div>
                      </div>
                      <p style={styles.row.price}>
                        <span className="loading w30" />
                      </p>
                      <div style={styles.row.menu}>
                        <IconMenu
                          iconButtonElement={
                            <IconButton touch={true} disabled={true}>
                              <MoreVertIcon color={grey400} />
                            </IconButton>
                          }
                        />
                      </div>
                    </li>
                  );
                })}
            </ul>

            {this.state.changes &&
            this.state.pagination < this.state.changes.length ? (
                <div style={{ padding: '0 40px 0 0' }}>
                  <Button onClick={this.more} fullWidth={true}>More</Button>
                </div>
              ) : (
                ''
              )}
          </div>
        </div>
      </div>,
    ];
  }
}

export default muiThemeable()(Changes);
