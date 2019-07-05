import "./ImportExportSettings.scss";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import moment from "moment";
import PropTypes from "prop-types";

import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

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

export default function ImportExportSettings(props) {
  const dispatch = useDispatch();
  const account = useSelector(state => state.account);
  const server = useSelector(state => state.server);
  const accounts = useSelector(state => state.accounts);

  const [tabs, setTabs] = useState("import");
  const [format] = useState("json");
  const [isOpen, setIsOpen] = useState(false);
  const [id, setId] = useState(account.id);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const _export = () => {
    setIsExporting(true);
    const account = [...accounts.remote, ...accounts.local].find(
      a => a.id === id
    );

    dispatch(AccountsActions.export(id))
      .then(json => {
        const dataStr =
          "data:text/json;charset=utf-8," +
          encodeURIComponent(JSON.stringify(json));
        const dlElement = document.getElementById("downloadAnchorElem");
        const date = moment().format("YYYY-MM-DD HH_mm_ss");
        dlElement.setAttribute("href", dataStr);
        dlElement.setAttribute("download", `${account.name} ${date}.json`);
        dlElement.click();

        setIsExporting(false);
      })
      .catch(exception => {
        console.error(exception);
        setIsExporting(false);
      });
  };

  const _import = acceptedFiles => {
    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const json = JSON.parse(reader.result);
        setIsImporting(true);

        dispatch(AccountsActions.import(json))
          .then(() => {
            setIsImporting(false);
            dispatch(AccountsActions.sync());
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

  return (
    <div className="layout_noscroll">
      <div className="layout_content_tabs wrapperMobile">
        <Tabs
          centered
          variant="fullWidth"
          value={tabs}
          onChange={(event, value) => setTabs(value)}
        >
          <Tab label="Import" value="import" />
          <Tab label="Export" value="export" />
        </Tabs>
      </div>
      <div className="layout_content wrapperMobile">
        {tabs === "import" ? <ImportAccount /> : ""}
        {tabs === "export" ? (
          <form style={styles.form}>
            <FormLabel component="legend" style={{ marginTop: 20 }}>
              Select an account to export
            </FormLabel>
            <FormControl
              component="fieldset"
              style={{ marginTop: 10, marginBottom: 4, width: "100%" }}
            >
              <Select
                value={id}
                onChange={event => setId(event.target.value)}
                disabled={isExporting}
                inputProps={{
                  name: "account"
                }}
              >
                <ListSubheader>{server.name}</ListSubheader>
                {accounts.remote.map(account => (
                  <MenuItem
                    key={account.id}
                    value={account.id}
                    style={{ padding: 10 }}
                  >
                    {account.name}
                  </MenuItem>
                ))}
                <ListSubheader>On device</ListSubheader>
                {accounts.local.map(account => (
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
                value="json"
                onChange={() => {}}
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
              onClick={() => _export()}
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
