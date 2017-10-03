import axios from 'axios';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router';

import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import {Card, CardActions, CardTitle, CardText} from 'material-ui/Card';
import CircularProgress from 'material-ui/CircularProgress';


import AccountActions from '../../actions/AccountActions';
import AccountStore from '../../stores/AccountStore';
import CurrencyStore from '../../stores/CurrencyStore';
import AutoCompleteSelectField from '../forms/AutoCompleteSelectField';


const styles = {
  actions: {
    textAlign: 'right',
  },
  nameField: {
    width: '100%',
    marginBottom: '16px',
  },
  loading: {
    margin: '8px 20px 0px 20px',
  },
  cardText: {
    width: '80%',
    margin: 'auto',
    paddingTop: '0px',
    paddingBottom: '32px'
  }
};

class NoAccounts extends Component {

  constructor(props, context) {
    super(props, context);
    this.router = context.router;
    this.state = {
      loading: false,
      name: '',
      currency: null,
      currencies: CurrencyStore.currenciesArray,
      indexedCurrency: CurrencyStore.getIndexedCurrencies(),
      error: {},
    };
  }

  handleSaveChange = (e) => {
    e.preventDefault();
    AccountStore.onceChangeListener(() => {
      this.context.router.push('/');
    });
    AccountActions.create({
      name: this.state.name,
      currency: this.state.currency
    });
  };

  handleChangeName = (event) => {
    this.setState({name: event.target.value});
  };

  handleCurrencyChange = (currency) => {
    this.setState({
      currency: currency ? currency.id : null,
    });
  };

  handleCancel = (event) => {
    this.context.router.push('/logout');
  };

  render() {
    return (
      <form onSubmit={e => this.handleSaveChange(e)} >
        <Card>
          <CardTitle title="Thanks for joining!" />
          <CardText expandable={false} style={styles.cardText}>
            <p>You just created a new user, and need now to define a main account in which you will save your expenses.</p>
              <TextField
                floatingLabelText="Name"
                value={this.state.name}
                style={styles.nameField}
                disabled={this.state.loading}
                errorText={this.state.error.name}
                onChange={this.handleChangeName}
                autoFocus={true}
                tabIndex={1}
              /><br />
              <AutoCompleteSelectField
                value={this.state.indexedCurrency[this.state.currency]}
                values={this.state.currencies}
                errorText={this.state.error.currency}
                onChange={this.handleCurrencyChange}
                floatingLabelText="Currency"
                maxHeight={400}
                fullWidth={true}
                style={{textAlign: 'left'}}
                tabIndex={2}
              />
          </CardText>
          <CardActions style={styles.actions}>
            <FlatButton label="Back to login page" tabIndex={4} onTouchTap={this.handleCancel}/>
            { this.state.loading ?
              <CircularProgress size={20} style={styles.loading} /> :
              <FlatButton onTouchTap={this.handleSaveChange} type="submit" label="Create an account" tabIndex={3} />
            }
          </CardActions>
        </Card>
      </form>
    );
  }
}

export default NoAccounts;
