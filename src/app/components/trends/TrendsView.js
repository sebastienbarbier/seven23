import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';

import { withStyles } from '@material-ui/core/styles';
import SwipeableViews from 'react-swipeable-views';


import Button from '@material-ui/core/Button';

import TrendingDownIcon from '@material-ui/icons/TrendingDown';
import TrendingFlatIcon from '@material-ui/icons/TrendingFlat';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import CompareArrowsIcon from '@material-ui/icons/CompareArrows';

import { ColoredAmount, Amount } from '../currency/Amount';

import red from '@material-ui/core/colors/red';
import blue from '@material-ui/core/colors/blue';
import green from '@material-ui/core/colors/green';

const styles = theme => ({
  trendContainer: {
    position: 'relative',
    borderRadius: 20,
    background: 'rgba(128, 128, 128, 0.1)',
    padding: '10px 20px',
    textAlign: 'right',
    border: 'solid 1px rgba(128, 128, 128, 0.2)',
    boxShadow: '0px 1px 5px 0px rgba(128, 128, 128, 0.2),0px 2px 2px 0px rgba(128, 128, 128, 0.14),0px 3px 1px -2px rgba(128, 128, 128, 0.12)',
  },
  trendTitle: {
    textAlign: 'left',
    margin: '0 0 30px 0',
    fontWeight: 300,
  },
  trendingAmount: {
    position: 'absolute',
    zIndex: 0,
    top: 20,
    right: 20,
    fontSize: 30,
    margin: 0
  },
  trendingIcon: {
    position: 'absolute',
    zIndex: 0,
    bottom: 0,
    left: 20,
  }
});

class Trends extends Component {
  constructor(props, context) {
    super(props, context);
    this.props = props;
    this.today = moment();
  }

  componentWillReceiveProps(nextProps) {
    this.props = nextProps;
  }

  handleOpenTrendDetails = (trend) => {
    this.props.onOpenTrend({
      trend,
      component: this.trendListComponent(trend),
    });
  };

  trendListComponent = (trend) => {
    const { isLoading, selectedCurrency, categories } = this.props;
    return (
      <div
        style={{ fontSize: '0.8rem' }}
        className={
          isLoading ? 'noscroll wrapper' : 'wrapper'
        }
      >
        <table style={{ width: '100%' }}>
          <tbody>
            <tr>
              <th
                style={{ textAlign: 'right', paddingBottom: '4px' }}
                colSpan="2"
              >
                {moment()
                  .utc()
                  .subtract(30 * 2 + 2, 'days')
                  .startOf('day')
                  .format('MMM Do')}{' '}
                -{' '}
                {moment()
                  .utc()
                  .subtract(30 + 2, 'days')
                  .endOf('day')
                  .format('MMM Do')}
              </th>
              <th>
                <CompareArrowsIcon
                  style={{
                    verticalAlign: 'bottom',
                    padding: '0 8px',
                    fontSize: 40
                  }}
                />
              </th>
              <th
                style={{ textAlign: 'left', paddingBottom: '4px' }}
                colSpan="2">
                {moment()
                  .utc()
                  .subtract(30 + 1, 'days')
                  .startOf('day')
                  .format('MMM Do')}{' '}
                -{' '}
                {moment()
                  .utc()
                  .subtract(1, 'days')
                  .endOf('day')
                  .format('MMM Do')}
              </th>
            </tr>
            { trend && !isLoading
              ? trend.trend.map(trend => {
                return (
                  <tr key={trend.id}>
                    <td>
                      {
                        categories.find(category => {
                          return '' + category.id === '' + trend.id;
                        }).name
                      }
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Amount value={trend.oldiest} currency={selectedCurrency} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      { trend.diff < 0 ? (
                          <span style={{ color: green[500] }}>
                            <TrendingDownIcon
                              style={{
                                color: green[500],
                                verticalAlign: 'bottom',
                              }}
                            />
                          </span>
                        ) : (
                          ''
                        )}
                      { trend.diff == 0 ? (
                          <span>
                            {' '}
                            <TrendingFlatIcon
                              style={{
                                color: blue[500],
                                verticalAlign: 'bottom',
                              }}
                            />
                          </span>
                        ) : (
                          ''
                        )}
                      { trend.diff > 0 ? (
                          <span style={{ color: red[500] }}>
                            <TrendingUpIcon
                              style={{
                                color: red[500],
                                verticalAlign: 'bottom',
                              }}
                            />
                          </span>
                        ) : (
                          ''
                        )}
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      <Amount value={trend.earliest} currency={selectedCurrency} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <ColoredAmount value={trend.diff} currency={selectedCurrency} inverseColors={true} forceSign={true} />
                    </td>
                  </tr>
                );
              })
              : [
                'w120',
                'w120',
                'w80',
                'w120',
                'w80',
                'w150',
                'w80',
                'w20',
                'w120',
                'w120',
                'w80',
                'w150',
              ].map((value, i) => {
                return (
                  <tr key={i}>
                    <td>
                      <span className={'loading ' + value} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={'loading w30'} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={'loading w20'} />
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      <span className={'loading w30'} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={'loading w30'} />
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    );
  }

  render() {
    const { classes, trend7, trend30, isLoading, selectedCurrency, categories } = this.props;

    return (
      <SwipeableViews enableMouseEvents style={{ padding: '0 40px 0 20px' }}  slideStyle={{ padding: '8px 10px' }} >
        <div className={classes.trendContainer}>
          <h3 className={classes.trendTitle}>30 <small>days</small></h3>
          <div className={classes.trendingIcon}>
            { trend30 && trend30.diff < 0 ?  <TrendingDownIcon style={{ color: green[500], fontSize: 60 }} /> : '' }
            { trend30 && trend30.diff == 0 ? <TrendingFlatIcon style={{ color: blue[500], fontSize: 60 }} /> : '' }
            { trend30 && trend30.diff > 0 ?  <TrendingUpIcon style={{ color: red[500], fontSize: 60 }} /> : '' }
          </div>
          <p className={classes.trendingAmount}>
            { trend30 ? <ColoredAmount value={ trend30.diff } currency={selectedCurrency} inverseColors /> : '' }
          </p>
          <Button
            size='small'
            disabled={isLoading}
            onClick={() => this.handleOpenTrendDetails(trend30) }>See details</Button>
        </div>

        <div className={classes.trendContainer}>
          <h3 className={classes.trendTitle}>7 <small>days</small></h3>
          <div className={classes.trendingIcon}>
            { trend7 && trend7.diff < 0 ?  <TrendingDownIcon style={{ color: green[500], fontSize: 60 }} /> : '' }
            { trend7 && trend7.diff == 0 ? <TrendingFlatIcon style={{ color: blue[500], fontSize: 60 }} /> : '' }
            { trend7 && trend7.diff > 0 ?  <TrendingUpIcon style={{ color: red[500], fontSize: 60 }} /> : '' }
          </div>
          <p className={classes.trendingAmount}>
            { trend7 ? <ColoredAmount value={ trend7.diff } currency={selectedCurrency} inverseColors /> : '' }
          </p>
          <Button
            size='small'
            disabled={isLoading}
            onClick={() => this.handleOpenTrendDetails(trend7) }>See details</Button>
        </div>
      </SwipeableViews>
    );
  }
}

Trends.propTypes = {
  classes: PropTypes.object.isRequired,
  categories: PropTypes.array.isRequired,
  selectedCurrency: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    categories: state.categories.list,
    selectedCurrency: state.currencies.find((c) => c.id === state.account.currency),
  };
};

export default connect(mapStateToProps)(withStyles(styles)(Trends));