import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import PropTypes from "prop-types";
import Dropzone from "react-dropzone";

import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

import LinearProgress from "@mui/material/LinearProgress";

import CloudDownload from "@mui/icons-material/CloudDownload";

import AccountsActions from "../../../actions/AccountsActions";
import AppActions from "../../../actions/AppActions";

const styles = {
  dropzone: {
    fontSize: "0.8rem"
  }
};

export default function ImportAccount(props) {
  const dispatch = useDispatch();
  const [isImporting, setIsImporting] = useState(false);
  const isLogged = useSelector(state => state.server.isLogged);
  const [isLocal, setIsLocal] = useState(!isLogged || false);

  const _import = acceptedFiles => {
    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const json = JSON.parse(reader.result);
        setIsImporting(true);
        if (props.onImport) {
          props.onImport();
        }
        dispatch(AccountsActions.import(json, isLocal))
          .then(() => {
            dispatch(AccountsActions.refreshAccount());
            setIsImporting(false);
          })
          .catch(exception => {
            if (props.onImport) {
              props.onImport(false);
            }
            setIsImporting(false);
            dispatch(AppActions.snackbar(`${exception}`));
          });
      };
      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");

      reader.readAsText(file);
    });
  };

  return (
    <div>
      <div style={{ display: "flex" }}>
        {isImporting ? (
          <div style={{ marginTop: 10, flexGrow: 1 }}>
            <LinearProgress />
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: 20,
              flex: "100%"
            }}
          >
            {isLogged && (
              <FormGroup style={{ paddingBottom: 20 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Boolean(isLocal || !isLogged)}
                      disabled={Boolean(!isLogged)}
                      onChange={() => setIsLocal(!isLocal)}
                      value="isLocal"
                      color="primary"
                    />
                  }
                  label="Only save on device"
                />
              </FormGroup>
            )}
            <Dropzone
              accept={{
                'application/json': ['.json']
              }}
              onDrop={acceptedFiles => _import(acceptedFiles)}
            >
              {({ getRootProps, getInputProps }) => (
                <section style={styles.dropzone} className="dropzone">
                  <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <CloudDownload
                      style={{ marginRight: 12, position: "relative", top: 6 }}
                    />{" "}
                    Click, or drop a <em>.json</em> file
                  </div>
                </section>
              )}
            </Dropzone>
          </div>
        )}
      </div>
    </div>
  );
}
