/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
 import React, {Component} from 'react';
 import {List, ListItem} from 'material-ui/List';
 import Subheader from 'material-ui/Subheader';
 import {Card, CardText} from 'material-ui/Card';
 import Toggle from 'material-ui/Toggle';

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
 import FloatingActionButton from 'material-ui/FloatingActionButton';
 import ContentAdd from 'material-ui/svg-icons/content/add';

 import AccountStore from '../stores/AccountStore';
 import CategoryStore from '../stores/CategoryStore';
 import CategoryActions from '../actions/CategoryActions';

 import CategoryForm from './categories/CategoryForm';
 import CategoryDelete from './categories/CategoryDelete';


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
       categoriesTree: null,
       selectedCategory: [],
       // Component states
       loading: true,
       open: false,
       openDelete: false,
       toggled: false,
       snackbar: {
         open: false,
         message: ''
       },
     };
     this.context = context;
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

   drawListItem(category) {
     if (!this.state.toggled && !category.active) {
       return '';
     }
     return (
      <ListItem
        style={category.active ? styles.listItem : styles.listItemDeleted}
        key={category.id}
        primaryText={category.name}
        secondaryText={category.description}
        rightIconButton={category.active ? this.rightIconMenu(category) : this.rightIconMenuDeleted(category)}
        open={true}
        onTouchTap={() => {
          this.context.router.push('/categories/'+category.id);
        }}
        nestedItems={category.children.map((children) => {
            return this.drawListItem(children);
          })}
      />
     );
   }


   componentWillMount() {
     CategoryStore.addChangeListener(this._updateData);
     AccountStore.addChangeListener(this._updateAccount)
   }

   componentDidMount() {
    // Timout allow allow smooth transition in navigation
    setTimeout(() => {
      CategoryActions.read();
    }, 350);
   }

   componentWillUnmount() {
     CategoryStore.removeChangeListener(this._updateData);
     AccountStore.removeChangeListener(this._updateAccount)
   }

   componentWillReceiveProps(nextProps) {
    window.scrollTo(0, 0);
     this.setState({
       open: false,
       openDelete: false,
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
     CategoryActions.update(category);
   };

   _handleOpenCategory = (category) => {
     this.setState({
       open: true,
       openDelete: false,
       selectedCategory: category,
     });
   };

   _handleDeleteCategory = (category) => {
     CategoryStore.onceChangeListener((category) => {
      // If returned object has an ID, we display explanation dialog
       if (category.id && category.id !== null) {
         this.setState({
           open: false,
           openDelete: true,
           selectedCategory: category,
         });
       } else {
         this.setState({
           snackbar: {
             open: true,
             message: 'Deleted with success',
             deletedItem: category,
           }
         });
       }
     });
     CategoryActions.delete(category.id);
   };

   _handleAddSubCategory = (category) => this._handleOpenCategory({ parent: category.id});

   _updateData = (categoriesList, categoriesTree) => {
    if (Array.isArray(categoriesList) && Array.isArray(categoriesTree)) {
      this.setState({
         categoriesTree: categoriesTree,
         loading: false,
         open: false,
         openDelete: false,
       });
    } else {
      CategoryActions.read();
    }
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
      <div>
        <div className={"categoriesLayout " + (this.props.children ? 'category' : '')}>
          <Card className="column">
            <div className="columnHeader">
              <header className="primaryColorBackground">
                <h1>Categories { }</h1>
                <FloatingActionButton className="addButton" onTouchTap={this._handleOpenCategory}>
                  <ContentAdd />
                </FloatingActionButton>
              </header>
              <article>
              { this.state.loading || !this.state.categoriesTree ?
                <div style={styles.loading}>
                  <CircularProgress />
                </div>
                :
                <div>
                  <List>
                    <Subheader>{this.state.toggled ? 'Active and deleted categories' : 'Active categories'}</Subheader>
                    {this.state.categoriesTree.map((category) => {
                      return this.drawListItem(category);
                    })}
                  </List>
                  <Divider />
                  <List>
                    <ListItem primaryText="Show deleted categories" rightToggle={<Toggle onToggle={this._handleToggleDeletedCategories} />} />
                  </List>
                </div>
              }
              </article>
            </div>
          </Card>
          <div className="categoryContainer">
          {this.props.children}
          </div>
        </div>
        <CategoryForm category={this.state.selectedCategory} open={this.state.open}></CategoryForm>
        <CategoryDelete category={this.state.selectedCategory} open={this.state.openDelete}></CategoryDelete>
        <Snackbar
          open={this.state.snackbar.open}
          message={this.state.snackbar.message}
          action="undo"
          autoHideDuration={3000}
          onActionTouchTap={this._handleSnackbarRequestUndo}
          onRequestClose={this._handleSnackbarRequestClose}
        />
        <FloatingActionButton className="addButtonBottom" onTouchTap={this._handleOpenCategory}>
          <ContentAdd />
        </FloatingActionButton>
      </div>
     );
   }
}

// <div style={styles.afterCardActions}>
//   <Toggle
//     label=""
//
//   />
// </div>

// Inject router in context
 Categories.contextTypes = {
   router: React.PropTypes.object.isRequired
 };


 export default Categories;
