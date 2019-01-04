/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';

import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';

import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import Toolbar from '@material-ui/core/Toolbar';
import Fab from '@material-ui/core/Fab';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';

import TrendingDown from '@material-ui/icons/TrendingDown';
import TrendingUp from '@material-ui/icons/TrendingUp';
import TrendingFlat from '@material-ui/icons/TrendingFlat';

import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import ContentAdd from '@material-ui/icons/Add';

import SwapHorizIcon from '@material-ui/icons/SwapHoriz';

import LineGraph from './charts/LineGraph';
import ChangeForm from './changes/ChangeForm';

import CurrencySelector from './currency/CurrencySelector';
import ChangeActions from '../actions/ChangeActions';

import { Amount } from './currency/Amount';

const styles = theme => ({
  fab: {
    margin: theme.spacing.unit,
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  cardHeader: {
    background: theme.palette.cardheader
  },
  icon: {
    fontSize: '20px',
  },
  // Legacy
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
  graph: {
    position: 'absolute',
    opacity: '0.5',
    bottom: '0%',
    height: '60px',
    left: '50%',
    right: '0px',
    zIndex: 1,
  },
});

const ELEMENT_PER_PAGE = 20;

class Changes extends Component {
  constructor(props) {
    super();
    this.props = props;
    this.history = props.history;
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

    const component = (
      <ChangeForm
        change={duplicatedItem}
        onSubmit={this.handleCloseChange}
        onClose={this.handleCloseChange}
      />
    );

    this.setState({
      change: duplicatedItem,
      open: true,
      component: component,
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

    const { selectedCurrency, currencies } = this.props;
    let list = [];
    const currency = currencies.find(c => c.id === parseInt(this.props.match.params.id));
    let previousRate = null;

    changes.chain.filter((item, index) => {
      return Boolean(currency) == false || (item.local_currency === currency.id || item.new_currency === currency.id);
    }).sort((a, b) => a.date < b.date ? -1 : 1).forEach((change) => {
      const tmp = Object.assign({}, change);
      tmp.date = new Date(change.date);
      tmp.local_currency = currencies.find(c => c.id === change.local_currency);
      tmp.new_currency = currencies.find(c => c.id === change.new_currency);

      if (currency) {
        if (change.rates[selectedCurrency.id] && change.rates[selectedCurrency.id][currency.id]) {
          tmp.rate = change.rates[selectedCurrency.id][currency.id];
          tmp.accurate = true;
        } else if (change.secondDegree[selectedCurrency.id] && change.secondDegree[selectedCurrency.id][currency.id]) {
          tmp.rate = change.secondDegree[selectedCurrency.id][currency.id];
          tmp.accurate = false;
        }

        if (!previousRate) {
          previousRate = tmp.rate;
        } else {
          if (tmp.rate < previousRate) {
            tmp.trend = 'up';
          } else if  (tmp.rate > previousRate) {
            tmp.trend = 'down';
          } else if (tmp.rate === previousRate) {
            tmp.trend = 'flat';
          }
          previousRate = tmp.rate;
        }
      }

      list.push(tmp);
    });

    list.sort((a, b) => a.date < b.date ? 1 : -1);

    if (list) {
      let usedCurrency = [];
      if (list && list.length) {
        const arrayOfUsedCurrency = Object.keys(changes.chain[0].rates);
        usedCurrency = currencies.filter(item => {
          return (
            arrayOfUsedCurrency.indexOf(`${item.id}`) != -1 &&
            item.id != selectedCurrency.id
          );
        });
      }

      let graph = {};

      list.forEach(block => {
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
        changes: list,
        chain: list,
        graph: graph,
        currencies: usedCurrency,
        isLoading: false,
        currency: currency,
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
    const { isSyncing, selectedCurrency, classes } = this.props;

    const tmpCurrency = this.state.currency;

    return [
      <div
        key="modal"
        className={'modalContent ' + (open ? 'open' : 'close') }
      >
        <Card className="modalContentCard">{this.state.component}</Card>
      </div>,
      <div key="content" className="sideListContent">
        <div className={tmpCurrency ? 'hideOnMobile column' : 'column'}>
          <Card square className="card" >
            <div className="cardContainer">
              <article>
                <div>
                  <CardHeader
                    title="Changes"
                  />
                  <Divider />
                  <List>
                    <ListItem button
                      selected={Boolean(this.state.currency) === false}
                      disabled={isLoading || isSyncing}
                      onClick={(event) => {
                        this.setState({ currency: null });
                        this.history.push('/changes/');
                      }}
                    >
                      { this.state.currencies && !isLoading && !isSyncing ?
                        <ListItemText primary="All currencies" secondary={`${this.state.currencies.length} currencies`} /> :
                        <ListItemText primary={<span className="loading w120" />} secondary={<span className="loading w50" />} /> }
                      <KeyboardArrowRight  />
                    </ListItem>
                    {changes && this.state.currencies && !isLoading && !isSyncing
                      ? this.state.currencies.map(currency => {
                        return (
                          <ListItem button
                            key={currency.id}
                            selected={Boolean(this.state.currency) && this.state.currency.id === currency.id}
                            onClick={(event) => {
                              this.setState({ currency });
                              this.history.push('/changes/' + currency.id);
                            }}
                          >
                            <ListItemText primary={currency.name} secondary={currency.code} />
                            <KeyboardArrowRight  />
                          </ListItem>
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
                          <ListItem button
                            key={i}
                            disabled={true}

                          >
                            <ListItemText primary={<span className={`loading ${value}`} />} secondary={<span className="loading w50" />} />
                            <KeyboardArrowRight  />
                          </ListItem>
                        );
                      }) }
                  </List>
                </div>
              </article>
            </div>
          </Card>
        </div>
        <div className="column">
          { tmpCurrency ? (
            <div className="return">
              <ListItem button
                onClick={(event, index) => {
                  this.history.push('/changes');
                }}
              >
                <ListItemIcon>
                  <KeyboardArrowLeft />
                </ListItemIcon>
                <ListItemText primary="Back to currencies" />
              </ListItem>
            </div>
          ) : (
            ''
          )}

          { !tmpCurrency && this.state.chain && this.state.chain[0] ?
            <div className={classes.grid}>
              { changes && this.state.currencies && !isLoading && !isSyncing
                ? this.state.currencies.map(currency => {
                  if (!this.state.chain[0].rates[currency.id] && !this.state.chain[0].secondDegree[currency.id]) {
                    return '' ;
                  }
                  return (
                    <Card key={currency.id} className={classes.items}>
                      {this.state.chain[0].rates[currency.id] && this.state.chain[0].rates[currency.id][selectedCurrency.id] ? (
                        <div>
                          <h3 className={classes.title}>{currency.name}</h3>
                          <p className={classes.paragraph}>
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
                          <h3 className={classes.title}>
                            {currency.name}{' '}
                            <small className={classes.notaccurate}>
                              Not accurate
                            </small>
                          </h3>
                          <p className={classes.paragraph}>
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
                      <div className={classes.graph}>
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
                    <Card key={i} className={classes.items}>
                      <div>
                        <h3 className={classes.title}>
                          <span className={`loading ${value}`} />
                        </h3>
                        <p className={classes.paragraph}>
                          <span className="loading w50" />{' '}
                          <span className="loading w30" />
                          <br />
                          <strong>
                            <span className="loading w30" />{' '}
                            <span className="loading w50" />
                          </strong>
                        </p>
                      </div>
                      <div className={classes.graph} />
                    </Card>
                  );
                })}
            </div>
            : '' }

          <Toolbar style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <CurrencySelector history={this.history} disabled={isLoading || isSyncing} />
          </Toolbar>

          <div style={{ padding: '0 0px 100px 0px' }}>
            <Card className="">
              <CardHeader
                title={ (isLoading || isSyncing ? '' : changes.length + ' changes')}
                className={classes.cardHeader}/>

              <CardContent style={{ padding: 0, overflow: 'auto' }}>
                <Table>
                  { tmpCurrency ? <TableHead>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell numeric><Amount value={1} currency={selectedCurrency} /></TableCell>
                      <TableCell numeric><Amount value={1} currency={tmpCurrency} /></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead> : '' }
                  <TableBody>
                    { changes && this.state.currencies && !isLoading && !isSyncing ?
                      changes.filter((item, index) => {
                        return (
                          !this.state.pagination || index < this.state.pagination
                        );
                      })
                        .map(obj => {

                          return (
                            <TableRow key={obj.id}>
                              <TableCell>
                                { moment(obj.date).format('DD MMM YY') }
                              </TableCell>
                              <TableCell>
                                {obj.name}
                              </TableCell>
                              <TableCell>
                                { tmpCurrency && obj.local_currency.id == tmpCurrency.id
                                  ? <Amount value={obj.local_amount} currency={obj.local_currency} />
                                  : <Amount value={obj.new_amount} currency={obj.new_currency} />
                                }
                                &nbsp;<Icon style={{ verticalAlign: 'bottom' }}><SwapHorizIcon className={classes.icon} /></Icon>&nbsp;
                                { tmpCurrency && obj.local_currency.id == tmpCurrency.id
                                  ? <Amount value={obj.new_amount} currency={obj.new_currency} />
                                  : <Amount value={obj.local_amount} currency={obj.local_currency} />
                                }
                              </TableCell>
                              { tmpCurrency ? <TableCell >
                                { obj.trend === 'up' ? <TrendingDown />  : '' }
                                { obj.trend === 'down' ? <TrendingUp />  : '' }
                                { obj.trend === 'flat' ? <TrendingFlat />  : '' }
                              </TableCell> : '' }
                              { tmpCurrency ? <TableCell numeric>
                                <Amount value={obj.rate} currency={tmpCurrency} accurate={obj.accurate} />
                              </TableCell> : '' }
                              { tmpCurrency ? <TableCell numeric>
                                <Amount value={obj.rate ? 1 / obj.rate : null} currency={selectedCurrency} accurate={obj.accurate} />
                              </TableCell> : '' }
                              <TableCell>
                                <IconButton
                                  onClick={(event) => this._openActionMenu(event, obj)}>
                                  <MoreVertIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
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
                          <TableRow key={i}>
                            <TableCell>
                              <span className="loading w50" />
                            </TableCell>
                            <TableCell>
                              <span className={`loading ${value}`} />
                            </TableCell>
                            <TableCell>
                              <span className="loading w50" />
                              &nbsp;<Icon style={{ verticalAlign: 'bottom', opacity: 0.5 }}><SwapHorizIcon className={classes.icon} /></Icon>&nbsp;
                              <span className="loading w50" />
                            </TableCell>
                            <TableCell ></TableCell>
                            <TableCell ><span className="loading w50" /></TableCell>
                            <TableCell ><span className="loading w50" /></TableCell>
                            <TableCell>
                              <IconButton disabled={true}>
                                <MoreVertIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    }
                  </TableBody>
                </Table>
              </CardContent>
              {changes && this.state.pagination < changes.length && !isLoading && !isSyncing ? (
                <CardActions>
                  <Button onClick={this.more} fullWidth={true}>More</Button>
                </CardActions>
              ) : (
                ''
              )}
            </Card>
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

          </div>

          <Fab color="primary"
            key="fab"
            aria-label="Add"
            className={classes.fab}
            disabled={!this.state.currencies || isLoading || isSyncing}
            onClick={() => this.handleOpenChange()}>
            <ContentAdd />
          </Fab>
        </div>
      </div>,
    ];
  }
}

Changes.propTypes = {
  classes: PropTypes.object.isRequired,
  changes: PropTypes.object.isRequired,
  currencies: PropTypes.array.isRequired,
  account: PropTypes.object.isRequired,
  selectedCurrency: PropTypes.object.isRequired,
  isSyncing: PropTypes.bool.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    changes: state.changes,
    currencies: state.currencies,
    account: state.account,
    isSyncing: state.server.isSyncing,
    selectedCurrency: state.currencies.find((c) => c.id === state.account.currency)
  };
};

export default connect(mapStateToProps)(withStyles(styles)(Changes));