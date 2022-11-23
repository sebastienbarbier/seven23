/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React from "react";
import { useSelector } from "react-redux";

import Container from "@mui/material/Container";
import Stack from '@mui/material/Stack';

import Button from "@mui/material/Button";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';

import EmailIcon from '@mui/icons-material/Email';

import ServerForm from "../login/ServerForm";
import ForgottenPasswordForm from "../login/ForgottenPasswordForm";
import ConnectToAServer from "../welcoming/ConnectToAServer";

export default function SignInSignUp(props) {

  const server = useSelector(state => state.server);

  const handleChangeServer = (change = null) => {
    props.onModal(<ServerForm
      onSubmit={() => props.onModal()}
      onClose={() => props.onModal()}
    />);
  };

  const handleForgottenPassword = () => {
    props.onModal(<ForgottenPasswordForm
      onSubmit={() => props.onModal()}
      onClose={() => props.onModal()}
    />);
  }

  const handleLoginUsername = () => {
    props.onModal(<ConnectToAServer
      onChangeServer={() => handleChangeServer()}
      onForgottenPassword={() => handleForgottenPassword()}
      onSubmit={() => props.onModal()}
      onClose={() => props.onModal()}
    />);
  }

  return (
    <Container className="layout_content wrapperMobile">
      <h2>Sign In / Sign Up</h2>
      <h3>Instance</h3>
      <p>Sign in allow Multi device sync and Cloud backup.</p>

      <Stack 
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 1, sm: 2, md: 4 }}>
        <Card sx={{ minWidth: 275 }}>
          <CardContent>
            <h4>{ server.name }</h4>
            <p>{ server.trial_period ? <>
              <p>{ server.trial_period } days trial period</p>
            </> : <>
              <p>No trial period</p>
            </> }</p>
          </CardContent>
        </Card>
      </Stack>

      <Button
        style={{ marginTop: 20 }} 
        onClick={() => handleChangeServer()}>Change instance</Button>

      <h3>Sign In</h3>
      <Button
        variant="outlined"
        startIcon={<EmailIcon />}
        onClick={() => handleLoginUsername()}
        >Connect by Username</Button>

      <h3>Sign up</h3>
      <p>Sign Up</p>
    </Container>
  );
}