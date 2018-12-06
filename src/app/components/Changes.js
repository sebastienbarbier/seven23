/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';

import Card from '@material-ui/core/Card';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import Button from '@material-ui/core/Button';
import ContentAdd from '@material-ui/icons/Add';
import SwapHorizIcon from '@material-ui/icons/SwapHoriz';

import LineGraph from './charts/LineGraph';
import ChangeForm from './changes/ChangeForm';

import ChangeActions from '../actions/ChangeActions';

import { Amount } from './currency/Amount';

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

const ELEMENT_PER_PAGE = 20;

class Changes extends Component {
  constructor(props) {
    super();
    this.props = props;
    this.state = {
      changes: null,
      chain: null,
      currencies: null, // List of used currency
      change: null,
      graph: {},
      pagination: ELEMENT_PER_PAGE,
      isLoading: true,
      component: null,
      open: false,
    };
  }

  more = () => {
    this.setState({
      pagination: this.state.pagination + ELEMENT_PER_PAGE,
    });
  };

  handleOpenChange = (change = null) => {
    const component = (
      <ChangeForm
        change={change || this.state.change}
        onSubmit={this.handleCloseChange}
        onClose={this.handleCloseChange}
      />
    );
    this.setState({
      open: true,
      change: change,
      component: component,
    });
  };

  handleCloseChange = () => {
    this.setState({
      change: null,
      open: false,
      component: null,
    });
  };

  handleDuplicateChange = change => {
    let duplicatedItem = {};
    for (var key in change) {
      duplicatedItem[key] = change[key];
    }
    delete duplicatedItem.id;
    delete duplicatedItem.date;
    this.setState({
      change: duplicatedItem,
      open: true,
    });
  };

  handleDeleteChange = change => {
    this.props.dispatch(ChangeActions.delete(change));
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

    const { selectedCurrency } = this.props;

    changes.list.forEach((change) => {
      change.date = new Date(change.date);
    });
    changes.chain.forEach((change) => {
      change.date = new Date(change.date);
    });

    if (changes && changes.list && Array.isArray(changes.list)) {
      let usedCurrency = [];
      if (changes.chain && changes.chain.length) {
        const arrayOfUsedCurrency = Object.keys(changes.chain[0].rates);
        usedCurrency = this.props.currencies.filter(item => {
          return (
            arrayOfUsedCurrency.indexOf(`${item.id}`) != -1 &&
            item.id != selectedCurrency.id
          );
        });
      }

      let graph = {};

      changes.chain.forEach(block => {
        Object.keys(block.rates).forEach(key => {
          if (key != selectedCurrency.id) {
            let r = block.rates[key][selectedCurrency.id];
            if (!r && block.secondDegree) {
              r = block.secondDegree[key]
                ? block.secondDegree[key][selectedCurrency.id]
                : null;
            }

            if (r) {
              if (!graph[key]) {
                graph[key] = [];
              }
              graph[key].push({ date: block.date, value: 1 / r });
            }
          }
        });
      });

      this.setState({
        changes: changes.list,
        chain: changes.chain,
        graph: graph,
        currencies: usedCurrency,
        isLoading: false,
      });
    }
  };

  _openActionMenu = (event, item) => {
    this.setState({
      anchorEl: event.currentTarget,
      change: item
    });
  };

  _closeActionMenu = () => {
    this.setState({ anchorEl: null });
  };

  componentWillMount() {
    this._updateChange(this.props.changes);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.selectedCurrency.id != nextProps.selectedCurrency.id ||
        this.props.isSyncing != nextProps.isSyncing) {
      this.setState({
        isLoading: true,
        changes: null,
        chain: null,
        graph: null,
        currencies: null,
      });
    }
    setTimeout(() => this._updateChange(nextProps.changes), 100);
  }

  render() {
    const { anchorEl, open, changes, isLoading } = this.state;
    const { isSyncing, selectedCurrency, currencies } = this.props;

    return [
      <div
        key="modal"
        className={'modalContent ' + (open ? 'open' : 'close') }
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
              <header style={{ margin: 0}}>
                <h2 style={{ color: 'white' }}>Changes</h2>
              </header>
            </div>
          </Card>

          <div style={styles.grid}>
            {changes && this.state.currencies && !isLoading && !isSyncing
              ? this.state.currencies.map(currency => {
                return (
                  <Card key={currency.id} style={styles.items}>
                    {this.state.chain[0].rates[currency.id][selectedCurrency.id] ? (
                      <div>
                        <h3 style={styles.title}>{currency.name}</h3>
                        <p style={styles.paragraph}>
                          <Amount value={1} currency={currency} /> :{' '}
                          <Amount value={this.state.chain[0].rates[currency.id][selectedCurrency.id]} currency={selectedCurrency} />
                          <br />
                          <strong>
                            <Amount value={1} currency={selectedCurrency} /> :{' '}
                            <Amount value={1 /
                                this.state.chain[0].rates[currency.id][selectedCurrency.id]} currency={currency} />
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
                          <Amount value={1} currency={currency} /> :{' '}
                          <Amount value={this.state.chain[0].secondDegree[currency.id][selectedCurrency.id]} currency={selectedCurrency} />

                          <br />
                          <strong>
                            <Amount value={1} currency={selectedCurrency} /> :{' '}
                            <Amount value={1 /
                              this.state.chain[0].secondDegree[currency.id][selectedCurrency.id]} currency={currency} />
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
              color="primary"
              disabled={!changes && !this.state.currencies}
              onClick={() => this.handleOpenChange()}>
              <ContentAdd style={{ marginRight: '6px' }} /> New exchange
            </Button>
          </div>

          <div style={{ padding: '0 0px 40px 0px' }}>
            <ul style={{ padding: '0 0 10px 0' }}>
              { changes && this.state.currencies && !isLoading && !isSyncing ?
                changes.filter((item, index) => {
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
                              { moment(obj.date).format('DD MMM YY') }
                            </p>
                          </div>
                        </div>
                        <p style={styles.row.price}>
                          <Amount value={obj.local_amount} currency={currencies.find(c => c.id === obj.local_currency)} />
                          <SwapHorizIcon style={styles.changeIcon} />{' '}
                          <Amount value={obj.new_amount} currency={currencies.find(c => c.id === obj.new_currency)} />
                        </p>
                        <div style={styles.row.menu}>
                          <IconButton
                            onClick={(event) => this._openActionMenu(event, obj)}>
                            <MoreVertIcon />
                          </IconButton>
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
                        <IconButton disabled>
                          <MoreVertIcon />
                        </IconButton>
                      </div>
                    </li>
                  );
                })}
            </ul>
            <Menu
              anchorEl={ anchorEl }
              open={ Boolean(anchorEl) }
              onClose={this._closeActionMenu}>
              <MenuItem
                onClick={() => {
                  this._closeActionMenu();
                  this.handleOpenChange(this.state.change);
                }}
              >
                Edit
              </MenuItem>
              <MenuItem
                onClick={() => {
                  this._closeActionMenu();
                  this.handleDuplicateChange(this.state.change);
                }}
              >
                Duplicate
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={() => {
                  this._closeActionMenu();
                  this.handleDeleteChange(this.state.change);
                }}
              >
                Delete
              </MenuItem>
            </Menu>

            {changes && this.state.pagination < changes.length && !isLoading && !isSyncing ? (
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

Changes.propTypes = {
  changes: PropTypes.object.isRequired,
  currencies: PropTypes.array.isRequired,
  account: PropTypes.object.isRequired,
  selectedCurrency: PropTypes.object.isRequired,
  isSyncing: PropTypes.bool.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    changes: state.changes,
    list: state.changes.list,
    currencies: state.currencies,
    account: state.account,
    isSyncing: state.server.isSyncing,
    selectedCurrency: state.currencies.find((c) => c.id === state.account.currency)
  };
};

export default connect(mapStateToProps)(Changes);
