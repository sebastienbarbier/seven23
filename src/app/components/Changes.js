/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';


import UserButton from './settings/UserButton';
import Fab from '@material-ui/core/Fab';

import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';

import ContentAdd from '@material-ui/icons/Add';


import LineGraph from './charts/LineGraph';
import ChangeForm from './changes/ChangeForm';
import ChangeList from './changes/ChangeList';

import ChangeActions from '../actions/ChangeActions';


const styles = theme => ({
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
      currency_title: '',
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
        currency_title: currency ? currency.name : this.state.currency_title,
      });
    }
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
    const { currencies, open, changes, isLoading, currency_title } = this.state;
    const { isSyncing, selectedCurrency, classes } = this.props;

    const tmpCurrency = this.state.currency;

    return (
      <div className="layout">
        <div className={'modalContent ' + (open ? 'open' : '') }>
          <Card square className="modalContentCard">{this.state.component}</Card>
        </div>

        <header className="layout_header">
          <div className="layout_header_top_bar">
            <div className={(!tmpCurrency ? 'show ' : '') + 'layout_header_top_bar_title'}>
              <h2>Changes</h2>
            </div>
            <div className={(tmpCurrency ? 'show ' : '') + 'layout_header_top_bar_title'} style={{ right: 80 }}>
              <IconButton onClick={() => this.history.push('/changes') }>
                <KeyboardArrowLeft style={{ color: 'white' }} />
              </IconButton>
              <h2 style={{ paddingLeft: 4}}>{ currency_title }</h2>
            </div>
            <div className='showMobile'>
              <UserButton history={this.history} type="button" color="white" />
            </div>
          </div>
        </header>

        <div className="layout_content" style={{ display: (tmpCurrency ? 'none' : 'block') }}>
          { !tmpCurrency ? (
            <List>

              {changes && currencies && !isLoading && !isSyncing
                ? currencies.map(currency => {
                  return (
                    <ListItem button
                      key={currency.id}
                      selected={Boolean(this.state.currency) && this.state.currency.id === currency.id}
                      style={{ position: 'relative' }}
                      onClick={(event) => {
                        this.setState({ currency });
                        this.history.push('/changes/' + currency.id);
                      }}
                    >
                      <ListItemText
                        primary={`${currency.name} (${currency.code})`}
                        secondary={
                          <React.Fragment>
                            { currency.code }
                            <div style={{ position: 'absolute', width: 100, right: 60, top: 0, bottom: 0, opacity: 0.5 }}>
                              <LineGraph
                                values={[{ values: this.state.graph[currency.id] }]}
                              />
                            </div>
                          </React.Fragment>
                        } />
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
          ) : '' }
        </div>

        { tmpCurrency ? (
          <div className="layout_content">
            <ChangeList
              changes={changes}
              currency={tmpCurrency}
              currencies={currencies}
              isLoading={!currencies || isLoading || isSyncing}
              onEditChange={this.handleOpenChange}
              onDuplicateChange={this.handleDuplicateChange}
              onDeleteChange={this.handleDeleteChange}
            />
          </div>
        ) : '' }

        <Fab
          color="primary"
          aria-label="Add"
          className='layout_fab_button show'
          disabled={!currencies || isLoading || isSyncing}
          onClick={() => this.handleOpenChange()}>
          <ContentAdd />
        </Fab>
      </div>
    );
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