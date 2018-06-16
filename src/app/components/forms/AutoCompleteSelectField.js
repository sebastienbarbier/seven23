import React, { Component } from 'react';

import FlatButton from 'material-ui/FlatButton';
import AutoComplete from 'material-ui/AutoComplete';
import IconButton from 'material-ui/IconButton';
import ArrowDropDown from 'material-ui/svg-icons/navigation/arrow-drop-down';
import Dialog from 'material-ui/Dialog';
import { List, ListItem } from 'material-ui/List';

const styles = {
  autocomplete: {
    marginRight: '48px',
  },
  button: {
    width: '48px',
    float: 'right',
    marginTop: '24px',
  },
  dialog: {},
};

class AutoCompleteSelectField extends Component {
  constructor(props, context) {
    super(props, context);
    if (props.values instanceof Array === false) {
      throw new Error('Values should be a Array object');
    }
    this.state = {
      value: props.value ? props.value : null,
      values: props.values,
      onChange: props.onChange,
      floatingLabelText: props.floatingLabelText,
      maxHeight: props.maxHeight,
      fullWidth: props.fullWidth,
      disabled: props.disabled,
      errorText: props.errorText,
      tabIndex: props.tabIndex,
      searchText: props.value ? props.value.name : null,
      open: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.values instanceof Array === false) {
      throw new Error('Values should be a Array object');
    }
    this.setState({
      value: nextProps.value ? nextProps.value : null,
      values: nextProps.values,
      onChange: nextProps.onChange,
      floatingLabelText: nextProps.floatingLabelText,
      maxHeight: nextProps.maxHeight,
      fullWidth: nextProps.fullWidth,
      disabled: nextProps.disabled,
      style: nextProps.style,
      errorText: nextProps.errorText,
      tabIndex: nextProps.tabIndex,
      searchText: nextProps.value ? nextProps.value.name : null,
      open: false,
    });
  }

  drawListItem(parent = null) {
    return this.state.values
      .filter(value => {
        if (value.active != undefined && !value.active) {
          return false;
        }
        return value.parent != undefined
          ? value.parent === parent
          : parent === null;
      })
      .map(item => {
        return (
          <ListItem
            key={item.id}
            primaryText={item.name}
            onClick={() => {
              this.handleCloseSelector(item);
            }}
            open={true}
            autoGenerateNestedIndicator={false}
            nestedItems={this.drawListItem(item.id)}
          />
        );
      });
  }

  handleOpenSelector = () => {
    this.setState({
      open: true,
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
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={this.handleCloseSelector}
      />,
    ];

    return (
      <div>
        <IconButton
          style={styles.button}
          onClick={this.handleOpenSelector}
          disabled={this.state.disabled}
        >
          <ArrowDropDown />
        </IconButton>
        <div style={styles.autocomplete}>
          <AutoComplete
            floatingLabelText={this.state.floatingLabelText}
            disabled={this.state.disabled}
            filter={AutoComplete.fuzzyFilter}
            dataSource={this.state.values.map(a => {
              return { name: a.name, value: a };
            })}
            dataSourceConfig={{ text: 'name', value: 'value' }}
            errorText={this.state.errorText}
            tabIndex={this.state.tabIndex}
            fullWidth={true}
            searchText={this.state.searchText ? this.state.searchText : ''}
            ref={input => {
              this.input = input;
            }}
            onUpdateInput={(text, datas) => {
              this.setState({
                searchText: text,
                errorText: null,
              });
            }}
            onBlur={event => {
              if (
                this.state.searchText !== null &&
                this.state.searchText !== ''
              ) {
                let resultArray = this.state.values.filter(data => {
                  return AutoComplete.fuzzyFilter(
                    this.state.searchText,
                    data.name,
                  );
                });
                if (resultArray.length === 1) {
                  this.setState({
                    value: resultArray[0],
                    searchText: resultArray[0].name,
                  });
                  this.state.onChange(resultArray[0]);
                }
              } else {
                if (this.state.searchText === '') {
                  this.state.onChange(null);
                }
              }
            }}
            onNewRequest={(obj, index) => {
              this.setState({
                searchText: obj.name,
                value: obj,
              });
              this.input.focus();
            }}
          />
        </div>
        <Dialog
          title={this.state.floatingLabelText}
          modal={false}
          actions={actions}
          open={this.state.open}
          onRequestClose={this.handleCloseSelector}
          autoScrollBodyContent={true}
          style={styles.dialog}
        >
          <List>{this.drawListItem()}</List>
        </Dialog>
      </div>
    );
  }
}

export default AutoCompleteSelectField;
