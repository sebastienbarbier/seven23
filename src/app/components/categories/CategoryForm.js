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
import AccountStore from '../../stores/AccountStore';
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
      categories: null,
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

  componentWillMount() {
    CategoryStore.addChangeListener(this.updateCategories);
  }

  componentDidMount() {
    CategoryActions.read();
  }

  componentWillUnmount() {
    CategoryStore.removeChangeListener(this.updateCategories);
  }

  updateCategories = (categories) => {
    if (categories && Array.isArray(categories)) {
      this.setState({
        categories: categories,
      });
    }
  };

  handleCloseCategory = () => {
    this.setState({
      open: false,
    });
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
      name: this.state.name,
      account: AccountStore.selectedAccount().id,
      description: this.state.description,
      parent: this.state.parent,
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
      parent: nextProps.category ? nextProps.category.parent : null,
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
          this.state.loading || !this.state.categories ?
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
                value={this.state.parent ? this.state.categories.find((category) => { return category.id === this.state.parent; }) : ''}
                values={this.state.categories}
                errorText={this.state.error.parent}
                onChange={this.handleParentChange}
                floatingLabelText="Parent"
                maxHeight={400}
                fullWidth={true}
                tabIndex={3}
                style={{textAlign: 'left'}}
              ></AutoCompleteSelectField>
          </form>
        }
      </Dialog>
    );
  }
}

export default CategoryForm;
