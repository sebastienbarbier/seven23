import "./ImportExportSettings.scss";

import React, { Component } from "react";
import { connect } from "react-redux";

import moment from "moment";
import PropTypes from "prop-types";

import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import CircularProgress from "@material-ui/core/CircularProgress";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";

import MenuItem from "@material-ui/core/MenuItem";
import ListSubheader from "@material-ui/core/ListSubheader";
import Select from "@material-ui/core/Select";

import CloudUpload from "@material-ui/icons/CloudUpload";

import AccountsActions from "../../actions/AccountsActions";
import ImportAccount from "./accounts/ImportAccount";

const styles = {
  form: {
    margin: "30px 40px"
  }
};

class ImportExportSettings extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      filter: "",
      pagination: 10,
      tabs: "import",
      format: "json",
      importFile: null,
      open: false,
      accountId: props.account.id
    };
  }

  _onTabChange = (event, value) => {
    this.setState({
      tabs: value
    });
  };

  _handleChange = event => {
    this.setState({
      accountId: event.target.value
    });
  };

  _import = acceptedFiles => {
    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const json = JSON.parse(reader.result);
        this.setState({ isImporting: true });

        this.props
          .dispatch(AccountsActions.import(json))
          .then(() => {
            this.setState({ isImporting: false });
            this.props.dispatch(AccountsActions.sync());
          })
          .catch(exception => {
            console.error(exception);
          });
      };
      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");

      reader.readAsText(file);
    });
  };

  _export = () => {
    this.setState({ isExporting: true });
    const { dispatch, accounts } = this.props;
    const account = accounts.find(a => a.id === this.state.accountId);

    dispatch(AccountsActions.export(this.state.accountId))
      .then(json => {
        const dataStr =
          "data:text/json;charset=utf-8," +
          encodeURIComponent(JSON.stringify(json));
        const dlElement = document.getElementById("downloadAnchorElem");
        const date = moment().format("YYYY-MM-DD HH_mm_ss");
        dlElement.setAttribute("href", dataStr);
        dlElement.setAttribute("download", `${account.name} ${date}.json`);
        dlElement.click();

        this.setState({ isExporting: false });
      })
      .catch(exception => {
        console.error(exception);
        this.setState({ isExporting: false });
      });
  };

  render() {
    const { isExporting } = this.state;
    const { accounts, server } = this.props;

    return (
      <div className="layout_noscroll">
        <div className="layout_content_tabs wrapperMobile">
          <Tabs
            centered
            variant="fullWidth"
            value={this.state.tabs}
            onChange={this._onTabChange}
          >
            <Tab label="Import" value="import" />
            <Tab label="Export" value="export" />
          </Tabs>
        </div>
        <div className="layout_content wrapperMobile">
          {this.state.tabs === "import" ? <ImportAccount /> : ""}
          {this.state.tabs === "export" ? (
            <form style={styles.form}>
              <FormLabel component="legend" style={{ marginTop: 20 }}>
                Select an account to export
              </FormLabel>
              <FormControl
                component="fieldset"
                style={{ marginTop: 10, marginBottom: 4, width: "100%" }}
              >
                <Select
                  value={this.state.accountId}
                  onChange={this._handleChange}
                  disabled={isExporting}
                  inputProps={{
                    name: "account"
                  }}
                >
                  <ListSubheader>{server.name}</ListSubheader>
                  {accounts.map(account => (
                    <MenuItem
                      key={account.id}
                      value={account.id}
                      style={{ padding: 10 }}
                    >
                      {account.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormLabel component="legend" style={{ marginTop: 20 }}>
                Format
              </FormLabel>
              <FormControl component="fieldset">
                <RadioGroup
                  aria-label="type"
                  name="type"
                  value={this.state.format}
                  onChange={this.handleTypeChange}
                >
                  <FormControlLabel
                    value="json"
                    disabled
                    control={<Radio color="primary" />}
                    label="JSON"
                  />
                </RadioGroup>
              </FormControl>

              <Button
                variant="contained"
                fullWidth
                color="primary"
                style={{ marginTop: 10 }}
                onClick={this._export}
                disabled={isExporting}
              >
                {isExporting ? (
                  <CircularProgress
                    color="primary"
                    style={{ marginRight: 12 }}
                    size={20}
                  />
                ) : (
                  <CloudUpload style={{ marginRight: 12 }} />
                )}
                Export
              </Button>
              <a id="downloadAnchorElem"></a>
            </form>
          ) : (
            ""
          )}
        </div>
      </div>
    );
  }
}

ImportExportSettings.propTypes = {
  dispatch: PropTypes.func.isRequired,
  account: PropTypes.object.isRequired,
  server: PropTypes.object.isRequired,
  accounts: PropTypes.array.isRequired
};

const mapStateToProps = (state, ownProps) => {
  return {
    account: state.account,
    server: state.server,
    accounts: state.accounts.remote
  };
};

export default connect(mapStateToProps)(ImportExportSettings);
