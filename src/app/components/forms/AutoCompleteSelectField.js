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
      values           : props.values,
      tree             : props.tree || props.values,
      onChange         : props.onChange,
      floatingLabelText: props.floatingLabelText,
      maxHeight        : props.maxHeight,
      fullWidth        : props.fullWidth,
      style            : props.style,
      errorText        : props.errorText,
      tabIndex         : props.tabIndex,
      searchText       : props.value ? props.value.name : null,
      open             : false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.values instanceof Array === false) {
      throw new Error('Values should be a Array object');
    }
    this.setState({
      value            : nextProps.value ? nextProps.value : null,
      values           : nextProps.values,
      tree             : nextProps.tree || nextProps.values,
      onChange         : nextProps.onChange,
      floatingLabelText: nextProps.floatingLabelText,
      maxHeight        : nextProps.maxHeight,
      fullWidth        : nextProps.fullWidth,
      style            : nextProps.style,
      errorText        : nextProps.errorText,
      tabIndex         : nextProps.tabIndex,
      searchText       : nextProps.value ? nextProps.value.name : null,
      open: false,
    });
  }

  drawListItem(item) {
     return (
      <ListItem
        key={item.id}
        primaryText={item.name}
        onTouchTap={() => {this.handleCloseSelector(item);}}
        open={true}
        autoGenerateNestedIndicator={false}
        nestedItems={item.children ? item.children.map((children) => {
          return this.drawListItem(children);
        }) : []}
      />
     );
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
    if (data !== undefined && data !== false) {
      this.state.onChange(data);
    }
  };

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
            dataSource={this.state.values.map((a) => { return {'name': a.name, 'value': a}})}
            dataSourceConfig={{ text: 'name', value: 'value',}}
            errorText={this.state.errorText}
            tabIndex={this.state.tabIndex}
            fullWidth={true}
            searchText={this.state.searchText ? this.state.searchText : ''}
            ref={(input) => { this.input = input; }}
            onUpdateInput={(text, datas) => {
              console.log(text);
              this.setState({
                searchText: text,
                errorText: null
              });
            }}
            onBlur={(event) => {
              if (this.state.searchText !== null && this.state.searchText !== '') {
                let resultArray = this.state.values.filter((data) => {
                  return AutoComplete.fuzzyFilter(this.state.searchText, data.name);
                });
                console.log(resultArray);
                if (resultArray.length === 1) {
                  this.setState({
                    value: resultArray[0],
                    searchText: resultArray[0].name,
                  });
                  this.state.onChange(resultArray[0]);
                }
              } else {
                if(this.state.searchText === '') {
                  this.state.onChange(null);
                }
              }

            }}
            onNewRequest={(obj, index) => {
              console.log(obj);
              this.setState({
                value: obj,
                searchText: obj.name,
              });
              this.state.onChange(obj);
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
          {this.state.tree.map((item) => {
            return this.drawListItem(item);
          })}
          </List>
        </Dialog>
      </div>
    );
  }
}

export default AutoCompleteSelectField;