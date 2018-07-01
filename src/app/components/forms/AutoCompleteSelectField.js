import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Autosuggest from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';

import { withStyles, withTheme } from '@material-ui/core/styles';

import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';

import IconButton from '@material-ui/core/IconButton';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';

import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

const styles = theme => ({
  container: {
    flexGrow: 1,
    position: 'relative', // Keep suggestioncontainer on shape
  },
  suggestionsContainerOpen: {
    // position: 'absolute',
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
  paper: {
    width: '80%',
    maxHeight: 435,
  },
  input: {
    width: '100%'
  }
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
      open: false
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
        label={ this.state.label }
        InputProps={{
          inputRef: ref,
          classes: {
            input: classes.input,
          },
          ...other,
        }}
        fullWidth
        disabled={this.state.disabled}
        error={this.state.error}
        helperText={this.state.helperText}
        margin="normal"
        style={{ flexGrow: 1, width: '100%' }}
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
    this.suggestionSelected = true;
    this.state.onChange(suggestion);
  };

  handleSuggestionsFetchRequested = ({ value }) => {
    this.suggestionSelected = false;
    this.setState({
      suggestions: this.getSuggestions(value),
    });
  };

  handleSuggestionsClearRequested = (event, params) => {
    if (this.state.suggestions.length > 0 && !this.suggestionSelected) {
      this.state.onChange(this.state.suggestions[0]);
      this.suggestionSelected = false;
      this.setState({
        value: this.state.suggestions[0].name,
        suggestions: [],
      });
    } else {
      this.setState({
        // value: '',
        suggestions: [],
      });
    }
  };

  handleChange = (event, { newValue }) => {
    if(event.keyCode == 13){
      event.preventDefault();
    }

    if (newValue === '') {
      this.suggestionSelected = true;
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

  handleOpenDialog = () => { this.setState({ open: true }); };
  handleCloseDialog = () => { this.setState({ open: false }); };
  handleSelectDialog = (value) => {
    this.state.onChange(value);
    this.handleCloseDialog();
  };

  drawListItem = (parent = null, indent = 0) => {
    const { theme } = this.props;
    return this.state.values
      .filter(item => {
        if (item.parent !== undefined) { // Having parent property means item is a category
          return item.parent === parent && item.active;
        }
        return true;
      })
      .map(item => {
        let result = [];
        result.push(
          <ListItem button
            key={item.id}
            style={{
              ...{ paddingLeft: theme.spacing.unit * 4 * indent + 24 }
            }}
            onClick={() => this.handleSelectDialog(item)}
          >
            <ListItemText primary={item.name}/>
          </ListItem>
        );
        if (item.children && item.children.length > 0) {
          result.push(<List key={`list-indent-${indent}`}>
            { this.drawListItem(item.id, indent+1) }
          </List>);
        }

        return result;
      });
  };

  render() {
    const { classes } = this.props;
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
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
            onChange: this.handleChange,
            style: { flexGrow: 1 }
          }}
        />
        <IconButton onClick={this.handleOpenDialog} style={{ marginTop: '20px' }} tabindex="-1">
          <ArrowDropDown />
        </IconButton>
        <Dialog
          disableBackdropClick
          disableEscapeKeyDown
          maxWidth="xs"
          onEntering={this.handleEntering}
          aria-labelledby="confirmation-dialog-title"
          classes={{
            paper: classes.paper,
          }}
          open={this.state.open}
          onClose={this.handleCloseDialog}
        >
          <DialogTitle id="confirmation-dialog-title">{ this.state.label }</DialogTitle>
          <DialogContent style={{ paddingLeft: 0, paddingRight: 0 }}>
            <List>
              { this.drawListItem() }
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCloseDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={this.handleCloseDialog} color="primary">
              Ok
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

AutoCompleteSelectField.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withTheme()(withStyles(styles)(AutoCompleteSelectField));
