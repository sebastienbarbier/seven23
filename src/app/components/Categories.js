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

 import CategoryStore from '../stores/CategoryStore';
 import CategoryActions from '../actions/CategoryActions';

 import CategoryForm from './categories/CategoryForm';
 import CategoryDelete from './categories/CategoryDelete';


 const styles = {
   header: {
     margin: '5px 0px',
     color: 'white',
     background: green600,
     padding: '0px 0px 0px 10px',
     position: 'relative',
   },
   headerTitle: {
     color: 'white',
     fontSize: '2.5em',
   },
   headerText: {
     color: 'white',
   },
   buttonFloating: {
     position: 'absolute',
     right: '35px',
     bottom: '-28px'
   },
   container: {
     textAlign: 'left',
   },
   button: {
     float: 'right',
     marginTop: '26px',
   },
   loading: {
     textAlign: 'center',
     padding: '50px 0',
   },
   list: {
     textAlign: 'left',
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

 const iconButtonElement = (
  <IconButton
    touch={true}
    tooltip="more"
    tooltipPosition="top-left"
  >
    <MoreVertIcon color={grey400} />
  </IconButton>
 );


 class Categories extends Component {

   constructor(props, context) {
     super(props, context);

     this.state = {
       categories: null,
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

   nestedCategory(category) {
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
        nestedItems={this.state.categories
          .filter((cat) => { return ''+cat.parent === ''+category.id; })
          .sort((a, b) => { return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;})
          .map((children) => {
            return this.nestedCategory(children);
          })}
      />
     );
   }


   componentWillMount() {
     CategoryStore.addChangeListener(this._updateData);
   }

   componentDidMount() {
     CategoryActions.read();
   }

   componentWillUnmount() {
     CategoryStore.removeChangeListener(this._updateData);
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

   _updateData = (categories) => {
    if (Array.isArray(categories)) {

     this.setState({
       categories: categories,
       loading: false,
       open: false,
       openDelete: false,
     });
    }
   }

   render() {
     return (
      <div className="list_detail_container" style={styles.container}>
        <div className="list_layout">
          <Card style={styles.header}>
            <CardText style={styles.headerText}>
              <h1 style={styles.headerTitle}>Categories</h1>
            </CardText>
            <FloatingActionButton onTouchTap={this._handleOpenCategory} style={styles.buttonFloating}>
              <ContentAdd />
            </FloatingActionButton>
          </Card>
          <Card>
            { !this.state.categories ?
              <div style={styles.loading}>
                <CircularProgress />
              </div>
              :
              <List style={styles.list}>
                <Subheader>{this.state.toggled ? 'Active and deleted categories' : 'Active categories'}</Subheader>
                {this.state.categories.filter((category) => { return !category.parent; }).sort((a, b) => { return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;}).map((children) => {
                  return this.nestedCategory(children);
                })}
              </List>
            }
          </Card>
          <div style={styles.afterCardActions}>
            <Toggle
              label="Show deleted categories"
              onToggle={this._handleToggleDeletedCategories}
            />
          </div>
        </div>
        <div className="list_detail">
          {this.props.children}
        </div>
        <div className="clearfix"></div>
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
      </div>
     );
   }
}

// Inject router in context
 Categories.contextTypes = {
   router: React.PropTypes.object.isRequired
 };


 export default Categories;
