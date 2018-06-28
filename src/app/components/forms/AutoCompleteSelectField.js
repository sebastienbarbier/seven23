import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Autosuggest from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';

import { withStyles } from '@material-ui/core/styles';

import Menu from '@material-ui/core/Menu';

import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';

const styles = theme => ({
  container: {
    flexGrow: 1,
    position: 'relative',
  },
  suggestionsContainerOpen: {
    position: 'absolute',
    zIndex: 100,
    marginTop: theme.spacing.unit,
    left: 0,
    right: 0,
  },
  suggestion: {
    display: 'block',
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
  },
});


class AutoCompleteSelectField extends Component {
  constructor(props, context) {
    super(props, context);
    if (props.values instanceof Array === false) {
      throw new Error('Values should be a Array object');
    }
    this.state = {
      label: props.label ||  '',
      value: props.value ? props.value.name : '',
      values: props.values,
      onChange: props.onChange,
      error: props.error,
      disabled: props.disabled,
      helperText: props.helperText,
      suggestions: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.values instanceof Array === false) {
      throw new Error('Values should be a Array object');
    }
    this.setState({
      label: nextProps.label || '',
      value: nextProps.value ? nextProps.value.name : '',
      values: nextProps.values,
      error: nextProps.error,
      disabled: nextProps.disabled,
      helperText: nextProps.helperText,
      suggestions: [],
    });
  }

  renderInput = (inputProps) => {
    const { classes, ref, ...other } = inputProps;
    return (
      <TextField
        fullWidth
        label={ this.state.label }
        InputProps={{
          inputRef: ref,
          classes: {
            input: classes.input,
          },
          ...other,
        }}
        disabled={this.state.disabled}
        error={this.state.error}
        helperText={this.state.helperText}
        margin="normal"
      />
    );
  };

  renderSuggestion = (suggestion, { query, isHighlighted }) => {
    const matches = match(suggestion.name, query);
    const parts = parse(suggestion.name, matches);

    return (
      <MenuItem selected={isHighlighted} component="div">
        <div>
          {parts.map((part, index) => {
            return part.highlight ? (
              <span key={String(index)} style={{ fontWeight: 300 }}>
                {part.text}
              </span>
            ) : (
              <strong key={String(index)} style={{ fontWeight: 500 }}>
                {part.text}
              </strong>
            );
          })}
        </div>
      </MenuItem>
    );
  };

  renderSuggestionsContainer = (options) => {
    const { containerProps, children } = options;

    return (
      <Paper {...containerProps} square>
        {children}
      </Paper>
    );
  };

  fuzzyFilter = function (searchText, key) {
    var compareString = key.toLowerCase();
    searchText = searchText.toLowerCase();

    var searchTextIndex = 0;
    for (var index = 0; index < key.length; index++) {
      if (compareString[index] === searchText[searchTextIndex]) {
        searchTextIndex += 1;
      }
    }

    return searchTextIndex === searchText.length;
  };

  getSuggestionValue = (suggestion) => {
    return suggestion.name;
  };

  getSuggestions = (value = '') => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    let count = 0;

    return inputLength === 0
      ? []
      : this.state.values.filter(suggestion => {

        const keep =
          count < 5 && this.fuzzyFilter(inputValue, suggestion.name);

        if (keep) {
          count += 1;
        }

        return keep;
      });
  };

  handleSuggestionSelected = (event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) => {
    event.preventDefault();
    this.state.onChange(suggestion);
  };

  handleSuggestionsFetchRequested = ({ value }) => {

    this.setState({
      suggestions: this.getSuggestions(value),
    });
  };

  handleSuggestionsClearRequested = (event, params) => {
    if (this.state.suggestions.length > 0) {
      this.state.onChange(this.state.suggestions[0]);
      this.setState({
        value: this.state.suggestions[0].name,
        suggestions: [],
      });
    } else if (this.state.values.find(s => s.name === this.state.value)) {
      this.setState({
        suggestions: [],
      });
    } else {
      this.setState({
        value: '',
        suggestions: [],
      });
    }
  };

  handleChange = (event, { newValue }) => {
    if(event.keyCode == 13){
      event.preventDefault();
    }

    this.setState({
      value: newValue,
    });
  };

  handleCloseSelector = data => {
    this.setState({
      open: false,
    });
    if (data !== undefined && data !== false) {
      this.state.onChange(data);
    }
  };

  render() {
    const { classes } = this.props;
    return (
      <div>
        <Autosuggest
          theme={{
            container: classes.container,
            suggestionsContainerOpen: classes.suggestionsContainerOpen,
            suggestionsList: classes.suggestionsList,
            suggestion: classes.suggestion,
          }}
          renderInputComponent={this.renderInput}
          suggestions={this.state.suggestions}
          onSuggestionsFetchRequested={this.handleSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.handleSuggestionsClearRequested}
          renderSuggestionsContainer={this.renderSuggestionsContainer}
          getSuggestionValue={this.getSuggestionValue}
          onSuggestionSelected={this.handleSuggestionSelected}
          focusInputOnSuggestionClick={false}
          renderSuggestion={this.renderSuggestion}
          inputProps={{
            classes,
            value: this.state.value,
            onChange: this.handleChange
          }}
        />

      </div>
    );
  }
}

AutoCompleteSelectField.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AutoCompleteSelectField);
