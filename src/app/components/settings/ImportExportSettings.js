import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import moment from "moment";

import Container from "@mui/material/Container";

import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";

import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";

import CircularProgress from "@mui/material/CircularProgress";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";

import ListSubheader from "@mui/material/ListSubheader";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

import CloudUpload from "@mui/icons-material/CloudUpload";

import AccountsActions from "../../actions/AccountsActions";
import AppActions from "../../actions/AppActions";
import ImportAccount from "./accounts/ImportAccount";

const styles = {
  form: {
    margin: "30px 40px",
  },
};

export default function ImportExportSettings(props) {
  const dispatch = useDispatch();
  const account = useSelector((state) => state.account);
  const server = useSelector((state) => state.server);
  const accounts = useSelector((state) => state.accounts);
  const location = useLocation();

  const [tabs, setTabs] = useState("import");
  const [id, setId] = useState(account.id);
  const [isExporting, setIsExporting] = useState(false);

  const _export = () => {
    setIsExporting(true);
    const account = [...accounts.remote, ...accounts.local].find(
      (a) => a.id === id
    );

    dispatch(AccountsActions.export(id))
      .then((json) => {
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
      .catch((exception) => {
        console.error(exception);
        setIsExporting(false);
      });
  };

  useEffect(() => {
    dispatch(AppActions.setNavBar("Import / Export", "/settings", null, 48));
  }, [location]);

  const ref = document.getElementById("container_header_component");

  const comp = (
    <Container sx={{ color: "white" }} className="wrapperMobile">
      <Tabs
        centered
        variant="fullWidth"
        value={tabs}
        textColor="inherit"
        onChange={(event, value) => setTabs(value)}
      >
        <Tab label="Import" value="import" />
        <Tab label="Export" value="export" />
      </Tabs>
    </Container>
  );

  return (
    <div>
      {ref && createPortal(comp, ref)}
      <div
        className="hideMobile"
        style={{ background: "var(--primary-color)" }}
      >
        {comp}
      </div>
      <div className="layout_content wrapperMobile">
        {tabs === "import" && (
          <div style={{ minHeight: "300px", display: "flex" }}>
            <ImportAccount />
          </div>
        )}
        {tabs === "export" && (
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
                onChange={(event) => setId(event.target.value)}
                disabled={isExporting}
                inputProps={{
                  name: "account",
                }}
              >
                <ListSubheader>{server.name}</ListSubheader>
                {accounts.remote.map((account) => (
                  <MenuItem
                    key={account.id}
                    value={account.id}
                    style={{ padding: 10 }}
                  >
                    {account.name}
                  </MenuItem>
                ))}
                <ListSubheader>On device</ListSubheader>
                {accounts.local.map((account) => (
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
        )}
      </div>
    </div>
  );
}
