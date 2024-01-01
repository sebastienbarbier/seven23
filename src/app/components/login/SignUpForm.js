import { useLocation } from "react-router-dom";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";

import UserActions from "../../actions/UserActions";
import useRouteTitle from "../../hooks/useRouteTitle";
import PasswordField from "../forms/PasswordField";

import ModalLayoutComponent from "../layout/ModalLayoutComponent";

const CSS_TITLE = {
  fontSize: "2.3em",
};

export default function SignUpForm(props) {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    showPassword: false,
  });

  const dispatch = useDispatch();
  const location = useLocation();
  const titleObject = useRouteTitle();
  const server = useSelector((state) => state.server);

  const [error, setError] = useState({});

  const [isLoading, setLoading] = useState(false);
  const [termsandconditions, setTermsandconditions] = useState(false);

  const [first_name, setFirst_name] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");

  const signup = (event) => {
    if (event) {
      event.preventDefault();
    }

    if (password1 != password2) {
      setError({
        password2: "The two password fields didn't match.",
      });
      return;
    }
    setLoading(true);

    dispatch(
      UserActions.create(
        username,
        first_name,
        email,
        password1,
        password2,
        window.location.href.split(location.pathname)[0]
      )
    )
      .then(() => {
        // Singup succeed, we can login the user
        dispatch(UserActions.fetchToken(username, password1))
          .then((res) => {
            // Switch to loading animation
            return dispatch(UserActions.login());
          })
          .then((res) => {
            setLoading(false);
            handleCancel();
            navigate("/");
          })
          .catch((error) => {
            if (error && error.response && error.response.data) {
              setLoading(false);
            } else {
              setLoading(false);
            }
          });
      })
      .catch((exception) => {
        let error = {};

        if (exception.response.data.field) {
          error[exception.response.data.field] =
            exception.response.data.errorMsg;
        } else {
          Object.keys(exception.response.data).forEach((key) => {
            error[key] = exception.response.data[key][0];
          });
        }

        setError(error);
        setLoading(false);
      });
  };

  const handleLogin = () => {
    props.onLogin();
  };

  const handleCancel = () => {
    props.onClose();
  };

  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleClickShowPassword = () => {
    setValues({
      ...values,
      showPassword: !values.showPassword,
    });
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <ModalLayoutComponent
      title={"Sign up"}
      content={
        <>
          <Container>
            <Box
              sx={{
                flexGrow: 1,
                overflow: "hidden",
                display: "flex",
                height: "100%",
              }}
            >
              <form onSubmit={signup}>
                {isLoading && (
                  <>
                    <Box
                      sx={{
                        position: "absolute",
                        background: "rgba(255, 255, 255, 0.5)",
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 999,
                      }}
                    >
                      <CircularProgress size={80} />
                    </Box>
                  </>
                )}
                <TextField
                  label="Username"
                  value={username}
                  error={Boolean(error.username)}
                  helperText={error.username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoFocus={true}
                  margin="normal"
                  fullWidth
                  disabled={isLoading}
                />
                <TextField
                  label="Firstname (optional)"
                  value={first_name}
                  error={Boolean(error.first_name)}
                  helperText={error.first_name}
                  onChange={(event) => setFirst_name(event.target.value)}
                  margin="normal"
                  fullWidth
                  disabled={isLoading}
                />
                <TextField
                  label="Email"
                  value={email}
                  error={Boolean(error.email)}
                  helperText={error.email}
                  onChange={(event) => setEmail(event.target.value)}
                  margin="normal"
                  fullWidth
                  disabled={isLoading}
                />
                <PasswordField
                  label="Password"
                  value={password1}
                  error={Boolean(error.password1)}
                  helperText={
                    error.password1 ||
                    `Password must be a minimum of 6 characters.`
                  }
                  onChange={(event) => setPassword1(event.target.value)}
                  fullWidth
                  disabled={isLoading}
                />
                <PasswordField
                  label="Repeat password"
                  value={password2}
                  error={Boolean(error.password2)}
                  helperText={error.password2}
                  onChange={(event) => setPassword2(event.target.value)}
                  fullWidth
                  disabled={isLoading}
                />
                <br />
                <input type="submit" style={{ display: "none" }} />
              </form>
            </Box>
          </Container>
        </>
      }
      footer={
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              flexDirection: "row-reverse",
              width: "100%",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              disableElevation
              onClick={signup}
              disabled={isLoading}
            >
              Sign up
            </Button>
            <Button
              color="inherit"
              disableElevation
              onClick={() => handleCancel()}
            >
              Cancel
            </Button>
          </Box>
        </>
      }
      isLoading={isLoading}
    />
  );
}
