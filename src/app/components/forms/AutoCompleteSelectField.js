import React, {Component} from 'react';

import AutoComplete from 'material-ui/AutoComplete';
import IconButton from 'material-ui/IconButton';
import ArrowDropDown from 'material-ui/svg-icons/navigation/arrow-drop-down';
import Dialog from 'material-ui/Dialog';
import {List, ListItem} from 'material-ui/List';

const styles = {
  container:{
    width: '100%',
  },
  autocomplete:{
    marginRight: '48px',
  },
  button:{
    width: '48px',
    float: 'right',
    marginTop: '24px',
  },
  dialog:{
  }
};

class AutoCompleteSelectField extends Component{

  constructor(props, context) {
    super(props, context);
    if (props.values instanceof Array === false) {
      throw new Error('Values should be a Array object');
    }
    this.state = {
      value            : props.value ? props.value : null,
      values           : props.values.map((obj) => { return {text: obj.name, value: obj};}).sort((a, b) => { return a.text < b.text ? -1 : 1; }),
      onChange         : props.onChange,
      floatingLabelText: props.floatingLabelText,
      maxHeight        : props.maxHeight,
      fullWidth        : props.fullWidth,
      style            : props.style,
      errorText        : props.errorText,
      tabIndex         : props.tabIndex,
      searchText       : null,
      open             : false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.values instanceof Array === false) {
      throw new Error('Values should be a Array object');
    }
    this.setState({
      value            : nextProps.value ? nextProps.value : null,
      values           : nextProps.values.map((obj) => { return {text: obj.name, value: obj};}).sort((a, b) => { return a.text < b.text ? -1 : 1; }),
      onChange         : nextProps.onChange,
      floatingLabelText: nextProps.floatingLabelText,
      maxHeight        : nextProps.maxHeight,
      fullWidth        : nextProps.fullWidth,
      style            : nextProps.style,
      errorText        : nextProps.errorText,
      tabIndex         : nextProps.tabIndex,
      searchText       : null,
      open: false,
    });
  }

  handleOpenSelector = () => {
    this.setState({
      open: true,
    });
  };

  handleCloseSelector = (data) => {
    this.setState({
      open: false,
    });
    if (data !== undefined) {
      this.state.onChange(data);
    }
  }

  render() {
    return (
      <div style={styles.container}>
        <IconButton style={styles.button} onTouchTap={this.handleOpenSelector}>
          <ArrowDropDown />
        </IconButton>
        <div style={styles.autocomplete}>
          <AutoComplete
            floatingLabelText={this.state.floatingLabelText}
            filter={AutoComplete.fuzzyFilter}
            dataSource={this.state.values}
            dataSourceConfig={{ text: 'text', value: 'value',}}
            errorText={this.state.errorText}
            tabIndex={this.state.tabIndex}
            fullWidth={true}
            onChange={this.state.onChange}
            searchText={this.state.value ? this.state.value.name : ''}
            ref={(input) => { this.input = input; }}
            onUpdateInput={(text, datas) => {
              this.setState({
                searchText: text,
                errorText: null
              });
            }}
            onBlur={(event) => {
              if (this.state.searchText !== null && this.state.searchText !== '') {
                let resultArray = this.state.values.filter((data) => {
                  return AutoComplete.fuzzyFilter(this.state.searchText, data.text);
                });
                if (resultArray.length === 1) {
                  this.setState({
                    searchText: resultArray[0].text,
                  });
                  this.state.onChange(resultArray[0].value);
                }
              } else {
                if(this.state.searchText === '') {
                  this.state.onChange(null);
                }
              }

            }}
            onNewRequest={(obj, index) => {
              this.setState({
                value: obj.text,
                searchText: obj.text,
              });
              this.state.onChange(obj.value);
              this.input.focus();
            }}
          />
        </div>
        <Dialog
          title={this.state.floatingLabelText}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleCloseSelector}
          autoScrollBodyContent={true}
          style={styles.dialog}
        >
          <List>
          {this.state.values.map((item) => {
            return (
              <ListItem primaryText={item.text} onTouchTap={() => {this.handleCloseSelector(item.value);}} />
            );
          })}
          </List>
        </Dialog>
      </div>
    );
  }
}

export default AutoCompleteSelectField;