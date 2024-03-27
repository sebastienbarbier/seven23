/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";

import { Amount } from "../currency/Amount";

import LinearProgress from "@mui/material/LinearProgress";

import List from "@mui/material/List";
import ListSubheader from "@mui/material/ListSubheader";

import EmailIcon from "@mui/icons-material/Email";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DoNotDisturbAltIcon from "@mui/icons-material/DoNotDisturbAlt";

import { pink } from "@mui/material/colors";
import LoginForm from "../launcher/LoginForm";
import ForgottenPasswordForm from "../login/ForgottenPasswordForm";
import ServerForm from "../login/ServerForm";
import SignUpForm from "../login/SignUpForm";
import TermsAndConditions from "../login/TermsAndConditions";

import AppActions from "../../actions/AppActions";
import ServerActions from "../../actions/ServerActions";

import ServerSelector from "./servers/ServerSelector";

export default function SignInSignUp(props) {
  const dispatch = useDispatch();

  const server = useSelector((state) => state.server);
  const currencies = useSelector((state) => state.currencies);
  const isLoading = useSelector((state) => state.state.isConnecting);
  const isConnected = useSelector((state) => state.server.isConnected);

  // On init we fatch Server details
  useEffect(() => {
    connectToServer();
  }, []);

  const connectToServer = () => {
    dispatch(ServerActions.connect(server.url)).catch(() => {});
  };

  const handleChangeServer = () => {
    dispatch(
      AppActions.openModal(
        <ServerForm
          onSubmit={() => dispatch(AppActions.closeModal())}
          onClose={() => dispatch(AppActions.closeModal())}
        />
      )
    );
  };

  const handleForgottenPassword = () => {
    dispatch(
      AppActions.openModal(
        <ForgottenPasswordForm
          onSubmit={() => dispatch(AppActions.closeModal())}
          onClose={() => dispatch(AppActions.closeModal())}
        />
      )
    );
  };

  const handleLoginUsername = () => {
    dispatch(
      AppActions.openModal(
        <LoginForm
          onChangeServer={() => handleChangeServer()}
          onForgottenPassword={() => handleForgottenPassword()}
          onSubmit={() => dispatch(AppActions.closeModal())}
          onClose={() => dispatch(AppActions.closeModal())}
        />
      )
    );
  };

  const handleSignUp = () => {
    dispatch(
      AppActions.openModal(
        <SignUpForm
          onLogin={() => handleLoginUsername()}
          onClose={() => dispatch(AppActions.closeModal())}
        />
      )
    );
  };

  const handleTermsAndConditions = () => {
    dispatch(
      AppActions.openModal(
        <TermsAndConditions onClose={() => dispatch(AppActions.closeModal())} />
      )
    );
  };

  const is_account_creation_disabled = !server.allow_account_creation;

  return (
    <>
      <List>
        <ListSubheader disableSticky={true}>Servers</ListSubheader>
      </List>

      <ServerSelector />

      <List>
        <ListSubheader disableSticky={true}>
          Connected to {server.name}
        </ListSubheader>
      </List>

      {!isConnected && isLoading && (
        <Container>
          <LinearProgress />
        </Container>
      )}

      {!isConnected && !isLoading && (
        <Container>
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  connectToServer();
                }}
              >
                Try again
              </Button>
            }
          >
            Connection to {server.url} failed
          </Alert>
        </Container>
      )}

      {isConnected && (
        <>
          <Container sx={{ flexGrow: 1 }}>
            <Grid container spacing={4}>
              <Grid xs={12} lg={8}>
                <Stack
                  alignItems="flex-start"
                  direction="column"
                  spacing={2}
                  sx={{ pt: 1, pb: 2 }}
                >
                  <Typography>
                    Signed in account allows you to{" "}
                    <strong>sync your data with encryption</strong> between{" "}
                    <strong>multiple devices</strong>.
                  </Typography>

                  <div style={{ width: "100%" }}>
                    {!isLoading && !!server.stripe_prices && (
                      <Typography variant="caption">Pricing</Typography>
                    )}
                    {!isLoading &&
                      server.stripe_prices &&
                      server.stripe_prices
                        .sort((a, b) => a.price > b.price)
                        .map((product, i) => (
                          <>
                            <div className="pricing" key={product.pk}>
                              <p className="price">
                                {product.currency == "EUR" && (
                                  <>
                                    <Amount
                                      value={product.price}
                                      currency={currencies.find(
                                        (c) => c.id == 1
                                      )}
                                    />
                                  </>
                                )}

                                {product.currency != "EUR" && (
                                  <>
                                    <p>
                                      {product.price} {product.currency}
                                    </p>
                                  </>
                                )}
                              </p>
                              <p className="duration">
                                {product.duration} months
                              </p>
                            </div>
                          </>
                        ))}
                  </div>

                  {isLoading && <span className="loading w220" />}

                  {server.saas &&
                    !isLoading &&
                    (server.trial_period ? (
                      <Typography
                        sx={{
                          display: "flex",
                          width: "100%",
                          justifyContent: "center",
                          verticalAlign: "bottom",
                          pt: 2,
                        }}
                      >
                        <CheckCircleOutlineIcon
                          sx={{ mr: 2 }}
                          color="success"
                        />{" "}
                        <strong>{server.trial_period} days trial period</strong>
                        ,{" "}
                        <em style={{ marginLeft: 2 }}>no credit card needed</em>
                        .
                      </Typography>
                    ) : (
                      <p style={{ display: "flex", verticalAlign: "bottom" }}>
                        <DoNotDisturbAltIcon
                          style={{ marginRight: 10, marginTop: -2 }}
                          sx={{ color: pink[500] }}
                        />{" "}
                        No trial period.
                      </p>
                    ))}

                  {!isLoading && is_account_creation_disabled && (
                    <>
                      <p style={{ display: "flex", verticalAlign: "bottom" }}>
                        <DoNotDisturbAltIcon
                          style={{ marginRight: 10, marginTop: -2 }}
                          sx={{ color: pink[500] }}
                        />{" "}
                        Signup is disabled by administrator.
                      </p>
                    </>
                  )}
                </Stack>
              </Grid>
              <Grid xs={12} lg={4}>
                <Stack
                  style={{
                    width: "100%",
                    maxWidth: "400px",
                    margin: "auto",
                    height: "100%",
                  }}
                  justifyContent="center"
                  alignItems="center"
                  direction="column"
                  spacing={2}
                >
                  <Button
                    fullWidth
                    disabled={isLoading}
                    disableElevation
                    variant="contained"
                    startIcon={<EmailIcon />}
                    onClick={() => handleLoginUsername()}
                  >
                    Sign In with Email
                  </Button>
                  {!is_account_creation_disabled && (
                    <Button
                      disabled={is_account_creation_disabled || isLoading}
                      fullWidth
                      startIcon={<PersonAddIcon />}
                      onClick={() => handleSignUp()}
                    >
                      Sign Up with Email
                    </Button>
                  )}
                </Stack>
              </Grid>
            </Grid>
            <div
              style={{ opacity: 0.8, textAlign: "center", marginTop: "1em" }}
            >
              {isLoading && <span className="loading w400" />}
              {!isLoading && (
                <Typography component="p" style={{ fontSize: "0.8em" }}>
                  By clicking Sign Up or Sign In, you agree to {server.name}
                  &apos;s{" "}
                  <a
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      handleTermsAndConditions();
                    }}
                  >
                    {" "}
                    <strong>Terms and Conditions</strong> and{" "}
                    <strong>Privacy Statement</strong>
                  </a>
                </Typography>
              )}
            </div>
          </Container>
        </>
      )}
    </>
  );
}
