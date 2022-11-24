/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React from "react";
import { useSelector } from "react-redux";

import Container from "@mui/material/Container";
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import Button from "@mui/material/Button";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';

import EmailIcon from '@mui/icons-material/Email';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';

import ServerForm from "../login/ServerForm";
import ForgottenPasswordForm from "../login/ForgottenPasswordForm";
import ConnectToAServer from "../welcoming/ConnectToAServer";
import SignUpForm from "../login/SignUpForm";
import { pink } from '@mui/material/colors';

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

  const handleSignUp = () => {
    props.onModal(<SignUpForm
      onLogin={() => handleLoginUsername()}
      onClose={() => props.onModal()}
    />);
  }

  const is_account_creation_disabled = !server.allow_account_creation;

  return (
    <Container className="layout_content wrapperMobile">
      <Stack
        style={{ marginTop: 30 }}
        spacing={{ xs: 1, sm: 2, md: 4 }}>
        <Card>
          <CardContent>
            <Stack justifyContent="space-between" alignItems="flex-start" direction="row" spacing={2}>
              <div>
                <Typography component="h3" variant="h4">
                  { server.name }
                </Typography>
                { server.isOfficial && <strong><Chip label="Official instance" size="small" /></strong>}
              </div>

              <Button
                size="small"
                style={{ marginLeft: 50 }}
                onClick={() => handleChangeServer()}>Change instance</Button>
            </Stack>

            <Stack 
              justifyContent="space-evenly" 
              alignItems="center" 
              direction="row" 
              spacing={4} 
              divider={<Divider orientation="vertical" flexItem />}>
              <div>
                <h4>Pricing</h4>
                { server.products.map((product) => <>
                    <p><strong>{ product.price } { product.currency }</strong> for <strong>{ product.duration } months</strong></p>
                  </>) }

                { server.trial_period ? <>
                  <p style={{ display: 'flex', verticalAlign: 'bottom'}}>
                    <CheckCircleOutlineIcon style={{ marginRight: 10, marginTop: -2 }} color="success" /> { server.trial_period } days trial period
                  </p>
                </> : <>
                   <p style={{ display: 'flex', verticalAlign: 'bottom'}}>
                    <DoNotDisturbAltIcon style={{ marginRight: 10, marginTop: -2 }}  sx={{ color: pink[500] }} /> No trial period
                  </p>
                </> }
              </div>
              <div>
                <h4>Features</h4>
                <p style={{ display: 'flex', verticalAlign: 'bottom'}}>
                  <CheckCircleOutlineIcon style={{ marginRight: 10, marginTop: -2 }} color="success" /> Multi device syncing
                </p>
                <p style={{ display: 'flex', verticalAlign: 'bottom'}}>
                  <CheckCircleOutlineIcon style={{ marginRight: 10, marginTop: -2 }} color="success" /> Cloud data backup
                </p>
                
              </div>
            </Stack>
            
          </CardContent>
          <CardActions>
            <Button
              onClick={() => handleLoginUsername()}
              >Login</Button>

             { !is_account_creation_disabled && <Button
                disabled={is_account_creation_disabled}
                onClick={() => handleSignUp()}
              >Sign Up</Button> }
          </CardActions>
        </Card>
      </Stack>

      <Stack spacing={2}>
        { is_account_creation_disabled && <>
          <Alert severity="warning">
            <AlertTitle><strong>Signup is disabled</strong></AlertTitle>
            Please contact the administrator for further informations: <strong><a href={`mailto:${server.contact}`}>{ server.contact }</a></strong>
          </Alert>
        </>}
      </Stack>


      <h3>Self hosted instance</h3>

      <p>Seven23 is an open source project and allows you to host your own instance. More details available within the official documentation.</p>
    </Container>
  );
}