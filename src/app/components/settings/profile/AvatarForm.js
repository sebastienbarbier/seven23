/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";

import Container from "@mui/material/Container";
import UserActions from "../../../actions/UserActions";
import ModalLayoutComponent from "../../layout/ModalLayoutComponent";

export default function AvatarForm(props) {
  const dispatch = useDispatch();
  const [avatar, setAvatar] = useState(props.avatar || "NONE");
  const [error, setError] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const networks = useSelector((state) => state.user.socialNetworks);

  const handleAvatarChange = (event) => {
    setAvatar(event.target.value);
  };

  const save = (e) => {
    if (e) {
      e.preventDefault();
    }

    setError([]);
    setIsLoading(true);

    dispatch(UserActions.update({ profile: { avatar } }))
      .then(() => {
        props.onSubmit();
        setIsLoading(false);
      })
      .catch((error) => {
        if (error && error["email"]) {
          setError(error);
        }
        setIsLoading(false);
      });
  };

  return (
    <ModalLayoutComponent
      title={"Avatar"}
      isLoading={isLoading}
      content={
        <>
          <Container>
            <form onSubmit={save}>
              <div className="form">
                <FormControl
                  component="fieldset"
                  sx={{
                    margin: `${8 * 3}px`,
                  }}
                >
                  <FormLabel component="legend">From</FormLabel>
                  <RadioGroup
                    aria-label="origin"
                    name="origin"
                    sx={{
                      margin: `${8}px 0`,
                    }}
                    value={avatar}
                    onChange={handleAvatarChange}
                  >
                    <FormControlLabel
                      value="NONE"
                      control={<Radio />}
                      label="Initials"
                      disabled={isLoading}
                    />
                    <FormControlLabel
                      value="GRAVATAR"
                      control={<Radio />}
                      label="Gravatar"
                      disabled={isLoading}
                    />
                    {networks &&
                      networks.nomadlist &&
                      networks.nomadlist.username && (
                        <FormControlLabel
                          value="NOMADLIST"
                          control={<Radio />}
                          label="Nomadlist"
                          disabled={
                            isLoading ||
                            !networks.nomadlist ||
                            !networks.nomadlist.data ||
                            !networks.nomadlist.data.photo
                          }
                        />
                      )}
                  </RadioGroup>
                </FormControl>
              </div>
            </form>
          </Container>
        </>
      }
      footer={
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              flexDirection: "row",
              width: "100%",
            }}
          >
            <Button color="inherit" onClick={props.onClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={save}
              disableElevation
              style={{ marginLeft: "8px" }}
            >
              Submit
            </Button>
          </Box>
        </>
      }
    />
  );
}
