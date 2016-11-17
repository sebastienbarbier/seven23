/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
 import React, {Component} from 'react';
 import asyncify from 'async/asyncify';

 import { Router, Route, Link, browserHistory } from 'react-router';
 import {List, ListItem, makeSelectable} from 'material-ui/List';
 import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
 import FontIcon from 'material-ui/FontIcon';
 import FlatButton from 'material-ui/FlatButton';

 import CircularProgress from 'material-ui/CircularProgress';

 import IconMenu from 'material-ui/IconMenu';
 import MenuItem from 'material-ui/MenuItem';
 import Divider from 'material-ui/Divider';
 import IconButton from 'material-ui/IconButton';
 import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
 import {grey400, darkBlack, lightBlack} from 'material-ui/styles/colors';

 import CategoryStore from '../stores/CategoryStore';
 import CategoryActions from '../actions/CategoryActions';

 import CategoryForm from './categories/CategoryForm';


 const styles = {
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
  icons: {
  },
  link: {
    textDecoration: 'none'
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

 let categories = [];

 class Categories extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      categories: [],
      loading: true,
      selectedCategory: {},
      open: false,
    };
    this.context = context;
  }

  rightIconMenu(category) {
    return (
      <IconMenu iconButtonElement={iconButtonElement}>
        <MenuItem onTouchTap={() => this._handleOpenCategory(category) }>Edit</MenuItem>
        <MenuItem onTouchTap={() => this._handleAddSubCategory(category) }>Add sub category</MenuItem>
        <Divider />
        <Link to={`/categories/${category.id}/delete`} style={styles.link}><MenuItem>Delete</MenuItem></Link>
      </IconMenu>
    )
  }

  nestedCategory(category) {
    return (
      <ListItem
        style={styles.listItem}
        key={category.id}
        primaryText={category.name}
        secondaryText={category.description}
        rightIconButton={this.rightIconMenu(category)}
        open={true}
        onTouchTap={() => {
          this.context.router.push('/categories/'+category.id);
        }}
        nestedItems={category.children.map((children) => {
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
    this.setState({
      open: false,
    });
  }

  _handleOpenCategory = (category) => {
    this.setState({
      open: true,
      selectedCategory: category,
    });
  };

  _handleAddSubCategory = (category) => this._handleOpenCategory({ parent: category.id});

  _updateData = () => {
    this.setState({
      categories: CategoryStore.getAllCategories(),
      loading: false,
    });
  }

  render() {
    return (
      <div className="list_detail_container" style={styles.container}>
        <div className="list_layout">
          <FlatButton label="New" style={styles.button} onTouchTap={this._handleOpenCategory} />
          <h1>Categories</h1>
          <Card>
            { this.state.loading ?
              <div style={styles.loading}>
                <CircularProgress />
              </div>
              :
              <List style={styles.list}>
                {this.state.categories.map((children) => {
                  return this.nestedCategory(children);
                })}
              </List>
            }
          </Card>
        </div>
        <div className="list_detail">
          {this.props.children}
        </div>
        <div className="clearfix"></div>
        <CategoryForm category={this.state.selectedCategory} open={this.state.open}></CategoryForm>
      </div>
    );
  }
}

// Inject router in context
Categories.contextTypes = {
  router: React.PropTypes.object.isRequired
};


export default Categories;
