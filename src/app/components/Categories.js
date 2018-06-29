/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
import AccountStore from '../stores/AccountStore';
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
      isLoading: true,
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
    // Timer is a 300ms timer on read event to let color animation be smooth
    this.timer = null;
  }

  componentWillMount() {
    CategoryStore.addChangeListener(this._updateData);
    AccountStore.addChangeListener(this._updateAccount);
  }

  componentDidMount() {
    // Timout allow allow smooth transition in navigation
    this.timer = new Date().getTime();
    CategoryActions.read();
  }

  componentWillUnmount() {
    CategoryStore.removeChangeListener(this._updateData);
    AccountStore.removeChangeListener(this._updateAccount);
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
    CategoryActions.create(this.state.snackbar.deletedItem);
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
    category.active = true;
    CategoryStore.onceUpdateListener(category => {
      CategoryActions.read();
    });

    CategoryActions.update(category);
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

  // Timeout of 350 is used to let perform CSS transition on toolbar
  _updateData = categories => {
    if (this.timer) {
      // calculate duration
      const duration = new Date().getTime() - this.timer;
      this.timer = null; // reset timer
      if (duration < 350) {
        setTimeout(() => {
          this._performUpdateData(categories);
        }, 350 - duration);
      } else {
        this._performUpdateData(categories);
      }
    } else {
      this._performUpdateData(categories);
    }
  };

  _performUpdateData = categories => {
    if (Array.isArray(categories)) {
      this.setState({
        categories: categories.sort((a, b) => {
          return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
        }),
        category: categories.find(category => {
          return parseInt(category.id) === parseInt(this.state.id);
        }),
        isLoading: false,
        open: false,
      });
    }
  };

  handleRequestChange = (event, category) => {
    this.setState({
      category: category,
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
  handleOpenCategory = (selectedCategory = {}) => {
    const component = (
      <CategoryForm
        category={selectedCategory}
        categories={this.state.categories}
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

    CategoryStore.onceDeleteListener(category => {
      this.setState({
        snackbar: {
          open: true,
          message: 'Deleted with success',
          deletedItem: selectedCategory,
        },
      });
    });

    // Check if this category has transactions.
    TransactionStore.onceChangeListener(transactions => {
      CategoryActions.delete(selectedCategory.id);
    });

    TransactionActions.read({
      category: selectedCategory.id,
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
    const { anchorEl } = this.state;
    return [
      <div
        key="modal"
        className={'modalContent ' + (this.state.open ? 'open' : 'close')}
      >
        <Card>{this.state.component}</Card>
      </div>,
      <div key="content" className="sideListContent">
        <div className={this.state.id ? 'hideOnMobile column' : 'column'}>
          <Card className="card">
            <div className="cardContainer">
              <Paper zDepth={1}>
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

              <article className={this.state.isLoading ? 'noscroll' : ''}>
                {!this.state.isLoading && this.state.categories ? (
                  <div>
                    <List subheader={<ListSubheader disableSticky={true}>
                      {this.state.toggled
                        ? 'Active and deleted categories'
                        : 'Active categories'}</ListSubheader>}>
                      {this.drawListItem()}
                    </List>
                    <Divider />
                    <List subheader={<ListSubheader disableSticky={true}>Actions</ListSubheader>}>
                      <ListItem button
                        disabled={this.state.isLoading}
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
                ) : (
                  <div>
                    <List subheader={<ListSubheader disableSticky={true}>
                      {this.state.toggled
                        ? 'Active and deleted categories'
                        : 'Active categories'}</ListSubheader>}>
                      {[
                        'w120',
                        'w150',
                        'w120',
                        'w120',
                        'w120',
                        'w150',
                        'w150',
                        'w120',
                        'w120',
                        'w150',
                      ].map((value, i) => {
                        return (
                          <ListItem
                            key={i}
                            rightIconButton={this.rightIconMenu()}
                          >
                            <ListItemText primary={(
                              <span>
                                <span className={`loading ${value}`} />
                                <br />
                                <span className={'loading light w80'} />
                              </span>
                            )} />
                          </ListItem>
                        );
                      })}
                    </List>
                  </div>
                )}
              </article>
            </div>
          </Card>
        </div>
        <div className={this.state.isLoading ? 'noscroll column' : 'column'}>
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
            open={this.state.snackbar.open}
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
                this.handleOpenCategory(this.state.selectedCategory)
              }}
            >
              Edit
            </MenuItem>
            <MenuItem
              onClick={() => {
                this._closeActionMenu();
                this.handleOpenCategory({ parent: this.state.selectedCategory.id })
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

  rightIconMenu(category) {
    return (
      <IconButton
        disabled={this.state.isLoading}
        onClick={(event) => this._openActionMenu(event, category)}>
        <MoreVertIcon  />
      </IconButton>
    );
  }

  rightIconMenuDeleted(category) {
    return (
      <IconButton
        tooltip="undelete"
        tooltipPosition="top-left"
        onClick={() => this._handleUndeleteCategory(category)}
      >
        <UndoIcon color={grey[400]} />
      </IconButton>
    );
  }

  drawListItem(parent = null, indent = 0) {
    const { theme } = this.props;
    return this.state.categories
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
              this.handleRequestChange(event, category);
              this.history.push('/categories/' + category.id);
            }}
          >
            <ListItemText primary={category.name} secondary={category.description} />
            <ListItemSecondaryAction>
              {
                category.active
                  ? this.rightIconMenu(category)
                  : this.rightIconMenuDeleted(category)
              }
            </ListItemSecondaryAction>
          </ListItem>
        );
        if (category.children.length > 0) {
          result.push(<List key={`list-indent-${indent}`}>
            { this.drawListItem(category.id, indent+1) }
          </List>);
        }

        return result;
      });
  }
}

Categories.propTypes = {
  theme: PropTypes.object.isRequired,
};

export default withTheme()(Categories);
