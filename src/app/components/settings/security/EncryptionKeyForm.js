/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";

import UserActions from "../../../actions/UserActions";

import Container from "@mui/material/Container";
import ModalLayoutComponent from '../../layout/ModalLayoutComponent';

export default function EncryptionKeyForm({ onSubmit, onClose }) {
  const dispatch = useDispatch();

  const cipher = useSelector(state => state.user.cipher);
  const [key, setKey] = useState('');

  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);

  const save = e => {
    if (e) {
      e.preventDefault();
    }

    if (key != cipher){
      setError({
        key: "Provided key isn't valid"
      });
    } else {

      setLoading(true);

      dispatch(UserActions.setBackupKey())
        .then(() => {
          onSubmit();
          setLoading(false);
        })
        .catch(error => {
          if (error && error["key"]) {
            setError(error);
            setLoading(false);
          } else {
            setError({
              key: "Provided key isn't valid"
            });
            setLoading(false);
          }
        });
    }
  };

  return (
    <ModalLayoutComponent
      title={'Verify your backup'}
      isLoading={loading}
      content={<>
        <Container>
          <form onSubmit={save}>
            <div className="form">
              <p>Provide here your encryption key to set your backup as done.</p>
              <TextField
                label="Encryption key from your backup"
                onChange={event => setKey(event.target.value)}
                disabled={loading}
                defaultValue={key}
                error={Boolean(error.key)}
                helperText={error.key}
                fullWidth
                margin="normal"
              />
            </div>
          </form>
        </Container>
      </>}
      footer={<>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row', width: '100%' }}>
          <Button color='inherit' onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            disableElevation
            onClick={save}
            style={{ marginLeft: "8px" }}
          >
            Verify
          </Button>
        </Box>
      </>}
    />
  );
}