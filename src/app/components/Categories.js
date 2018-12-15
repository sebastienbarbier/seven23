/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTheme } from '@material-ui/core/styles';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';

import Switch from '@material-ui/core/Switch';

import Snackbar from '@material-ui/core/Snackbar';
import Slide from '@material-ui/core/Slide';
import Button from '@material-ui/core/Button';

import IconButton from '@material-ui/core/IconButton';

import Divider from '@material-ui/core/Divider';

import red from '@material-ui/core/colors/red';

import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import UndoIcon from '@material-ui/icons/Undo';
import ContentAdd from '@material-ui/icons/Add';
//
import CategoryActions from '../actions/CategoryActions';

import Category from './categories/Category';
import CategoryForm from './categories/CategoryForm';

import TransactionForm from './transactions/TransactionForm';

const styles = {
  button: {
    float: 'right',
    marginTop: '26px',
  },
  listItem: {
    paddingLeft: '14px',
  },
  listItemDeleted: {
    paddingLeft: '14px',
    color: red[500],
  },
};

class Categories extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      category: props.categories.find(c => c.id === parseInt(props.match.params.id)),
      transaction: null,
      id: props.match.params.id,
      // Component states
      isLoading: false,
      open: false,
      openDelete: false,
      toggled: false,
      component: null,
      anchorEl: null,
      snackbar: {
        open: false,
        message: '',
      },
    };
    this.history = props.history;
    this.context = context;
  }

  componentWillReceiveProps(nextProps) {
    let states = {
      open: false,
      id: nextProps.match.params.id,
      openDelete: false,
    };
    if (!nextProps.match.params.id) {
      states.category = null;
    }
    this.setState(states);
  }

  _handleSnackbarRequestUndo = () => {
    const { dispatch } = this.props;
    const { deletedItem } = this.state.snackbar;
    dispatch(CategoryActions.create(deletedItem));
    this._handleSnackbarRequestClose();
  };

  _handleSnackbarRequestClose = () => {
    this.setState({
      snackbar: {
        open: false,
        message: '',
        deletedItem: {},
      },
    });
  };

  _handleToggleDeletedCategories = () => {
    this.setState({
      toggled: !this.state.toggled,
      open: false,
      openDelete: false,
    });
  };

  _handleUndeleteCategory = category => {
    const { dispatch } = this.props;
    category.active = true;
    dispatch(CategoryActions.update(category));
  };

  _openActionMenu = (event, category) => {
    this.setState({
      anchorEl: event.currentTarget,
      selectedCategory: category
    });
  };

  _closeActionMenu = () => {
    this.setState({
      anchorEl: null,
      selectedCategory: null
    });
  };

  // EVENTS
  handleOpenCategory = (selectedCategory = null) => {
    const component = (
      <CategoryForm
        category={selectedCategory}
        onSubmit={this.handleCloseTransaction}
        onClose={this.handleCloseTransaction}
      />
    );
    this.setState({
      open: true,
      component: component,
      selectedCategory: selectedCategory,
    });
  };

  handleDeleteCategory = (selectedCategory = {}) => {

    this.history.push('/categories/');

    const { dispatch } = this.props;
    dispatch(CategoryActions.delete(selectedCategory.id)).then(() => {
      this.setState({
        snackbar: {
          open: true,
          message: 'Deleted with success',
          deletedItem: selectedCategory,
        },
      });
    });
  };

  handleCloseCategory = () => {
    this.setState({
      open: false,
      component: null,
      selectedCategory: null,
    });
  };

  handleEditTransaction = (transaction = {}) => {
    const { categories } = this.props;
    const component = (
      <TransactionForm
        transaction={transaction}
        categories={categories}
        onSubmit={this.handleCloseTransaction}
        onClose={this.handleCloseTransaction}
      />
    );
    this.setState({
      open: true,
      component: component,
      selectedTransaction: transaction,
    });
  };

  handleDuplicateTransaction = (transaction = {}) => {
    delete transaction.id;
    this.handleEditTransaction(transaction);
  };

  handleCloseTransaction = () => {
    this.setState({
      open: false,
      component: null,
      selectedTransaction: null,
      selectedCategory: null,
    });
  };

  render() {
    const { open } = this.state;
    const { categories, isSyncing } = this.props;
    return [
      <div
        key="modal"
        className={'modalContent ' + (open ? 'open' : 'close')}
      >
        <Card>{this.state.component}</Card>
      </div>,
      <div key="content" className="sideListContent">
        <div className={this.state.id ? 'hideOnMobile column' : 'column'}>
          <Card square className="card" >
            <div className="cardContainer">
              <article>
                <div>
                  <CardHeader
                    title="Categories"
                  />
                  <Divider />
                  <List subheader={<ListSubheader disableSticky={true}>
                    {this.state.toggled
                      ? 'Active and deleted categories'
                      : 'Active categories'}</ListSubheader>}>
                    {this.drawListItem(categories)}
                  </List>
                  <Divider />
                  <List subheader={<ListSubheader disableSticky={true}>Actions</ListSubheader>}>
                    <ListItem button
                      onClick={this.handleOpenCategory}>
                      <ListItemIcon>
                        <ContentAdd />
                      </ListItemIcon>
                      <ListItemText primary="Create new category" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Show deleted categories" />
                      <ListItemSecondaryAction>
                        <Switch
                          onChange={this._handleToggleDeletedCategories}
                          checked={this.state.toggled}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </div>
              </article>
            </div>
          </Card>
        </div>
        <div className="column">
          {this.state.id ? (
            <div className="return">
              <ListItem button
                onClick={(event, index) => {
                  this.history.push('/categories');
                }}
              >
                <ListItemIcon>
                  <KeyboardArrowLeft />
                </ListItemIcon>
                <ListItemText primary="Back to categories" />
              </ListItem>
            </div>
          ) : (
            ''
          )}

          {this.state.id && this.state.category ? (
            <Category
              history={this.history}
              category={this.state.category}
              categories={categories}
              isLoading={isSyncing}
              onEditCategory={this.handleOpenCategory}
              onDeleteCategory={this.handleDeleteCategory}
              onEditTransaction={this.handleEditTransaction}
              onDuplicationTransaction={this.handleDuplicateTransaction}
            />
          ) : (
            ''
          )}

          <Snackbar
            open={this.state.snackbar.open}
            message={this.state.snackbar.message}
            action={
              <Button key="undo" color="inherit" size="small" onClick={this._handleSnackbarRequestUndo}>
                Undo
              </Button>
            }
            TransitionComponent={(props) => <Slide {...props} direction="up" />}
            autoHideDuration={3000}
            onClose={this._handleSnackbarRequestClose}
          />

        </div>
      </div>,
    ];
  }

  drawListItem(categories, parent = null, indent = 0) {
    const { theme } = this.props;
    return categories
      .filter(category => {
        if (!category.active && !this.state.toggled) {
          return false;
        }
        return category.parent === parent;
      })
      .map(category => {
        let result = [];
        result.push(
          <ListItem button
            key={category.id}
            selected={this.state.category && category.id === this.state.category.id}
            style={{
              ...(category.active ? styles.listItem : styles.listItemDeleted),
              ...{ paddingLeft: theme.spacing.unit * 4 * indent + 24 }
            }}
            onClick={(event) => {
              this.setState({ category });
              this.history.push('/categories/' + category.id);
            }}
          >
            <ListItemText primary={category.name} secondary={category.description} />
            {
              category.active
                ? (
                  <KeyboardArrowRight  />
                ) : (
                  <ListItemSecondaryAction>
                    <IconButton
                      onClick={() => this._handleUndeleteCategory(category)}>
                      <UndoIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                )
            }
          </ListItem>
        );
        if (category.children.length > 0) {
          result.push(<List key={`list-indent-${indent}`}>
            { this.drawListItem(categories, category.id, indent+1) }
          </List>);
        }

        return result;
      });
  }
}

Categories.propTypes = {
  theme: PropTypes.object.isRequired,
  categories: PropTypes.array.isRequired,
  isSyncing: PropTypes.bool.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    categories: state.categories.list,
    isSyncing: state.server.isSyncing,
  };
};

export default connect(mapStateToProps)(withTheme()(Categories));
