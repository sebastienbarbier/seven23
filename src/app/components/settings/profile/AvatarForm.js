/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import makeStyles from '@mui/styles/makeStyles';

import { connect } from "react-redux";
import PropTypes from "prop-types";

import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

import UserActions from "../../../actions/UserActions";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex"
  },
  formControl: {
    margin: 8 * 3
  },
  group: {
    margin: `${8}px 0`
  }
}));

export default function AvatarForm(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [avatar, setAvatar] = useState(props.avatar || "NONE");
  const [error, setError] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const networks = useSelector(state => state.user.socialNetworks);

  const handleAvatarChange = event => {
    setAvatar(event.target.value);
  };

  const save = e => {
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
      .catch(error => {
        if (error && error["email"]) {
          setError(error);
        }
        setIsLoading(false);
      });
  };

  return (
    <form onSubmit={save} className="content">
      <header>
        <h2 style={{ color: "white" }}>Avatar</h2>
      </header>
      {isLoading ? <LinearProgress mode="indeterminate" /> : ""}
      <div className="form">
        <FormControl component="fieldset" className={classes.formControl}>
          <FormLabel component="legend">From</FormLabel>
          <RadioGroup
            aria-label="origin"
            name="origin"
            className={classes.group}
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
            {networks && networks.nomadlist && networks.nomadlist.username && (
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
      <footer>
        <Button onClick={props.onClose}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          style={{ marginLeft: "8px" }}
        >
          Submit
        </Button>
      </footer>
    </form>
  );
}