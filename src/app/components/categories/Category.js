/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
 import React, {Component} from 'react';
 import moment from 'moment';
 import ReactHighcharts from 'react-highcharts';
 import { Router, Route, Link, browserHistory } from 'react-router';
 import {List, ListItem, makeSelectable} from 'material-ui/List';
 import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
 import {Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn}
  from 'material-ui/Table';
 import FontIcon from 'material-ui/FontIcon';
 import FlatButton from 'material-ui/FlatButton';

 import CircularProgress from 'material-ui/CircularProgress';

 import AccountStore from '../../stores/AccountStore';
 import CurrencyStore from '../../stores/CurrencyStore';
 import CategoryStore from '../../stores/CategoryStore';
 import TransactionStore from '../../stores/TransactionStore';
 import TransactionActions from '../../actions/TransactionActions';

 const styles = {
  container: {
    textAlign: 'left',
    float: 'right',
    marginLeft: '450px',
  },
  paddingBottom: {
    paddingBottom: '40px',
  },
  loading: {
    textAlign: 'center',
    padding: '50px 0',
  },
  button: {
    float: 'right',
    marginTop: '12px',
  },
  card: {
    width: '400px',
  },
 };

 const graph_config = {
    chart: {
        type: 'line'
    },
    title:{
        text:''
    },
    legend: {
      enabled: false,
    },
    xAxis: {
        gridLineWidth: 1,
        title: {
            text: '',
        }
    },
    yAxis: {
        reversed: true,
        title: {
            text: '',
        }
    },
    credits: {
        enabled: false,
    },
  };

 class Category extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      category: CategoryStore.getIndexedCategories()[props.params.id],
      transactions: [],
      stats: {},
      counter: 0,
      graph: graph_config,
      loading: true,
    };
    this.context = context;
  }

  updateData = (category) => {
    if (category && category.id) {
      this.setState({
        category: CategoryStore.getIndexedCategories()[this.state.category.id],
      });
    } else {
      this.context.router.push('/categories/');
    }
  };

  updateTransactions = (args) => {
    if (args) {

      let statsIndexed = {};
      // For each transaction, we clean data and
      args.forEach((transaction) => {
        // Format date
        transaction.date = new Date(transaction.date);

        // Count per month
        if (!statsIndexed[transaction.date.getFullYear()]) {
          statsIndexed[transaction.date.getFullYear()] = {};
        }
        if (!statsIndexed[transaction.date.getFullYear()][transaction.date.getMonth()+1]) {
          statsIndexed[transaction.date.getFullYear()][transaction.date.getMonth()+1] = {
            counter: 0,
            sum: 0,
          };
        }
        var month = statsIndexed[transaction.date.getFullYear()][transaction.date.getMonth()+1];
        month.counter++;
        month.sum += transaction.foreign_amount;
      });

      // Generate array
      let statsList = [];
      let categories = [];
      let data = [];

      Object.keys(statsIndexed).forEach((year) => {
        Object.keys(statsIndexed[year]).forEach((month) => {
          statsList.push({
            date: year+'-'+month,
            sum: statsIndexed[year][month].sum,
          });
          categories.push(moment(year+'-'+month, 'YYYY-MM').format('MMM YYYY'));
          data.push({
            y: parseFloat(statsIndexed[year][month].sum.toFixed(2)),
          });
        });
      });

      // Config graph
      let graph = graph_config;
      graph.xAxis.categories = categories;
      graph.series = [{
        data: data,
        name: 'Spending',
      }];

      this.setState({
        loading: false,
        stats: statsList,
        graph: graph,
        transactions: args,
      });
    }
  };

  updateAccount = (args) => {
    TransactionActions.requestByCategory(this.props.params.id);
  };

  componentWillReceiveProps(nextProps) {
    window.scrollTo(0, 0);

    this.setState({
      category: CategoryStore.getIndexedCategories()[nextProps.params.id],
      transactions: [],
      stats: {},
      counter: 0,
      loading: true,
    });
    TransactionActions.requestByCategory(nextProps.params.id);
  }

  componentWillMount() {
    window.scrollTo(0, 0);
    AccountStore.addChangeListener(this.updateAccount);
    TransactionStore.addChangeListener(this.updateTransactions);
    CategoryStore.addChangeListener(this.updateData);
  }

  componentDidMount() {
    TransactionActions.requestByCategory(this.state.category.id);
  }

  componentWillUnmount() {
    AccountStore.removeChangeListener(this.updateAccount);
    TransactionStore.removeChangeListener(this.updateTransactions);
    CategoryStore.removeChangeListener(this.updateData);
  }

  render() {
    return (
      <div>
        <h1>{ this.state.category.name }</h1>
        <div style={styles.paddingBottom}>
          <Card>
            <CardText>
              { this.state.loading ?
                <div style={styles.loading}>
                  <CircularProgress />
                </div>
              :
                <div>
                  <ReactHighcharts config={this.state.graph} ref="chart"></ReactHighcharts>
                </div>
              }
            </CardText>
          </Card>
        </div>
        <Card>
          <CardText>
            { this.state.loading ?
              <div style={styles.loading}>
                <CircularProgress />
              </div>
            :
              <div>
                <Table
                  height={"300px"}
                  fixedHeader={true}
                  fixedFooter={true}
                >
                  <TableHeader
                    displaySelectAll={false}>
                    <TableRow>
                      <TableHeaderColumn tooltip="Date">Date</TableHeaderColumn>
                      <TableHeaderColumn tooltip="Label">Label</TableHeaderColumn>
                      <TableHeaderColumn tooltip="Amount">Amount</TableHeaderColumn>
                    </TableRow>
                  </TableHeader>
                  <TableBody
                    displayRowCheckbox={false}
                    showRowHover={true}
                    stripedRows={false}
                  >
                  { this.state.transactions.map((item) => {
                    return (
                      <TableRow key={item.id}>
                        <TableRowColumn>{moment(item.date).format('DD MMM YYYY')}</TableRowColumn>
                        { AccountStore.selectedAccount().currency !== item.local_currency ?
                          <TableRowColumn>{item.name} ({CurrencyStore.format(item.local_amount, item.local_currency)})</TableRowColumn>
                          :
                          <TableRowColumn>{item.name}</TableRowColumn>
                        }
                        <TableRowColumn>{CurrencyStore.format(item.foreign_amount)}</TableRowColumn>
                      </TableRow>
                    )
                  })}
                  </TableBody>
                </Table>
              </div>
            }
          </CardText>
        </Card>
      </div>
    );
  }
}

// Inject router in context
Category.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default Category;
