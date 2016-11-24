import React, {Component} from 'react';

import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import MaterialColorPicker from 'react-material-color-picker';
import IconButton from 'material-ui/IconButton';
import ImageColorize from 'material-ui/svg-icons/image/colorize';
import CircularProgress from 'material-ui/CircularProgress';
import {green500, red500} from 'material-ui/styles/colors';
import Dialog from 'material-ui/Dialog';

import UserStore from '../../stores/UserStore';
import CategoryStore from '../../stores/CategoryStore';
import CategoryActions from '../../actions/CategoryActions';
import AutoCompleteSelectField from '../forms/AutoCompleteSelectField';

const styles = {
  form: {
    textAlign: 'center',
    padding: '0 60px',
  },
  actions: {
    textAlign: 'right',
  },
  debit: {
    borderColor: red500,
    color: red500,
  },
  credit: {
    borderColor: green500,
    color: green500,
  },
  loading: {
    textAlign: 'center',
    padding: '50px 0',
  },
};

class CategoryForm extends Component {

  constructor(props, context) {
    super(props, context);
    // Set default values
    this.state = {
      id: null,
      name: null,
      description: null,
      parent: null,
      categories: CategoryStore.categoriesArray,
      indexedCategories: CategoryStore.getIndexedCategories(),
      colorPicker: false,
      loading: false,
      open: false,
      error: {}, // error messages in form from WS
    };

    this.actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleCloseCategory}
        tabIndex={6}
      />,
      <FlatButton
        label="Submit"
        primary={true}
        onTouchTap={this.save}
        tabIndex={5}
      />,
    ];
  }

  handleCloseCategory = () => {
    this.setState({
      open: false,
    });
  };

  handleOpen = () => {
    this.setState({colorPicker: true});
  };

  handleClose = () => {
    this.setState({colorPicker: false});
  };

  handleNameChange = (event) => {
    this.setState({
      name: event.target.value,
    });
  };
  handleDescriptionChange = (event) => {
    this.setState({
      description: event.target.value,
    });
  };

  handleSelectColor = (color) => {
    this.setState({
      color: color.target.value,
      colorPicker: false,
    });
  };

  handleParentChange = (payload) => {
    this.setState({
      parent: payload ? payload.id : null,
    });
  };

  save = () => {

    let component = this;

    component.setState({
      error: {},
      loading: true,
    });

    CategoryStore.onceChangeListener((args) => {
      if (args) {
        component.setState({
          error: args,
          loading: false,
        });
      } else {
        component.setState({
          error: {},
          loading: true,
          open: false,
        });
      }
    });

    let category = {
      id: this.state.id,
      user: UserStore.getUserId(),
      name: this.state.name,
      description: this.state.description,
      parent: this.state.parent,
      icon: 'fa-circle',
      color: this.state.color,
    };

    if (category.parent === null) {
      delete category.parent;
    }

    if (this.state.id) {
      CategoryActions.update(category);
    } else {
      CategoryActions.create(category);
    }
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      id: nextProps.category.id,
      name: nextProps.category.name,
      description: nextProps.category.description,
      parent: nextProps.category.parent,
      color: nextProps.category.color,
      open: nextProps.open,
      loading: false,
      error: {}, // error messages in form from WS
    });
  }

  render() {
    return (
      <Dialog
          title={this.state.id ? 'Edit category' : 'New category'}
          actions={this.actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleCloseCategory}
          autoScrollBodyContent={true}
        >
        {
          this.state.loading ?
          <div style={styles.loading}>
            <CircularProgress />
          </div>
          :
          <form onSubmit={this.save}>
            <TextField
                floatingLabelText="Name"
                onChange={this.handleNameChange}
                defaultValue={this.state.name}
                errorText={this.state.error.name}
                style={{width: '100%'}}
                tabIndex={1}
                autoFocus={true}
              /><br />
              <TextField
                floatingLabelText="Description"
                onChange={this.handleDescriptionChange}
                defaultValue={this.state.description}
                style={{width: '100%'}}
                tabIndex={2}
              /><br />
              <AutoCompleteSelectField
                value={this.state.indexedCategories[this.state.parent]}
                values={this.state.categories}
                errorText={this.state.error.parent}
                onChange={this.handleParentChange}
                floatingLabelText="Parent"
                maxHeight={400}
                fullWidth={true}
                tabIndex={3}
                style={{textAlign: 'left'}}
              ></AutoCompleteSelectField><br />
              <TextField
                disabled={true}
                defaultValue={this.state.color}
                errorText={this.state.error.color}
                value={this.state.color}
                style={{width: '80%'}}
                floatingLabelText="Color"
              />
              <IconButton tooltip="Open colorpicker" onTouchTap={this.handleOpen}
                style={{width: '20%'}} tabIndex={4}>
                <ImageColorize color={this.state.color} />
              </IconButton><br/>
              <Dialog
                title="Color picker"
                modal={true}
                open={this.state.colorPicker}
                onRequestClose={this.handleClose}
              >
                <MaterialColorPicker
                    initColor={this.state.color}
                    onSubmit={this.handleSelectColor}
                    onReset={this.handleClose}
                    submitLabel='Select'
                    resetLabel='Close'
                />
              </Dialog>
          </form>
        }
      </Dialog>
    );
  }
}

export default CategoryForm;
