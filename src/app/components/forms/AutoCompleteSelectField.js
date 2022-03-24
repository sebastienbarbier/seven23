import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useTheme } from "../../theme";

import Autosuggest from "react-autosuggest";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";

import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import MenuItem from "@material-ui/core/MenuItem";

import IconButton from "@material-ui/core/IconButton";
import ArrowDropDown from "@material-ui/icons/ArrowDropDown";

import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import Button from "@material-ui/core/Button";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

import { fuzzyFilter } from "../search/utils";

const useStyles = makeStyles((theme) => ({
  container: {
    flexGrow: 1,
    position: "relative", // Keep suggestioncontainer on shape
  },
  suggestionsContainerOpen: {
    position: "absolute",
    zIndex: 100,
    marginTop: theme.spacing(),
    left: 0,
    right: 0,
  },
  suggestion: {
    display: "block",
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: "none",
  },
  paper: {
    width: "80%",
    maxHeight: 435,
  },
  input: {
    width: "100%",
  },
}));

export default function AutoCompleteSelectField({
  label,
  value = null,
  values,
  onChange,
  error,
  disabled,
  helperText,
}) {
  const classes = useStyles();
  const theme = useTheme();

  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionSelected, setSuggestionSelected] = useState(false);
  const [inputValue, setInputValue] = useState(value ? value.name : "");

  useEffect(() => {
    setInputValue(value ? value.name : "");
  }, [value]);

  const renderInput = (inputProps) => {
    const { classes, ref, ...other } = inputProps;
    return (
      <TextField
        label={label}
        InputProps={{
          inputRef: ref,
          classes: {
            input: classes.input,
          },
          ...other,
        }}
        fullWidth
        disabled={disabled}
        error={error}
        helperText={helperText}
        margin="normal"
        style={{ flexGrow: 1, width: "100%" }}
      />
    );
  };

  const getSuggestions = (value = "") => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    let count = 0;

    return inputLength === 0
      ? []
      : values.filter((suggestion) => {
          const keep = count < 5 && fuzzyFilter(inputValue, suggestion.name);
          if (keep) {
            count += 1;
          }
          return keep;
        });
  };

  const handleSuggestionsFetchRequested = ({ value }) => {
    setSuggestionSelected(false);
    setSuggestions(getSuggestions(value));
  };

  const handleSuggestionsClearRequested = (event, params) => {
    if (suggestions.length > 0 && !suggestionSelected) {
      onChange(suggestions[0]);
      setSuggestionSelected(false);
      setSuggestions([]);
      setInputValue(suggestions[0].name);
    } else {
      setSuggestions([]);
    }
  };

  const renderSuggestionsContainer = (options) => {
    const { containerProps, children } = options;

    return (
      <Paper {...containerProps} square>
        {children}
      </Paper>
    );
  };

  const getSuggestionValue = (suggestion) => {
    return suggestion.name;
  };

  const handleSuggestionSelected = (
    event,
    { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }
  ) => {
    event.preventDefault();
    setSuggestionSelected(true);
    onChange(suggestion);
  };

  const renderSuggestion = (suggestion, { query, isHighlighted }) => {
    const matches = match(suggestion.name, query);
    const parts = parse(suggestion.name, matches);

    return (
      <MenuItem selected={isHighlighted} component="div">
        <div>
          {parts.map((part, index) => {
            return part.highlight ? (
              <span
                key={String(index)}
                style={{
                  width: "100%",
                  fontWeight: 300,
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                {part.text}
              </span>
            ) : (
              <strong
                key={String(index)}
                style={{
                  width: "100%",
                  fontWeight: 500,
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                {part.text}
              </strong>
            );
          })}
        </div>
      </MenuItem>
    );
  };

  const handleSelectDialog = (value) => {
    onChange(value);
    setOpen(false);
  };

  const drawListItem = (parent = null, indent = 0) => {
    return values
      .filter((item) => {
        if (item.parent !== undefined) {
          // Having parent property means item is a category
          return item.parent === parent && item.active;
        }
        return true;
      })
      .map((item) => {
        let result = [];
        result.push(
          <ListItem
            button
            key={item.id}
            style={{
              ...{ paddingLeft: theme.spacing() * 4 * indent + 24 },
            }}
            onClick={() => handleSelectDialog(item)}
          >
            <ListItemText primary={item.name} />
          </ListItem>
        );
        if (item.children && item.children.length > 0) {
          result.push(
            <List key={`list-indent-${indent}`}>
              {drawListItem(item.id, indent + 1)}
            </List>
          );
        }

        return result;
      });
  };

  const handleChange = (event, { newValue }) => {
    if (event.keyCode == 13) {
      event.preventDefault();
    }

    if (newValue === "") {
      setSuggestionSelected(true);
    }

    setInputValue(newValue);
  };

  return (
    <div style={{ display: "flex", alignItems: "flex-start" }}>
      <Autosuggest
        theme={{
          container: classes.container,
          suggestionsContainerOpen: classes.suggestionsContainerOpen,
          suggestionsList: classes.suggestionsList,
          suggestion: classes.suggestion,
        }}
        renderInputComponent={renderInput}
        suggestions={suggestions}
        onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
        onSuggestionsClearRequested={handleSuggestionsClearRequested}
        renderSuggestionsContainer={renderSuggestionsContainer}
        getSuggestionValue={getSuggestionValue}
        onSuggestionSelected={handleSuggestionSelected}
        focusInputOnSuggestionClick={false}
        renderSuggestion={renderSuggestion}
        inputProps={{
          classes,
          value: inputValue,
          onChange: handleChange,
          style: { flexGrow: 1 },
        }}
      />
      <IconButton
        onClick={() => setOpen(true)}
        style={{ marginTop: "20px" }}
        tabIndex="-1"
      >
        <ArrowDropDown />
      </IconButton>
      <Dialog
        disableEscapeKeyDown
        maxWidth="xs"
        aria-labelledby="confirmation-dialog-title"
        classes={{
          paper: classes.paper,
        }}
        open={Boolean(open)}
        onClose={() => setOpen(false)}
      >
        <DialogTitle id="confirmation-dialog-title">{label}</DialogTitle>
        <DialogContent style={{ paddingLeft: 0, paddingRight: 0 }}>
          <List>{drawListItem()}</List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={() => setOpen(false)} color="primary">
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}