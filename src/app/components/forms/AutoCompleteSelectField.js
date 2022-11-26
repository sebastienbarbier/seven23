import { v4 as uuidv4 } from "uuid";

import React, { useState, useEffect } from "react";
import makeStyles from '@mui/styles/makeStyles';
import { useTheme } from "../../theme";

import Autosuggest from "react-autosuggest";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";

import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import MenuItem from "@mui/material/MenuItem";

import ArrowDropDown from "@mui/icons-material/ArrowDropDown";

import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';

import { fuzzyFilter } from "../search/utils";

const useStyles = makeStyles((theme) => ({
  container: {
    flexGrow: 1,
    position: "relative", // Keep suggestioncontainer on shape
  },
  suggestionsContainerOpen: {
    position: "absolute",
    zIndex: 100,
    left: 0,
    right: 0,
    marginTop: -8
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
  const uuid = uuidv4();

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

  // Boolean to fix wront trigger of TabComplete
  const [ignoreTabComplete, setIgnoreTabComplete] = useState(false);

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

    if (inputValue.length == 2 && newValue.length == 1) {
      setIgnoreTabComplete(true);
    } else {
      setIgnoreTabComplete(false);
    }

    setInputValue(newValue);

    if (newValue === "") {
      setSuggestion(null);
      setSuggestions([]);
      event.preventDefault();
    }
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

    if (suggestions.length > 0 && !suggestion && !ignoreTabComplete) {
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

  const renderInput = (_inputProps) => {
    const { classes, ref, value, onChange, style, ...other } = _inputProps;

    return (
      <FormControl sx={{ width: '100%', marginTop: 2, marginBottom: 1 }} variant="outlined">
        <InputLabel disabled={disabled} error={error} htmlFor={uuid}>{ label }</InputLabel>
        <OutlinedInput
          id={uuid}
          type={'text'}
          value={value}
          label={label}
          onChange={onChange}
          error={error}
          disabled={disabled}
          inputRef={ref}
          inputProps={{
            classes: {
              input: classes.input,
            },
            ...other,
          }}
          style={{ flexGrow: 1, width: "100%", paddingRight: 4 }}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                onClick={() => setOpen(true)}
                tabIndex={-1}
                size="large">
                <ArrowDropDown />
              </IconButton>
            </InputAdornment>
          }
        />
        <FormHelperText disabled={disabled} error={error}>{helperText}</FormHelperText>
      </FormControl>
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
          <Stack>
            <Button onClick={() => setOpen(false)} color='inherit'>
              Cancel
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </div>
  );
}