import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import UserButton from './settings/UserButton';

import CircularProgress from '@material-ui/core/CircularProgress';

import Card from '@material-ui/core/Card';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import AccountActions from '../actions/AccountsActions';
import AutoCompleteSelectField from './forms/AutoCompleteSelectField';
import ImportAccount from './settings/accounts/ImportAccount';

const styles = {
  container: {
    width: '100%',
    height: '100%',
    padding: '8px 19px',
  },
  form: {
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

class NewAccounts extends Component {
  constructor(props, context) {
    super(props, context);
    this.history = props.history;
    this.state = {
      loading: false,
      name: '',
      currency: null,
      tabs: 'create',
      isImporting: false,
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

  _onImport = (value = true) => {
    this.setState({ isImporting: true });
  }

  _onTabChange = (event, value) => {
    this.setState({ tabs: value });
  };

  handleChangeName = event => {
    this.setState({ name: event.target.value });
  };

  handleCurrencyChange = currency => {
    this.setState({
      currency: currency || null,
    });
  };

  render() {
    const { currencies } = this.props;
    const { isImporting } = this.state;
    return (
      <div className="layout">
        <Card className="newAccountCard">
          <header className="layout_header">
            <div className="layout_header_top_bar">
              <h2>New account</h2>
              <div className='showMobile'><UserButton history={this.history} type="button" color="white" /></div>
            </div>
            <div className="layout_header_tabs">
              <Tabs
                centered
                variant="fullWidth"
                value={this.state.tabs}
                onChange={this._onTabChange}
              >
                <Tab label="Create" value="create" disabled={ isImporting } />
                <Tab label="Import" value="import" disabled={ isImporting } />
              </Tabs>
            </div>
          </header>

          { this.state.tabs === 'create' &&
            <div className='layout_content' style={styles.container}>
              <form style={styles.form} onSubmit={e => this.handleSaveChange(e)}>
                <div style={styles.cardText}>
                  <p>
                    This user currently has no account created, you need now to define a main account
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
          }

          { this.state.tabs === 'import' &&
            <div style={styles.container}>
              <ImportAccount onImport={this._onImport}/>
            </div>
          }
        </Card>
      </div>
    );
  }
}

NewAccounts.propTypes = {
  dispatch: PropTypes.func.isRequired,
  currencies: PropTypes.array.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    currencies: state.currencies
  };
};

export default connect(mapStateToProps)(NewAccounts);