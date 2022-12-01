/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import Container from "@mui/material/Container";
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
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
import LoginForm from "../welcoming/LoginForm";
import SignUpForm from "../login/SignUpForm";
import TermsAndConditions from "../login/TermsAndConditions";
import { pink } from '@mui/material/colors';

import ServerActions from "../../actions/ServerActions";

export default function SignInSignUp(props) {

  const dispatch = useDispatch();
  const server = useSelector(state => state.server);

  // On init we fatch Server details
  useEffect(() => {
    dispatch(ServerActions.init());
  }, []);

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
    props.onModal(<LoginForm
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

  const handleTermsAndConditions = () => {
    props.onModal(<TermsAndConditions
      onClose={() => props.onModal()}
    />);
  }

  const is_account_creation_disabled = !server.allow_account_creation;

  return (
    <Container className="layout_content wrapperMobile">
      <Grid container spacing={2}>
        <Grid item xs={12}>
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
                    { server.products && server.products.map((product, i) => 
                      <p key={product.pk}><strong>{ product.price } { product.currency }</strong> for <strong>{ product.duration } months</strong></p>
                    ) }

                    { server.trial_period ? <>
                      <p style={{ display: 'flex', verticalAlign: 'bottom'}}>
                        <CheckCircleOutlineIcon style={{ marginRight: 10, marginTop: -2 }} color="success" /> { server.trial_period } days trial period,<br/>no credit card needed
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
                      <CheckCircleOutlineIcon style={{ marginRight: 10, marginTop: -2 }} color="success" /> Encrypted data backup
                    </p>
                  </div>
                </Stack>
                
              </CardContent>
              <CardActions>
                <Stack 
                  style={{ width: '100%' }}
                  justifyContent="space-evenly" 
                  alignItems="center" 
                  direction="row"
                  spacing={2}>
                 { !is_account_creation_disabled && <Button
                    disabled={is_account_creation_disabled}
                    fullWidth
                    onClick={() => handleSignUp()}
                  >Sign Up</Button> }

                  <Button
                    fullWidth
                    disableElevation
                    onClick={() => handleLoginUsername()}
                    >Log in</Button>
                </Stack>
              </CardActions>
            </Card>
            <Typography component="p" style={{ opacity: 0.8, fontSize: '0.8em', textAlign: 'center', marginTop: '1em' }}>By clicking Sign up, you agree to { server.name }'s <a href="#" onClick={(event) => { event.preventDefault(); handleTermsAndConditions(); }}> <strong>Terms and Conditions</strong> and <strong>Privacy Statement</strong></a></Typography>

          </Stack>
        </Grid>

        { is_account_creation_disabled && <Grid item xs={12}>
          <Stack spacing={2}>
            <Alert severity="warning">
              <AlertTitle><strong>Signup is disabled</strong></AlertTitle>
              Please contact the administrator for further informations: <strong><a href={`mailto:${server.contact}`}>{ server.contact }</a></strong>
            </Alert>
          </Stack>
        </Grid> }


        <Grid item xs={6}>
          <h3>Self hosted instance</h3>

          <p>Seven23 is an open source project which allows you to host your own instance. More details available within the official documentation.</p>
        </Grid>
      </Grid>
    </Container>
  );
}