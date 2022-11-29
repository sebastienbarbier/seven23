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
import UserActions from "../../actions/UserActions";
import AutoCompleteSelectField from "../forms/AutoCompleteSelectField";
import ImportAccount from "../settings/accounts/ImportAccount";

export default function CreateAccount(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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

  const logout = () => {
    dispatch(UserActions.logout(true)).then(() => {
      navigate("/");
    });
  };

  return (
    <div className="layout dashboard mobile">
      <header className="layout_header">
        <Container className="layout_header_top_bar">
          <h2>Import a <code>.json</code> file</h2>
        </Container>
      </header>
      <main className="layout_content" style={{ display: 'flex' }}>
        <Container className="content" style={{ display: 'flex' }}>
          <ImportAccount onImport={() => {
            setIsImporting(true);
            navigate("/");
          }} />
        </Container>
      </main>
      <footer className="layout_footer">
        <Container>
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
        </Container>
      </footer>
    </div>
  );
}