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
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  form: {
    maxWidth: '500px'
  },
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
    paddingTop: '8px',
    paddingBottom: '32px'
  }
};

class NoAccounts extends Component {

  constructor(props, context) {
    super(props, context);
    this.history = props.history;
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
      this.history.push('/');
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
    this.history.push('/logout');
  };

  render() {
    return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={e => this.handleSaveChange(e)} >
        <h2>Thanks for joining!</h2>
        <div expandable={false} style={styles.cardText}>
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
        </div>
        <div style={styles.actions}>
          { this.state.loading ?
            <CircularProgress size={20} style={styles.loading} /> :
            <FlatButton onTouchTap={this.handleSaveChange} type="submit" label="Create an account" tabIndex={3} />
          }
        </div>
      </form>
    </div>
    );
  }
}

export default NoAccounts;
