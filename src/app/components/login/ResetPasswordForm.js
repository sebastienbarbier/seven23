import axios from "axios";
import md5 from "blueimp-md5";
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "../../router";

import UserActions from "../../actions/UserActions";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";
import ActionCheckCircle from "@material-ui/icons/CheckCircle";
import LinearProgress from "@material-ui/core/LinearProgress";

const styles = {
  fullWidth: {
    width: "100%",
    marginBottom: "16px"
  },
  loading: {
    margin: "8px 20px 0px 20px"
  },
  icon: {
    width: "40px",
    height: "40px",
    marginRight: 12,
    marginTop: -5,
    marginLeft: 20,
    verticalAlign: "middle"
  }
};

export default function ResetPasswordForm(props) {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);

  // Read URL to get uid, token, and username
  const search = window.location.search.slice(1);
  const uid = search.split("&")[0].split("=")[1];
  const [token, setToken] = useState(search.split("&")[1].split("=")[1]);
  const username = search.split("&")[2].split("=")[1];

  const [new_password1, setNewPassword1] = useState("");
  const [new_password2, setNewPassword2] = useState("");
  const [newCipher, setNewCipher] = useState("");
  const [oldCipher, setOldCipher] = useState("");

  const [loading, setLoading] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [decrypted, setDecrypted] = useState(false);
  const [done, setDone] = useState(false);

  const [error, setError] = useState({});

  const handleSaveChange = event => {
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
        new_password2
      }
    })
      .then(response => {
        dispatch(UserActions.fetchToken(username, new_password1, true))
          .then(token => {
            setToken(token);
            setNewCipher(md5(new_password1));
            setLoading(false);
            setDone(true);
          })
          .catch(exception => {
            console.error(exception);
            setLoading(false);
          });
      })
      .catch(function(ex) {
        setLoading(false);
        setError({
          email: "An error occured and prevented the email to be send."
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

  // Animate opening
  useEffect(() => {
    setTimeout(() => setIsOpen(true), 10);
  }, []);

  return (
    <div className="welcoming__wrapper">
      <div className={`welcoming__step ${isOpen ? "open" : "backward"}`}>
        <form
          onSubmit={event => handleSaveChange(event)}
          className="welcoming__layout"
        >
          <header>
            <h2>Reset password</h2>
          </header>
          <div className="content">
            {isEncrypting ? (
              <div>
                <p>Decrypting</p>
                <LinearProgress style={styles.fullWidth} />
              </div>
            ) : (
              ""
            )}
            {!isEncrypting && done && decrypted ? (
              <div>
                <p>
                  All done, you can now access you account as usual threw the
                  login page.
                </p>
              </div>
            ) : (
              ""
            )}
            {!isEncrypting && done && !decrypted ? (
              <div>
                <p>
                  <ActionCheckCircle style={styles.icon} /> Password has
                  successfuly been modified.
                </p>
                <p>
                  We now need to decrypt your data and re-encrypt them with your
                  new password. We need you to provide us your encryption key
                  which we asked you to save when creating your account:
                </p>
                <TextField
                  label="Recovery encryption key"
                  type="text"
                  style={styles.fullWidth}
                  value={oldCipher}
                  error={Boolean(error.oldCipher)}
                  helperText={error.oldCipher}
                  onChange={event => setOldCipher(event.target.value)}
                  margin="normal"
                  fullWidth
                />
              </div>
            ) : (
              ""
            )}
            {!isEncrypting && !done && !decrypted ? (
              <div>
                <TextField
                  label="New password"
                  type="password"
                  style={styles.fullWidth}
                  value={new_password1}
                  error={Boolean(error.new_password1)}
                  helperText={error.new_password1}
                  onChange={event => setNewPassword1(event.target.value)}
                  margin="normal"
                  fullWidth
                />
                <TextField
                  label="Repeat new password"
                  type="password"
                  style={styles.fullWidth}
                  value={new_password2}
                  error={Boolean(error.new_password2)}
                  helperText={error.new_password2}
                  onChange={event => setNewPassword2(event.target.value)}
                  margin="normal"
                  fullWidth
                />
              </div>
            ) : (
              ""
            )}
          </div>
          <footer className="spaceBetween">
            <Button onClick={() => props.onClose()}>CLose</Button>
            {!done && !decrypted ? (
              <div>
                {loading ? (
                  <CircularProgress size={20} style={styles.loading} />
                ) : (
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={done}
                  >
                    Reset password
                  </Button>
                )}
              </div>
            ) : (
              ""
            )}
            {done && !decrypted && !isEncrypting ? (
              <div>
                <Button onClick={decrypt}>Decrypt your data</Button>
              </div>
            ) : (
              ""
            )}
          </footer>
        </form>
      </div>
    </div>
  );
}
