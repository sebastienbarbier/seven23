import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';

import { withTheme, withStyles } from '@material-ui/core/styles';
import SwipeableViews from 'react-swipeable-views';

import Card from '@material-ui/core/Card';

import Button from '@material-ui/core/Button';

import TrendingDownIcon from '@material-ui/icons/TrendingDown';
import TrendingFlatIcon from '@material-ui/icons/TrendingFlat';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import CompareArrowsIcon from '@material-ui/icons/CompareArrows';

import { ColoredAmount, Amount } from '../currency/Amount';

import grey from '@material-ui/core/colors/grey';

const styles = theme => ({
  trendContainer: {
    position: 'relative',
    padding: '10px 20px',
    textAlign: 'right',
    width: 280,
  },
  trendTitle: {
    textAlign: 'left',
    margin: '0 0 20px 0',
    fontWeight: 300,
  },
  trendingAmount: {
    position: 'absolute',
    zIndex: 0,
    top: 18,
    right: 20,
    fontSize: 24,
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
    const { isLoading, selectedCurrency, categories, theme } = this.props;
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

                {moment(trend.secondRange.dateBegin)
                  .startOf('day')
                  .format('MMM Do')}{' '}
                -{' '}
                {moment(trend.secondRange.dateEnd)
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
                {moment(trend.firstRange.dateBegin)
                  .startOf('day')
                  .format('MMM Do')}{' '}
                -{' '}
                {moment(trend.firstRange.dateEnd)
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
                        trend.id != 0 ? categories.find(category => {
                          return '' + category.id === '' + trend.id;
                        }).name : 'No category'
                      }
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Amount value={trend.oldiest} currency={selectedCurrency} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      { trend.diff < 0 ? (
                        <span style={{ color: theme.palette.numbers.green }}>
                          <TrendingDownIcon
                            style={{
                              color: theme.palette.numbers.green,
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
                              color: theme.palette.numbers.blue,
                              verticalAlign: 'bottom',
                            }}
                          />
                        </span>
                      ) : (
                        ''
                      )}
                      { trend.diff > 0 ? (
                        <span style={{ color: theme.palette.numbers.red }}>
                          <TrendingUpIcon
                            style={{
                              color: theme.palette.numbers.red,
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
    const { classes, trend7, trend30, isLoading, selectedCurrency, disabled, theme } = this.props;
    return (
      <SwipeableViews
        disabled={disabled}
        index={disabled ? 0 : null}
        enableMouseEvents
        style={{ padding: '0 calc(100% - 300px) 0 10px' }}
        slideStyle={{ padding: '8px 5px' }} >
        <Card className={classes.trendContainer}>
          <h3 className={classes.trendTitle}>30 <small>days</small></h3>
          { isLoading ?
            <div className={classes.trendingIcon}>
              <TrendingFlatIcon style={{ color: grey[500], fontSize: 50 }} />
            </div>
            :
            <div className={classes.trendingIcon}>
              { trend30 && trend30.diff < 0 ?  <TrendingDownIcon style={{ color: theme.palette.numbers.green, fontSize: 50 }} /> : '' }
              { trend30 && trend30.diff == 0 ? <TrendingFlatIcon style={{ color: theme.palette.numbers.blue, fontSize: 50 }} /> : '' }
              { trend30 && trend30.diff > 0 ?  <TrendingUpIcon style={{ color: theme.palette.numbers.red, fontSize: 50 }} /> : '' }
            </div>
          }
          { isLoading ?
            <p className={classes.trendingAmount}>
              <span className="loading w120" />
            </p>
            :
            <p className={classes.trendingAmount}>
              { trend30 ? <ColoredAmount value={ trend30.diff } currency={selectedCurrency} inverseColors forceSign /> : '' }
            </p>
          }
          <Button
            size='small'
            disabled={isLoading}
            onClick={() => this.handleOpenTrendDetails(trend30) }>See details</Button>
        </Card>

        <Card className={classes.trendContainer}>
          <h3 className={classes.trendTitle}>7 <small>days</small></h3>
          { isLoading ?
            <div className={classes.trendingIcon}>
              <TrendingFlatIcon style={{ color: grey[500], fontSize: 50 }} />
            </div>
            :
            <div className={classes.trendingIcon}>
              { trend7 && trend7.diff < 0 ?  <TrendingDownIcon style={{ color: theme.palette.numbers.green, fontSize: 50 }} /> : '' }
              { trend7 && trend7.diff == 0 ? <TrendingFlatIcon style={{ color: theme.palette.numbers.blue, fontSize: 50 }} /> : '' }
              { trend7 && trend7.diff > 0 ?  <TrendingUpIcon style={{ color: theme.palette.numbers.red, fontSize: 50 }} /> : '' }
            </div>
          }
          { isLoading ?
            <p className={classes.trendingAmount}>
              <span className="loading w120" />
            </p>
            :
            <p className={classes.trendingAmount}>
              { trend7 ? <ColoredAmount value={ trend7.diff } currency={selectedCurrency} inverseColors forceSign /> : '' }
            </p>
          }
          <Button
            size='small'
            disabled={isLoading}
            onClick={() => this.handleOpenTrendDetails(trend7) }>See details</Button>
        </Card>
      </SwipeableViews>
    );
  }
}

Trends.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  categories: PropTypes.array.isRequired,
  selectedCurrency: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    categories: state.categories.list,
    selectedCurrency: state.currencies.find((c) => c.id === state.account.currency),
  };
};

export default connect(mapStateToProps)(withTheme()(withStyles(styles)(Trends)));