/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTheme } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';

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
import grey from '@material-ui/core/colors/grey';

import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import UndoIcon from '@material-ui/icons/Undo';
import ContentAdd from '@material-ui/icons/Add';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
//
import CategoryStore from '../stores/CategoryStore';
import CategoryActions from '../actions/CategoryActions';

import Category from './categories/Category';
import CategoryForm from './categories/CategoryForm';

import TransactionStore from '../stores/TransactionStore';
import TransactionActions from '../actions/TransactionActions';
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
      account: localStorage.getItem('account'),
      categories: null,
      category: null,
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
    dispatch(CategoryActions.create(this.state.snackbar.deletedItem));
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

  _updateAccount = () => {
    if (this.state.account != localStorage.getItem('account')) {
      this.setState({
        account: localStorage.getItem('account'),
        category: null,
        categories: null,
        isLoading: true,
        open: false,
        openDelete: false,
      });
      CategoryActions.read();
    }
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
    const component = (
      <TransactionForm
        transaction={transaction}
        categories={this.state.categories}
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
    const { anchorEl, open } = this.state;
    const { categories } = this.props;
    return [
      <div
        key="modal"
        className={'modalContent ' + (open ? 'open' : 'close')}
      >
        <Card>{this.state.component}</Card>
      </div>,
      <div key="content" className="sideListContent">
        <div className={this.state.id ? 'hideOnMobile column' : 'column'}>
          <Card className="card">
            <div className="cardContainer">
              <Paper>
                <header className="padding">
                  <h2
                    style={{
                      fontSize: '2.6em',
                      marginTop: '<4></4>0px',
                      marginBottom: '30px',
                      color: 'white'
                    }}
                  >
                    Categories
                  </h2>
                </header>
              </Paper>

              <article>
                <div>
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

          {this.state.id ? (
            <Category
              history={this.history}
              category={this.state.category}
              categories={this.state.categories}
              onEditTransaction={this.handleEditTransaction}
              onDuplicationTransaction={this.handleDuplicateTransaction}
            />
          ) : (
            ''
          )}

          <Snackbar
            open={Boolean(this.state.snackbar.open)}
            message={this.state.snackbar.message}
            action={
              <Button color="inherit" size="small" onClick={this._handleSnackbarRequestUndo}>
                Undo
              </Button>
            }
            TransitionComponent={(props) => <Slide {...props} direction="up" />}
            autoHideDuration={3000}
            onRequestClose={this._handleSnackbarRequestClose}
          />

          <Menu
            anchorEl={ anchorEl }
            open={ Boolean(anchorEl) }
            onClose={this._closeActionMenu}
          >
            <MenuItem
              onClick={() => {
                this._closeActionMenu();
                this.handleOpenCategory(this.state.selectedCategory);
              }}
            >
              Edit
            </MenuItem>
            <MenuItem
              onClick={() => {
                this._closeActionMenu();
                this.handleOpenCategory({ parent: this.state.selectedCategory.id });
              }}
            >
              Add sub category
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                this._closeActionMenu();
                this.handleDeleteCategory(this.state.selectedCategory);
              }}
            >
              Delete
            </MenuItem>
          </Menu>

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
            <ListItemSecondaryAction>
              {
                category.active
                  ? (
                    <IconButton
                      onClick={(event) => this._openActionMenu(event, category)}>
                      <MoreVertIcon  />
                    </IconButton>
                  ) : (
                    <IconButton
                      onClick={() => this._handleUndeleteCategory(category)}>
                      <UndoIcon />
                    </IconButton>
                  )
              }
            </ListItemSecondaryAction>
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
  categories: PropTypes.array.isRequired
};

const mapStateToProps = (state, ownProps) => {
  return {
    categories: state.categories.list,
  };
};

export default connect(mapStateToProps)(withTheme()(Categories));
