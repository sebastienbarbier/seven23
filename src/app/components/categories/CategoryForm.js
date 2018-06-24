import React, { Component } from 'react';

import TextField from '@material-ui/core/TextField';
import LinearProgress from '@material-ui/core/LinearProgress';
import Button from '@material-ui/core/Button';

import CategoryStore from '../../stores/CategoryStore';
import AccountStore from '../../stores/AccountStore';
import CategoryActions from '../../actions/CategoryActions';
import AutoCompleteSelectField from '../forms/AutoCompleteSelectField';

class CategoryForm extends Component {
  constructor(props, context) {
    super(props, context);
    // Set default values
    this.state = {
      id: props.category ? props.category.id : null,
      name: props.category && props.category.name ? props.category.name : '',
      description:
        props.category && props.category.description
          ? props.category.description
          : '',
      parent: props.category ? props.category.parent : null,
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
      name:
        nextProps.category && nextProps.category.name
          ? nextProps.category.name
          : '',
      description:
        nextProps.category && nextProps.category.description
          ? nextProps.category.description
          : '',
      parent: nextProps.category ? nextProps.category.parent : null,
      categories: nextProps.categories,
      onSubmit: nextProps.onSubmit,
      onClose: nextProps.onClose,
      loading: false,
      error: {}, // error messages in form from WS
    });
  }

  componentWillMount() {}

  componentDidMount() {
    setTimeout(() => {
      this.input.focus();
    }, 180);
  }

  componentWillUnmount() {}

  updateCategories = categories => {
    if (Array.isArray(categories)) {
      this.setState({
        categories: categories,
      });
    }
  };

  handleNameChange = event => {
    this.setState({
      name: event.target.value,
    });
  };

  handleDescriptionChange = event => {
    this.setState({
      description: event.target.value,
    });
  };

  handleParentChange = payload => {
    this.setState({
      parent: payload ? payload.id : null,
    });
  };

  save = e => {
    if (e) {
      e.preventDefault();
    }
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
            open: false,
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
        {this.state.loading || !this.state.categories ? (
          <LinearProgress mode="indeterminate" />
        ) : (
          ''
        )}
        <form onSubmit={this.save} className="content">
          <header>
            <h2 style={{ color: 'white' }}>Category</h2>
          </header>
          <div className="form">
            <TextField
              label="Name"
              onChange={this.handleNameChange}
              disabled={this.state.loading || !this.state.categories}
              value={this.state.name}
              error={Boolean(this.state.error.name)}
              helperText={this.state.error.name}
              style={{ width: '100%' }}
              tabIndex={1}
              margin="normal"
              ref={input => {
                this.input = input;
              }}
            />
            <br />
            <TextField
              label="Description"
              disabled={this.state.loading || !this.state.categories}
              onChange={this.handleDescriptionChange}
              value={this.state.description}
              style={{ width: '100%' }}
              margin="normal"
              tabIndex={2}
            />
            <AutoCompleteSelectField
              label="Sub category of"
              disabled={this.state.loading || !this.state.categories}
              value={
                this.state.parent
                  ? this.state.categories.find(category => {
                    return category.id === this.state.parent;
                  })
                  : ''
              }
              values={this.state.categories || []}
              error={Boolean(this.state.error.parent)}
              helperText={this.state.error.parent}
              onChange={this.handleParentChange}
              maxHeight={400}
              fullWidth={true}
              tabIndex={3}
              style={{ textAlign: 'left' }}
            />
          </div>

          <footer>
            <Button
              onClick={this.state.onClose}
              tabIndex={6}
            >Cancel</Button>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              primary={true}
              disabled={this.state.loading}
              style={{ marginLeft: '8px' }}
              tabIndex={5}
            >Submit</Button>
          </footer>
        </form>
      </div>
    );
  }
}

export default CategoryForm;
