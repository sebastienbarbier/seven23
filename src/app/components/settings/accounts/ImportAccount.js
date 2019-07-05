import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import PropTypes from "prop-types";
import Dropzone from "react-dropzone";

import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

import LinearProgress from "@material-ui/core/LinearProgress";

import CloudDownload from "@material-ui/icons/CloudDownload";

import AccountsActions from "../../../actions/AccountsActions";

const styles = {
  dropzone: {
    fontSize: "0.8rem"
  }
};

export default function ImportAccount(props) {
  const dispatch = useDispatch();
  const [isImporting, setIsImporting] = useState(false);

  const _import = acceptedFiles => {
    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const json = JSON.parse(reader.result);
        setIsImporting(true);
        if (props.onImport) {
          props.onImport();
        }
        dispatch(AccountsActions.import(json))
          .then(() => {
            dispatch(AccountsActions.sync())
              .then(() => {
                dispatch(AccountsActions.refreshAccount());
              })
              .catch(exception => {
                console.error(exception);
              });
            setIsImporting(false);
          })
          .catch(exception => {
            if (props.onImport) {
              props.onImport(false);
            }
            console.error(exception);
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
          <Dropzone
            accept=".json"
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
        )}
      </div>
    </div>
  );
}
