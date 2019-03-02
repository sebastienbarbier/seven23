import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';

import LinearProgress from '@material-ui/core/LinearProgress';


import CloudDownload from '@material-ui/icons/CloudDownload';

import AccountsActions from '../../../actions/AccountsActions';
import ServerActions from '../../../actions/ServerActions';

const styles = {
  form: {
    margin: '30px 40px',
  },
  dropzone: {
    fontSize: '0.8rem',
  }
};

class ImportAccount extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      filter: '',
      pagination: 10,
      tabs: 'import',
      format: 'json',
      importFile: null,
      open: false,
      onImport: props.onImport,
      accountId: props.account.id,
    };
  }

  _onTabChange = (event, value) => {
    this.setState({
      tabs: value,
    });
  };

  _handleOpen = event => {
    // This prevents ghost click.
    event.preventDefault();
    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  };

  _handleChange = event => {
    this.setState({
      accountId: event.target.value
    });
  };

  _import = (acceptedFiles) => {
    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const json = JSON.parse(reader.result);
        this.setState({ isImporting: true });
        if (this.state.onImport) {
          this.state.onImport();
        }
        this.props.dispatch(AccountsActions.import(json)).then(() => {
          this.props.dispatch(AccountsActions.sync()).then(() => {
            this.props.dispatch(AccountsActions.refreshAccount());
          }).catch((exception) => {
            console.error(exception);
          });
          this.setState({ isImporting: false });
        }).catch((exception) => {

          if (this.state.onImport) {
            this.state.onImport(false);
          }
          console.error(exception);
        });
      };
      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');

      reader.readAsText(file);
    });
  };

  render() {
    const { isImporting } = this.state;

    return (
      <div>
        <div style={{ display: 'flex' }}>
          { isImporting ? (
            <div style={{ marginTop: 10, flexGrow: 1 }}>
              <LinearProgress />
            </div>
          ) : (
            <Dropzone accept=".json" style={styles.dropzone} className="dropzone" onDrop={this._import}>
              <CloudDownload style={{ marginRight: 12, position: 'relative', top: 6 }} /> Click, or drop a <em>.json</em> file
            </Dropzone>
          )}
        </div>
      </div>
    );
  }
}

ImportAccount.propTypes = {
  dispatch: PropTypes.func.isRequired,
  account: PropTypes.object.isRequired,
  accounts: PropTypes.array.isRequired,
  progress: PropTypes.number, // between 0 and 100
};

const mapStateToProps = (state, ownProps) => {
  return {
    account: state.account,
    accounts: state.user.accounts,
    progress: state.imports.progress,
  };
};

export default connect(mapStateToProps)(ImportAccount);