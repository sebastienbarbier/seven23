import React, {Component} from 'react';

import AutoComplete from 'material-ui/AutoComplete';
// import SelectField from 'material-ui/SelectField';
// import MenuItem from 'material-ui/MenuItem';

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
      searchText       : null
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
      searchText       : null
    });
  }

  render() {
    return (
      <AutoComplete
        floatingLabelText={this.state.floatingLabelText}
        filter={AutoComplete.fuzzyFilter}
        dataSource={this.state.values}
        dataSourceConfig={{ text: 'text', value: 'value',}}
        errorText={this.state.errorText}
        tabIndex={this.state.tabIndex}
        fullWidth={this.state.fullWidth}
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
    );
  }
}

// <SelectField
//   value={this.state.value}
//   errorText={this.state.errorText}
//   onChange={this.state.onChange}
//   floatingLabelText={this.state.floatingLabelText}
//   maxHeight={this.state.maxHeight}
//   fullWidth={this.state.fullWidth}
//   style={this.state.style}>
//   { [...this.state.values].map((key, item) => {
//     return <MenuItem value={key} key={key} primaryText={item} />;
//   })}
// </SelectField>

export default AutoCompleteSelectField;