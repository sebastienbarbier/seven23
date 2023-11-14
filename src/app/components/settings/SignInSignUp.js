/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import Container from "@mui/material/Container";
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';

import AddIcon from '@mui/icons-material/Add';

import List from "@mui/material/List";
import ListSubheader from "@mui/material/ListSubheader";

import EmailIcon from '@mui/icons-material/Email';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';

import ServerForm from "../login/ServerForm";
import ForgottenPasswordForm from "../login/ForgottenPasswordForm";
import LoginForm from "../welcoming/LoginForm";
import SignUpForm from "../login/SignUpForm";
import TermsAndConditions from "../login/TermsAndConditions";
import { pink } from '@mui/material/colors';

import AppActions from "../../actions/AppActions";
import ServerActions from "../../actions/ServerActions";

import ServerSelector from './servers/ServerSelector';

export default function SignInSignUp(props) {

  const dispatch = useDispatch();

  const server = useSelector(state => state.server);

  const isLoading = useSelector(state => state.state.isConnecting);

  // On init we fatch Server details
  useEffect(() => {
    dispatch(ServerActions.connect(server.url));
  }, []);

  const handleChangeServer = (change = null) => {
    dispatch(AppActions.openModal(<ServerForm
      onSubmit={() => dispatch(AppActions.closeModal())}
      onClose={() => dispatch(AppActions.closeModal())}
    />));
  };

  const handleForgottenPassword = () => {
    dispatch(AppActions.openModal(<ForgottenPasswordForm
      onSubmit={() => dispatch(AppActions.closeModal())}
      onClose={() => dispatch(AppActions.closeModal())}
    />));
  }

  const handleLoginUsername = () => {
    dispatch(AppActions.openModal(<LoginForm
      onChangeServer={() => handleChangeServer()}
      onForgottenPassword={() => handleForgottenPassword()}
      onSubmit={() => dispatch(AppActions.closeModal())}
      onClose={() => dispatch(AppActions.closeModal())}
    />));
  }

  const handleSignUp = () => {
    dispatch(AppActions.openModal(<SignUpForm
      onLogin={() => handleLoginUsername()}
      onClose={() => dispatch(AppActions.closeModal())}
    />));
  }

  const handleTermsAndConditions = () => {
    dispatch(AppActions.openModal(<TermsAndConditions
      onClose={() => dispatch(AppActions.closeModal())}
    />));
  }

  const is_account_creation_disabled = !server.allow_account_creation;

  return (
    <>
      <List>
        <ListSubheader disableSticky={true}>Servers</ListSubheader>
      </List>

      <ServerSelector />

      <List>
        <ListSubheader disableSticky={true}>Connect to { server.name }</ListSubheader>
      </List>

      <Container>
        <Stack
          justifyContent="space-evenly"
          alignItems="center"
          direction="column"
          spacing={2}
          divider={<Divider orientation="vertical" flexItem />}>
          <div>
            <h4>Features</h4>
            { !isLoading && server.products && server.products.map((product, i) =>
              <p key={product.pk}><strong>{ product.price } { product.currency }</strong> for <strong>{ product.duration } months</strong></p>
            ) }

            { isLoading && <span className="loading w220" /> }
            { server.saas && !isLoading &&
              (server.trial_period ?
              <p style={{ display: 'flex', verticalAlign: 'bottom'}}>
                <CheckCircleOutlineIcon style={{ marginRight: 10, marginTop: -2 }} color="success" /> { server.trial_period } days trial period,<br/>no credit card needed
              </p>
              :
              <p style={{ display: 'flex', verticalAlign: 'bottom'}}>
                <DoNotDisturbAltIcon style={{ marginRight: 10, marginTop: -2 }}  sx={{ color: pink[500] }} /> No trial period
              </p>)
            }
            { !isLoading && is_account_creation_disabled &&<>
               <p style={{ display: 'flex', verticalAlign: 'bottom'}}>
                <DoNotDisturbAltIcon style={{ marginRight: 10, marginTop: -2 }}  sx={{ color: pink[500] }} /> Signup is disabled by administrator
              </p>
            </> }
            <p style={{ display: 'flex', verticalAlign: 'bottom'}}>
              <CheckCircleOutlineIcon style={{ marginRight: 10, marginTop: -2 }} color="success" /> Multi device syncing
            </p>
            <p style={{ display: 'flex', verticalAlign: 'bottom'}}>
              <CheckCircleOutlineIcon style={{ marginRight: 10, marginTop: -2 }} color="success" /> Encrypted data backup
            </p>
          </div>
        </Stack>
        <Stack
          style={{ width: '100%' }}
          justifyContent="space-evenly"
          alignItems="center"
          direction="row"
          spacing={2}>
         { !is_account_creation_disabled && <Button
            disabled={is_account_creation_disabled || isLoading}
            fullWidth
            onClick={() => handleSignUp()}
          >Sign Up</Button> }

          <Button
            fullWidth
            disabled={isLoading}
            disableElevation
            onClick={() => handleLoginUsername()}
            >Log in</Button>
        </Stack>
        <div style={{ opacity: 0.8, textAlign: 'center', marginTop: '1em' }}>
          { isLoading && <span className="loading w400" /> }
          { !isLoading && <Typography component="p" style={{ fontSize: '0.8em' }}>By clicking Sign up, you agree to { server.name }'s <a href="#" onClick={(event) => { event.preventDefault(); handleTermsAndConditions(); }}> <strong>Terms and Conditions</strong> and <strong>Privacy Statement</strong></a></Typography> }
        </div>
      </Container>
    </>
  );
}