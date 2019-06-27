import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import TextField from "@material-ui/core/TextField";
import LinearProgress from "@material-ui/core/LinearProgress";
import Button from "@material-ui/core/Button";

import CategoryActions from "../../actions/CategoryActions";
import AutoCompleteSelectField from "../forms/AutoCompleteSelectField";

class CategoryForm extends Component {
  constructor(props, context) {
    super(props, context);
    // Set default values
    this.state = {
      id: props.category ? props.category.id : null,
      name: props.category && props.category.name ? props.category.name : "",
      description:
        props.category && props.category.description
          ? props.category.description
          : "",
      parent: props.category ? props.category.parent : null,
      categories: props.categories,
      onSubmit: props.onSubmit,
      onClose: props.onClose,
      categoriesTree: null,
      loading: false,
      error: {} // error messages in form from WS
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      id: nextProps.category ? nextProps.category.id : null,
      name:
        nextProps.category && nextProps.category.name
          ? nextProps.category.name
          : "",
      description:
        nextProps.category && nextProps.category.description
          ? nextProps.category.description
          : "",
      parent: nextProps.category ? nextProps.category.parent : null,
      categories: nextProps.categories,
      onSubmit: nextProps.onSubmit,
      onClose: nextProps.onClose,
      loading: false,
      error: {} // error messages in form from WS
    });
  }

  updateCategories = categories => {
    if (Array.isArray(categories)) {
      this.setState({
        categories: categories
      });
    }
  };

  handleNameChange = event => {
    this.setState({
      name: event.target.value
    });
  };

  handleDescriptionChange = event => {
    this.setState({
      description: event.target.value
    });
  };

  handleParentChange = payload => {
    this.setState({
      parent: payload ? payload.id : null
    });
  };

  save = e => {
    if (e) {
      e.preventDefault();
    }
    let component = this;

    component.setState({
      error: {},
      loading: true
    });

    let category = {
      id: this.state.id,
      name: this.state.name,
      account: this.props.account.id,
      description: this.state.description,
      parent: this.state.parent
    };

    if (category.parent === null) {
      delete category.parent;
    }

    let promise;
    const { dispatch } = this.props;

    if (this.state.id) {
      promise = dispatch(CategoryActions.update(category));
    } else {
      promise = dispatch(CategoryActions.create(category));
    }

    promise
      .then(() => {
        component.setState({
          error: {},
          loading: true,
          open: false
        });
        this.state.onSubmit(category);
      })
      .catch(error => {
        component.setState({
          error: error,
          loading: false
        });
      });
  };

  render() {
    return (
      <form onSubmit={this.save} className="content">
        <header>
          <h2 style={{ color: "white" }}>Category</h2>
        </header>

        {this.state.loading || !this.state.categories ? (
          <LinearProgress mode="indeterminate" />
        ) : (
          ""
        )}
        <div className="form">
          <TextField
            label="Name"
            onChange={this.handleNameChange}
            disabled={this.state.loading || !this.state.categories}
            value={this.state.name}
            error={Boolean(this.state.error.name)}
            helperText={this.state.error.name}
            style={{ width: "100%" }}
            margin="normal"
          />
          <br />
          <TextField
            label="Description"
            disabled={this.state.loading || !this.state.categories}
            onChange={this.handleDescriptionChange}
            value={this.state.description}
            style={{ width: "100%" }}
            margin="normal"
          />
          <AutoCompleteSelectField
            label="Sub category of"
            disabled={this.state.loading || !this.state.categories}
            value={
              this.state.parent
                ? this.state.categories.find(category => {
                    return category.id === this.state.parent;
                  })
                : ""
            }
            values={this.state.categories || []}
            error={Boolean(this.state.error.parent)}
            helperText={this.state.error.parent}
            onChange={this.handleParentChange}
            maxHeight={400}
            fullWidth={true}
            style={{ textAlign: "left" }}
          />
        </div>

        <footer>
          <Button onClick={this.state.onClose}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={this.state.loading}
            style={{ marginLeft: "8px" }}
          >
            Submit
          </Button>
        </footer>
      </form>
    );
  }
}

CategoryForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  category: PropTypes.object.isRequired,
  categories: PropTypes.array.isRequired
};

const mapStateToProps = (state, ownProps) => {
  return {
    account: state.account,
    categories: state.categories.list
  };
};

export default connect(mapStateToProps)(CategoryForm);
