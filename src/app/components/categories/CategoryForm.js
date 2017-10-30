import React, {Component} from 'react';
import PropTypes from 'prop-types';

import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import ImageColorize from 'material-ui/svg-icons/image/colorize';
import CircularProgress from 'material-ui/CircularProgress';
import {green500, red500} from 'material-ui/styles/colors';
import LinearProgress from 'material-ui/LinearProgress';


import UserStore from '../../stores/UserStore';
import CategoryStore from '../../stores/CategoryStore';
import AccountStore from '../../stores/AccountStore';
import CategoryActions from '../../actions/CategoryActions';
import AutoCompleteSelectField from '../forms/AutoCompleteSelectField';

const styles = {
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '25px 0 10px 0'
  }
};

class CategoryForm extends Component {

  constructor(props, context) {
    super(props, context);
    // Set default values
    this.state = {
      id: null,
      name: '',
      description: '',
      parent: null,
      categories: props.categories,
      onSubmit: props.onSubmit,
      onClose: props.onClose,
      categoriesTree: null,
      loading: false,
      error: {}, // error messages in form from WS
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      id: nextProps.category ? nextProps.category.id : null,
      name: nextProps.category && nextProps.category.name ? nextProps.category.name : '',
      description: nextProps.category && nextProps.category.description ? nextProps.category.description : '',
      parent: nextProps.category ? nextProps.category.parent : null,
      categories: nextProps.categories,
      onSubmit: nextProps.onSubmit,
      onClose: nextProps.onClose,
      loading: false,
      error: {}, // error messages in form from WS
    });
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  updateCategories = (categories) => {
    if (Array.isArray(categories)) {
      this.setState({
        categories: categories
      });
    }
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

    const fctListener = (category, error) => {
      if (error) {
        component.setState({
          error: error,
          loading: false,
        });
      } else {
        CategoryStore.onceChangeListener(() => {
          component.setState({
            error: {},
            loading: true,
            open: false
          });
          if (this.state.onSubmit) {
            this.state.onSubmit(category);
          }
        });
        CategoryActions.read();
      }
    };

    if (this.state.id) {
      CategoryStore.onceUpdateListener(fctListener);
      CategoryActions.update(category);
    } else {
      CategoryStore.onceAddListener(fctListener);
      CategoryActions.create(category);
    }
  };

  render() {
    return (
      <div>
        { this.state.loading || !this.state.categories ?
          <LinearProgress mode="indeterminate" />
          : ''
        }
        <div style={{padding: '16px 28px 8px 28px'}}>
          <form onSubmit={this.save}>
            <TextField
              floatingLabelText="Name"
              onChange={this.handleNameChange}
              disabled={this.state.loading || !this.state.categories }
              value={this.state.name}
              errorText={this.state.error.name}
              style={{width: '100%'}}
              tabIndex={1}
              autoFocus={true}
            /><br />
            <TextField
              floatingLabelText="Description"
              disabled={this.state.loading || !this.state.categories }
              onChange={this.handleDescriptionChange}
              value={this.state.description}
              style={{width: '100%'}}
              tabIndex={2}
            />
            <AutoCompleteSelectField
              floatingLabelText="Parent"
              disabled={this.state.loading || !this.state.categories }
              value={this.state.parent ? this.state.categories.find((category) => { return category.id === this.state.parent; }) : ''}
              values={this.state.categories || []}
              errorText={this.state.error.parent}
              onChange={this.handleParentChange}
              maxHeight={400}
              fullWidth={true}
              tabIndex={3}
              style={{textAlign: 'left'}}>
            </AutoCompleteSelectField>

            <div style={styles.actions}>
             <FlatButton
                label="Cancel"
                onTouchTap={this.state.onClose}
                tabIndex={6}
              />
              <RaisedButton
                label="Submit"
                primary={true}
                onTouchTap={this.save}
                tabIndex={5}
              />
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default CategoryForm;
