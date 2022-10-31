import React, { useState, useEffect } from "react";
import makeStyles from '@mui/styles/makeStyles';
import { useTheme } from "../../theme";

import Autosuggest from "react-autosuggest";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";

import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import MenuItem from "@mui/material/MenuItem";

import IconButton from "@mui/material/IconButton";
import ArrowDropDown from "@mui/icons-material/ArrowDropDown";

import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

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

/**
 * Generic component to display a list of suggestion with a model view.
 * 
 * User can start writting a word, component will suggest options based on the inputValue.
 * On click it select the suggestion. On leave focus it should select the first suggestion to
 * allow quick keyboard behavior.
 */
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
  
  // Suggestion object currently selected
  const [suggestion, setSuggestion] = useState();
  // Input value to display.
  const [inputValue, setInputValue] = useState(value ? value.name : "");
  // List of suggestion to use for suggestion filtering based on inputValue
  const [suggestions, setSuggestions] = useState([]);
  // Define if modal view is open
  const [open, setOpen] = useState(false);

  // If parent component update current value, we update the UI accordingly
  useEffect(() => {
    setInputValue(value ? value.name : "");
  }, [value]);

  // When selected suggestion change, we propagate to the parent component. 
  useEffect(() => {
    onChange(suggestion);
  }, [suggestion]);

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

  const handleSelectDialog = (value) => {
    onChange(value);
    setOpen(false);
  };
  
  const handleChange = (event, { newValue, value }) => {
    if (event.keyCode == 13) {
      event.preventDefault();
    }

    if (newValue === "") {
      setSuggestion(null);
      setSuggestions([]);
      event.preventDefault();
    }
    setInputValue(newValue);
  };

  /** 
   * Suggestion events
   */
  const handleSuggestionsFetchRequested = ({ value }) => {
    // Ignore when newVCalue = inputValue which is triggered when getting focus.
    // This solve the focus then backspace not removing it all.
    if (value != inputValue) {
      setSuggestions(getSuggestions(value));
    }
  };

  const handleSuggestionSelected = (
    event,
    { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }
  ) => {
    event.preventDefault();
    setSuggestion(suggestion);
    setSuggestions([]);
  };

  const handleSuggestionsClearRequested = (event) => {

    if (suggestions.length > 0 && !suggestion) {
      onChange(suggestions[0]);
      setInputValue(suggestions[0].name);
    }

    setSuggestions([]);
  };

  const getSuggestionValue = (suggestion) => {
    return suggestion.name;
  };

  /**
   * Rendering components
   */
  const renderSuggestionsContainer = (options) => {
    const { containerProps, children } = options;

    return (
      <Paper {...containerProps} square>
        {children}
      </Paper>
    );
  };

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
        variant="outlined"
        style={{ flexGrow: 1, width: "100%" }}
      />
    );
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

  /**
   * Dialog modal redering
   */

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
              ...{ paddingLeft: 8 * 4 * indent + 24 },
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

  /**
   * Main returned component
   */
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
        highlightFirstSuggestion={true}
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
        tabIndex={-1}
        size="large">
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