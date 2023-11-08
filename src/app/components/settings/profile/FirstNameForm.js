/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";

import UserActions from "../../../actions/UserActions";

import ModalLayoutComponent from '../../layout/ModalLayoutComponent';

export default function FirstNameForm({ onSubmit, onClose }) {
  const dispatch = useDispatch();

  const [firstname, setFirstname] = useState(
    useSelector(state => state.user.profile.first_name)
  );

  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);

  const save = e => {
    if (e) {
      e.preventDefault();
    }

    setError({});
    setLoading(true);

    dispatch(UserActions.update({ first_name: firstname }))
      .then(() => {
        onSubmit();
        setLoading(false);
      })
      .catch(error => {
        if (error && error["first_name"]) {
          setError(error);
          setLoading(false);
        }
      });
  };

  return (
    <ModalLayoutComponent
      title={'Firstname'}
      isLoading={loading}
      content={<>
        <Container>
          <form onSubmit={save}>
            <div className="form">
              <TextField
                label="Firstname"
                onChange={event => setFirstname(event.target.value)}
                disabled={loading}
                defaultValue={firstname}
                error={Boolean(error.first_name)}
                helperText={error.first_name}
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
            onclick={save}
            style={{ marginLeft: "8px" }}
          >
            Submit
          </Button>
        </Box>
      </>}
    />
  );
}