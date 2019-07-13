import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "@material-ui/core/Button";

import TextField from "@material-ui/core/TextField";

import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

import CircularProgress from "@material-ui/core/CircularProgress";

import AccountActions from "../../actions/AccountsActions";
import AppActions from "../../actions/AppActions";
import AutoCompleteSelectField from "../forms/AutoCompleteSelectField";
import ImportAccount from "../settings/accounts/ImportAccount";

const styles = {
  nameField: {
    width: "100%",
    marginBottom: "16px"
  },
  cardText: {
    paddingBottom: "32px"
  }
};

export default function CreateAccount(props) {
  const dispatch = useDispatch();
  const currencies = useSelector(state => state.currencies);

  const [isImporting, setIsImporting] = useState(false);
  const loading = false;
  const [tabs, setTabs] = useState("create");

  const [error, setError] = useState({});
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState(null);

  const handleSaveChange = event => {
    event.preventDefault();
    dispatch(
      AccountActions.create({
        name: name,
        currency: currency.id,
        isLocal: true
      })
    )
      .then(account => {
        dispatch(AccountActions.switchAccount(account));
      })
      .catch(error => {
        console.error(error);
      });
  };

  return (
    <div className="welcoming__layout">
      <header>
        <h2 style={{ marginBottom: 4 }}>Create account</h2>
        <Tabs
          centered
          variant="fullWidth"
          value={tabs}
          onChange={(event, value) => setTabs(value)}
        >
          <Tab label="Create" value="create" disabled={isImporting} />
          <Tab label="Import" value="import" disabled={isImporting} />
        </Tabs>
      </header>
      <div className="content">
        {tabs === "create" && (
          <div className="layout_content">
            <form
              style={styles.cardText}
              onSubmit={event => handleSaveChange(event)}
            >
              <TextField
                label="Name"
                value={name}
                style={styles.nameField}
                error={Boolean(error.name)}
                helperText={error.name}
                onChange={event => setName(event.target.value)}
                autoFocus={true}
                margin="normal"
              />
              <br />
              <AutoCompleteSelectField
                value={currency}
                values={currencies}
                error={Boolean(error.currency)}
                helperText={error.currency}
                onChange={currency => setCurrency(currency || null)}
                label="Currency"
                maxHeight={400}
                fullWidth={true}
                style={{ textAlign: "left" }}
              />
            </form>
          </div>
        )}

        {tabs === "import" && (
          <div style={styles.container}>
            <ImportAccount onImport={() => setIsImporting(true)} />
          </div>
        )}
      </div>
      <footer className="spaceBetween">
        <Button onClick={() => props.setStep("SELECT_MODE")}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          disabled={!name || !currency}
          onClick={handleSaveChange}
        >
          Create new account
        </Button>
      </footer>
    </div>
  );
}
