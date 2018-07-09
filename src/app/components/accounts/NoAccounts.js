import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import CircularProgress from '@material-ui/core/CircularProgress';

import AccountActions from '../../actions/AccountsActions';
import AutoCompleteSelectField from '../forms/AutoCompleteSelectField';

const styles = {
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    maxWidth: '500px',
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
    paddingBottom: '32px',
  },
};

class NoAccounts extends Component {
  constructor(props, context) {
    super(props, context);
    this.history = props.history;
    this.state = {
      loading: false,
      name: '',
      currency: null,
      error: {},
    };
  }

  handleSaveChange = e => {
    e.preventDefault();
    const { dispatch } = this.props;
    dispatch(AccountActions.create({
      name: this.state.name,
      currency: this.state.currency.id,
    })).then(() => {
      this.history.push('/');
    }).catch((error) => {
      console.error(error);
    });
  };

  handleChangeName = event => {
    this.setState({ name: event.target.value });
  };

  handleCurrencyChange = currency => {
    this.setState({
      currency: currency || null,
    });
  };

  handleCancel = event => {
    this.history.push('/logout');
  };

  render() {
    const { currencies } = this.props;
    return (
      <div style={styles.container}>
        <form style={styles.form} onSubmit={e => this.handleSaveChange(e)}>
          <h2>Thanks for joining!</h2>
          <div expandable={false} style={styles.cardText}>
            <p>
              You just created a new user, and need now to define a main account
              in which you will save your expenses.
            </p>
            <TextField
              label="Name"
              value={this.state.name}
              style={styles.nameField}
              disabled={this.state.loading}
              error={Boolean(this.state.error.name)}
              helperText={this.state.error.name}
              onChange={this.handleChangeName}
              autoFocus={true}
              margin="normal"
            />
            <br />
            <AutoCompleteSelectField
              value={this.state.currency}
              values={currencies}
              error={Boolean(this.state.error.currency)}
              helperText={this.state.error.currency}
              onChange={this.handleCurrencyChange}
              label="Currency"
              maxHeight={400}
              fullWidth={true}
              style={{ textAlign: 'left' }}
            />
          </div>
          <div style={styles.actions}>
            {this.state.loading ? (
              <CircularProgress size={20} style={styles.loading} />
            ) : (
              <Button
                onClick={this.handleSaveChange}
                type="submit"
              >Create an account</Button>
            )}
          </div>
        </form>
      </div>
    );
  }
}

NoAccounts.propTypes = {
  dispatch: PropTypes.func.isRequired,
  currencies: PropTypes.array.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    currencies: state.currencies
  };
};

export default connect(mapStateToProps)(NoAccounts);
