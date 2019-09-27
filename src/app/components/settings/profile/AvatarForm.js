/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";

import { connect } from "react-redux";
import PropTypes from "prop-types";

import Button from "@material-ui/core/Button";
import LinearProgress from "@material-ui/core/LinearProgress";

import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";

import UserActions from "../../../actions/UserActions";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex"
  },
  formControl: {
    margin: theme.spacing() * 3
  },
  group: {
    margin: `${theme.spacing()}px 0`
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
