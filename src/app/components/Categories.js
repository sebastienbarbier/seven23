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

function rightIconMenu(id) {
  return (
    <IconMenu iconButtonElement={iconButtonElement}>
      <Link to={`/categories/${id}/edit`} style={styles.link}><MenuItem>Edit</MenuItem></Link>
      <Link to={`/categories/add/${id}`} style={styles.link}><MenuItem>Add sub category</MenuItem></Link>
      <Divider />
      <Link to={`/categories/${id}/delete`} style={styles.link}><MenuItem>Delete</MenuItem></Link>
    </IconMenu>
  )
}

 let categories = [];

 class Categories extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      categories: [],
      loading: true,
    };
    this.context = context;
  }

  nestedCategory(category) {
    return (
      <ListItem
        style={styles.listItem}
        key={category.id}
        primaryText={category.name}
        secondaryText={category.description}
        rightIconButton={rightIconMenu(category.id)}
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
    setTimeout(() => {
      CategoryActions.read();
    }, 500);
  }

  componentWillUnmount() {
    CategoryStore.removeChangeListener(this._updateData);
  }

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
          <Link to={`/categories/add`}><FlatButton label="New" style={styles.button} /></Link>
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
      </div>
    );
  }
}

// Inject router in context
Categories.contextTypes = {
  router: React.PropTypes.object.isRequired
};


export default Categories;
