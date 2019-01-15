import React, { Component } from 'react';
import { connect } from 'react-redux';

import moment from 'moment';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';

import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import CircularProgress from '@material-ui/core/CircularProgress';
import LinearProgress from '@material-ui/core/LinearProgress';

import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Card from '@material-ui/core/Card';

import CardContent from '@material-ui/core/CardContent';

import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

import CloudDownload from '@material-ui/icons/CloudDownload';
import CloudUpload from '@material-ui/icons/CloudUpload';

import AccountsActions from '../../actions/AccountsActions';

const styles = {
  form: {
    width: '100%',
    maxWidth: 320,
    margin: 'auto'
  }
};

class ImportExportSettings extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      filter: '',
      pagination: 10,
      tabs: 'import',
      format: 'json',
      importFile: null,
      open: false,
      accountId: props.account.id,
    };
  }

  _onDrop = (acceptedFiles, rejectedFiles) => {
    // do stuff with files...
    console.log({acceptedFiles, rejectedFiles});
  };

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

  _handleRequestClose = () => {
    this.setState({
      open: false,
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

        this.props.dispatch(AccountsActions.import(json)).then(() => {
          this.setState({ isImporting: false });
          this.props.dispatch(AccountsActions.sync());
        }).catch((exception) => {
          console.error(exception);
        });
      };
      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');

      reader.readAsText(file);
    });
  };

  _export = () => {
    this.setState({ isExporting: true });
    const { dispatch, accounts } = this.props;
    const account = accounts.find(a => a.id === this.state.accountId);

    dispatch(AccountsActions.export(this.state.accountId)).then((json) => {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(json));
      const dlElement = document.getElementById('downloadAnchorElem');
      const date = moment().format('YYYY-MM-DD HH_mm_ss');
      dlElement.setAttribute('href', dataStr);
      dlElement.setAttribute('download', `${account.name} ${date}.json`);
      dlElement.click();

      this.setState({ isExporting: false });
    }).catch((exception) => {
      console.error(exception);
      this.setState({ isExporting: false });
    });
  };

  render() {
    const { isExporting, isImporting } = this.state;
    const { accounts } = this.props;

    return (
      <Card className="card">
        <AppBar position="static" color="default" style={{ width: '100%' }}>
          <Tabs
            fullWidth
            centered
            value={this.state.tabs}
            onChange={this._onTabChange}
          >
            <Tab label="Import" value="import" fullWidth />
            <Tab label="Export" value="export" fullWidth />
          </Tabs>
        </AppBar>
        { this.state.tabs === 'import' ? (
          <CardContent style={{ display: 'flex' }}>
            { isImporting ? (
              <div style={{ marginTop: 10, flexGrow: 1 }}>
                <LinearProgress />
              </div>
            ) : (
              <Dropzone accept=".json" className="dropzone" onDrop={this._import}>
                <CloudDownload style={{ marginRight: 12, position: 'relative', top: 6 }} /> Click, or drop a <em>.json</em> file
              </Dropzone>
            )}
          </CardContent>
        ) : '' }
        { this.state.tabs === 'export' ? (
          <CardContent style={{ display: 'flex' }}>
            <form style={styles.form}>
              <FormLabel component="legend" style={{ marginTop: 20, }}>Select an account to export</FormLabel>
              <FormControl component="fieldset" style={{ marginTop: 10, marginBottom: 4, width: '100%' }}>
                <Select
                  value={this.state.accountId}
                  onChange={this._handleChange}
                  disabled={isExporting}
                  inputProps={{
                    name: 'account',
                  }}
                >
                  { accounts.map(account => (
                    <MenuItem key={ account.id } value={ account.id } style={{ padding: 10 }}>
                      { account.name }
                    </MenuItem>
                  )) }
                </Select>
              </FormControl>

              <FormLabel component="legend" style={{ marginTop: 20 }}>Format</FormLabel>
              <FormControl component="fieldset">
                <RadioGroup
                  aria-label="type"
                  name="type"
                  value={this.state.format}
                  onChange={this.handleTypeChange}
                >
                  <FormControlLabel value="json" disabled control={<Radio color="primary" />} label="JSON" />
                </RadioGroup>
              </FormControl>

              <Button
                variant="contained"
                fullWidth
                color="primary"
                style={{ marginTop: 10 }}
                onClick={this._export}
                disabled={isExporting}>
                { isExporting ? (
                  <CircularProgress color="primary" style={{ marginRight: 12 }} size={20} />
                ) : (
                  <CloudUpload style={{ marginRight: 12 }} />
                )}
                 Export
              </Button>
              <a id="downloadAnchorElem"></a>
            </form>
          </CardContent>
        ) : '' }
      </Card>
    );
  }
}

ImportExportSettings.propTypes = {
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

export default connect(mapStateToProps)(ImportExportSettings);