import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import Button from "@mui/material/Button";

import TextField from "@mui/material/TextField";

import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";

import CircularProgress from "@mui/material/CircularProgress";

import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { Link } from "react-router-dom";

import AccountActions from "../../actions/AccountsActions";
import AppActions from "../../actions/AppActions";
import AutoCompleteSelectField from "../forms/AutoCompleteSelectField";
import ImportAccount from "../settings/accounts/ImportAccount";

import useRouteTitle from "../../hooks/useRouteTitle";

import ModalLayoutComponent from '../layout/ModalLayoutComponent';

export default function CreateAccount(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const titleObject = useRouteTitle();
  const currencies = useSelector((state) => state.currencies);

  const isLogged = useSelector((state) => state.server.isLogged);
  const [isLocal, setIsLocal] = useState(!isLogged || false);

  const [isImporting, setIsImporting] = useState(false);
  const loading = false;

  const [error, setError] = useState({});
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState(null);

  useEffect(() => {
    setIsLocal(!isLogged);
  }, [isLogged]);

  const handleSaveChange = (event) => {
    event.preventDefault();
    dispatch(
      AccountActions.create({
        name: name,
        currency: currency.id,
        isLocal: isLocal,
      })
    )
      .then((account) => {
        dispatch(AccountActions.switchAccount(account));
        navigate("/dashboard");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <ModalLayoutComponent
      title={ titleObject.title }
      content={<>
        <main className="" style={{ display: 'flex' }}>
          <ImportAccount onImport={() => {
            setIsImporting(true);
            navigate("/dashboard");
          }} />
        </main>
      </>}
      footer={<>
        <Stack direction='row' spacing={2} style={{ justifyContent: 'space-between'}}>
            <Link to="/select-account-type">
              <Button
                fullWidth
                color='inherit'
                variant="text"
              >
                Cancel
              </Button>
            </Link>
          </Stack>
      </>}
    />
  );
}