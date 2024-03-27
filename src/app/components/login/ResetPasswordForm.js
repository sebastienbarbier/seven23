import axios from "axios";
import md5 from "blueimp-md5";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import LoadingButton from "@mui/lab/LoadingButton";

import Stack from "@mui/material/Stack";

import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

import UserActions from "../../actions/UserActions";
import PasswordField from "../forms/PasswordField";

const styles = {
  fullWidth: {
    width: "100%",
    marginBottom: "16px",
  },
  loading: {
    margin: "8px 20px 0px 20px",
  },
  icon: {
    width: "40px",
    height: "40px",
    marginRight: 12,
    marginTop: -5,
    marginLeft: 20,
    verticalAlign: "middle",
  },
};

export default function ResetPasswordForm(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Read URL to get uid, token, and username
  const search = window.location.search.slice(1);
  const uid = search.split("&")[0].split("=")[1];
  const [token, setToken] = useState(search.split("&")[1].split("=")[1]);
  const username = search.split("&")[2].split("=")[1];

  const [new_password1, setNewPassword1] = useState("");
  const [new_password2, setNewPassword2] = useState("");
  const [newCipher, setNewCipher] = useState("");
  const [oldCipher, setOldCipher] = useState("");

  // Step 1
  const [done, setDone] = useState(false); // Change password is done
  const [loading, setLoading] = useState(false);
  // Step 2
  const [isEncrypting, setIsEncrypting] = useState(false);
  // Step3 done
  const [decrypted, setDecrypted] = useState(false);

  const [error, setError] = useState({});

  const handleSaveChange = (event) => {
    if (event) {
      event.preventDefault();
    }

    setLoading(true);
    setError({});

    axios({
      url: "/api/v1/rest-auth/password/reset/confirm/",
      method: "post",
      data: {
        uid,
        token,
        new_password1,
        new_password2,
      },
    })
      .then((response) => {
        dispatch(UserActions.fetchToken(username, new_password1, true))
          .then((token) => {
            setToken(token);
            setNewCipher(md5(new_password1));
            setLoading(false);
            setDone(true);
          })
          .catch((exception) => {
            console.error(exception);
            setLoading(false);
          });
      })
      .catch(function (ex) {
        setLoading(false);
        setError({
          email: "An error occured and prevented the email to be send.",
        });
      });
  };

  const decrypt = () => {
    setIsEncrypting(true);

    dispatch(UserActions.updateServerEncryption(token, newCipher, oldCipher))
      .then(() => {
        setIsEncrypting(false);
        setDecrypted(true);
      })
      .catch(() => {
        setIsEncrypting(false);
        setDecrypted(false);
      });
  };

  return (
    <form onSubmit={(event) => handleSaveChange(event)}>
      {/* ASK NEW PASSOWRD TO SET UP */}
      {!done && !decrypted && (
        <Stack spacing={2}>
          <PasswordField
            label="New password"
            type="password"
            value={new_password1}
            error={Boolean(error.new_password1)}
            helperText={error.new_password1}
            onChange={(event) => setNewPassword1(event.target.value)}
          />
          <PasswordField
            label="Repeat new password"
            type="password"
            value={new_password2}
            error={Boolean(error.new_password2)}
            helperText={error.new_password2}
            onChange={(event) => setNewPassword2(event.target.value)}
          />
          <LoadingButton
            type="submit"
            loading={loading}
            disabled={done}
            variant="contained"
          >
            Reset password
          </LoadingButton>
        </Stack>
      )}

      {/* EDIT PASSWORD, THEN ASK FOR RECOVERY KEY*/}
      {done && !decrypted && (
        <Stack spacing={2}>
          {!isEncrypting && (
            <Alert severity="success">
              Your password has been successfuly modified.
            </Alert>
          )}
          <p>
            To decrypt and migrate your data, you will now need to provide your
            previous encryption key. This key is necessary for decrypting your
            data, and without it, you will not be able to access your recover
            your informations.
          </p>
          <TextField
            label="Recovery encryption key"
            type="text"
            style={styles.fullWidth}
            value={oldCipher}
            error={Boolean(error.oldCipher)}
            helperText={error.oldCipher}
            onChange={(event) => setOldCipher(event.target.value)}
            margin="normal"
            fullWidth
          />
          <LoadingButton
            onClick={decrypt}
            loading={isEncrypting}
            variant="contained"
          >
            Decrypt and migrate your data
          </LoadingButton>
        </Stack>
      )}

      {/* DECRYPTING IS DONE AND USER CAN NOW LOGIN */}
      {done && decrypted && (
        <Stack spacing={2}>
          <Alert severity="success">
            <AlertTitle>All done, </AlertTitle>
            You can now access you account as usual threw the login page.
          </Alert>
          <Button variant="contained" onClick={() => navigate("/")}>
            Go to login
          </Button>
        </Stack>
      )}
    </form>
  );
}
