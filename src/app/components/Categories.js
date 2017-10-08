/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
 import React, {Component} from 'react';
 import PropTypes from 'prop-types';
 import muiThemeable from 'material-ui/styles/muiThemeable';
 import { Route, Switch } from 'react-router-dom';
 import {List, ListItem, makeSelectable} from 'material-ui/List';
 import Subheader from 'material-ui/Subheader';
 import {Card, CardText} from 'material-ui/Card';
 import Toggle from 'material-ui/Toggle';

 import Paper from 'material-ui/Paper';
 import Snackbar from 'material-ui/Snackbar';

 import CircularProgress from 'material-ui/CircularProgress';

 import IconMenu from 'material-ui/IconMenu';
 import MenuItem from 'material-ui/MenuItem';
 import Divider from 'material-ui/Divider';
 import IconButton from 'material-ui/IconButton';
 import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
 import UndoIcon from 'material-ui/svg-icons/content/undo';
 import {red500, grey400} from 'material-ui/styles/colors';

 import {green600} from 'material-ui/styles/colors';
 import FlatButton from 'material-ui/FlatButton';
 import ContentAdd from 'material-ui/svg-icons/content/add';

 import AccountStore from '../stores/AccountStore';
 import CategoryStore from '../stores/CategoryStore';
 import CategoryActions from '../actions/CategoryActions';

 import Category from './categories/Category';
 import CategoryForm from './categories/CategoryForm';
 import CategoryDelete from './categories/CategoryDelete';

import TransactionStore from '../stores/TransactionStore';
import TransactionActions from '../actions/TransactionActions';

let SelectableList = makeSelectable(List);


 const styles = {
   headerTitle: {
     color: 'white',
     fontSize: '2.5em',
   },
   headerText: {
     color: 'white',
   },
   button: {
     float: 'right',
     marginTop: '26px',
   },
   loading: {
     textAlign: 'center',
     padding: '50px 0',
   },
   listItem: {
     paddingLeft: '14px',
   },
   listItemDeleted: {
     paddingLeft: '14px',
     color: red500,
   },
   icons: {
   },
   link: {
     textDecoration: 'none'
   },
   afterCardActions: {
     padding: '35px 20px 0px 20px',
     fontSize: '1.2em',
   }
 };

 class Categories extends Component {

   constructor(props, context) {
     super(props, context);
     this.state = {
       categories: null,
       category: null,
       id: props.match.params.id,
       // Component states
       loading: true,
       open: false,
       openDelete: false,
       toggled: false,
       snackbar: {
         open: false,
         message: ''
       },
       primaryColor: props.muiTheme.palette.primary1Color,
     };
     this.history = props.history;
     this.context = context;
     // Timer is a 300ms timer on read event to let color animation be smooth
     this.timer = null;
  }

   componentWillMount() {
     CategoryStore.addChangeListener(this._updateData);
     AccountStore.addChangeListener(this._updateAccount)
   }

   componentDidMount() {
    // Timout allow allow smooth transition in navigation
    this.timer = (new Date()).getTime();
    CategoryActions.read();
   }

   componentWillUnmount() {
     CategoryStore.removeChangeListener(this._updateData);
     AccountStore.removeChangeListener(this._updateAccount)
   }

   componentWillReceiveProps(nextProps) {
     this.setState({
       open: false,
       id: nextProps.match.params.id,
       openDelete: false
     });
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
       }
     });
   };

   _handleToggleDeletedCategories = () => {
     this.setState({
       toggled: !this.state.toggled,
       open: false,
       openDelete: false,
     });
   };

   _handleUndeleteCategory = (category) => {
     category.active = true;
     CategoryStore.onceUpdateListener((category) => {
          CategoryActions.read();
      });

     CategoryActions.update(category);
   };

   _handleOpenCategory = (category) => {
     this.setState({
       open: true,
       openDelete: false,
       category: category,
     });
   };

  _handleDeleteCategory = (category) => {
    this.history.push('/categories/');

    CategoryStore.onceChangeListener(this._updateData);

    // Check if this category has transactions.
    TransactionStore.onceChangeListener((transactions) => {

      if (transactions &&
          Array.isArray(transactions) &&
          transactions.length > 0) {

          this.setState({
            open: false,
            openDelete: true,
            category: category,
          });

          CategoryActions.delete(category.id);

      } else {
        CategoryStore.onceDeleteListener((category) => {
          this.setState({
            snackbar: {
              open: true,
              message: 'Deleted with success',
              deletedItem: category,
            }
          });
        });
        CategoryActions.delete(category.id);
      }
    });

    TransactionActions.read({
      category: category.id
    });
  };

   _handleAddSubCategory = (category) => this._handleOpenCategory({ parent: category.id});


  // Timeout of 350 is used to let perform CSS transition on toolbar
  _updateData = (categories) => {
    if (this.timer) {
      // calculate duration
      const duration = (new Date().getTime()) - this.timer;
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

  _performUpdateData = (categories) => {
    if (Array.isArray(categories)) {
      console.log(categories.find((category) => { return parseInt(category.id) === parseInt(this.state.id); }));
      this.setState({
         categories: categories.sort((a, b) => { return a.name < b.name ? -1 : 1; }),
         category: categories.find((category) => { return parseInt(category.id) === parseInt(this.state.id); }),
         loading: false,
         open: false
       });
    }
  };

  handleRequestChange = (event, index) => {
    this.setState({
      category: index,
    });
  };

  _updateAccount = () => {
    this.setState({
       categories: null,
       loading: true,
       open: false,
       openDelete: false,
     });
    CategoryActions.read();
  };

  render() {
    return (
      <div className="sideListContent">
        <div className="column">
          <Card className="card">
            <div className="cardContainer">
              <Paper zDepth={1}>
                <header className="padding" style={{background: this.state.primaryColor}}>
                  <h2>Categories</h2>
                </header>
              </Paper>

              <article>
              { this.state.loading || !this.state.categories ?
                <div style={styles.loading}>
                  <CircularProgress />
                </div>
                :
                <div>
                  <SelectableList
                    value={this.state.category}
                    onChange={this.handleRequestChange}>
                    <Subheader>{this.state.toggled ? 'Active and deleted categories' : 'Active categories'}</Subheader>
                    { this.drawListItem() }
                  </SelectableList>
                  <Divider />
                  <List>
                    <ListItem primaryText="Show deleted categories" rightToggle={<Toggle onToggle={this._handleToggleDeletedCategories} />} />
                  </List>
                </div>
              }
              </article>
            </div>
          </Card>
        </div>
        <div className="column"s>
          <div className="toolbar">
            <header className="padding">
              <FlatButton
                label="Add category"
                primary={true}
                icon={<ContentAdd />}
                onTouchTap={this._handleOpenCategory}
              />
            </header>
            { this.state.category ?
              <Category category={this.state.category} />
              :
              <div></div>
            }
          </div>
          <Snackbar
            open={this.state.snackbar.open}
            message={this.state.snackbar.message}
            action="undo"
            autoHideDuration={3000}
            onActionTouchTap={this._handleSnackbarRequestUndo}
            onRequestClose={this._handleSnackbarRequestClose}
          />
        </div>
      </div>
    );
  }

   rightIconMenu(category) {

     const iconButtonElement = (
      <IconButton>
        <MoreVertIcon color={grey400} />
      </IconButton>
     );

     return (
      <IconMenu iconButtonElement={iconButtonElement}>
        <MenuItem onTouchTap={() => this._handleOpenCategory(category) }>Edit</MenuItem>
        <MenuItem onTouchTap={() => this._handleAddSubCategory(category) }>Add sub category</MenuItem>
        <Divider />
        <MenuItem onTouchTap={() => this._handleDeleteCategory(category) }>Delete</MenuItem>
      </IconMenu>
     );
   }

   rightIconMenuDeleted(category) {
     return (
      <IconButton
          touch={true}
          tooltip="undelete"
          tooltipPosition="top-left"
          onTouchTap={() => this._handleUndeleteCategory(category) }
        >
        <UndoIcon color={grey400} />
      </IconButton>
     );
   }

   drawListItem(parent=null) {
     return this.state.categories.filter((category) => {
      return category.parent === parent;
     }).map((category) => {
        return <ListItem
          key={category.id}
          style={category.active ? styles.listItem : styles.listItemDeleted}
          value={category}
          primaryText={category.name}
          secondaryText={category.description}
          rightIconButton={category.active ? this.rightIconMenu(category) : this.rightIconMenuDeleted(category)}
          open={true}
          onClick={(event, index) => {
            this.history.push('/categories/' + category.id);
          }}
          nestedItems={ category.children.length > 0 ? this.drawListItem(category.id) : [] }
        />
     });
   }

}

//


// <CategoryForm category={this.state.selectedCategory} open={this.state.open}></CategoryForm>
// <CategoryDelete category={this.state.selectedCategory} open={this.state.openDelete}></CategoryDelete>


export default muiThemeable()(Categories);
