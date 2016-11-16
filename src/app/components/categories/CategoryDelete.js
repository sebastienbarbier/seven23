/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
 import React, {Component} from 'react';
 import { Router, Route, Link, browserHistory } from 'react-router';
 import {List, ListItem, makeSelectable} from 'material-ui/List';
 import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
 import FontIcon from 'material-ui/FontIcon';
 import FlatButton from 'material-ui/FlatButton';
 import CircularProgress from 'material-ui/CircularProgress';

 import CategoryActions from '../../actions/CategoryActions';
 import CategoryStore from '../../stores/CategoryStore';

 const styles = {
  container: {
    maxWidth: '600px',
    textAlign: 'left',
  },
  'actions': {
    textAlign: 'center',
  },
 };

 class CategoryDelete extends Component {

  constructor(props, context) {
    super(props, context);

    this.context = context;
    this.state = {
      category: CategoryStore.getIndexedCategories()[props.params.id],
      deleting: false,
    };
  }

  handleDelete = () => {
    let component = this;
    this.setState({
      deleting: true,
    });

    CategoryStore.onceChangeListener((args) => {
      if (!args) {
        component.context.router.replace('/categories');
      } else {
        component.context.router.replace('/categories');
      }
    });
    CategoryActions.delete(this.state.category.id);
  };

  handleCancel = () => {
    this.context.router.replace('/categories');
  };

  componentWillMount() {
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  render() {
    return (
      <div style={styles.container}>
        <h1>Are you sure about deleting { this.state.category.name } ?</h1>
        {
          this.state.deleting ?
            <Card>
              <CardText style={styles.actions}>
                 <CircularProgress />
              </CardText>
            </Card>
          :
          <Card>
            <CardText>
              <p>This category does not have any transactions, and will be definitely deleted.</p>
            </CardText>
            <CardActions style={styles.actions}>
              <FlatButton label="Yes, delete it" onTouchTap={this.handleDelete} />
              <FlatButton label="Cancel" onTouchTap={this.handleCancel} />
            </CardActions>
          </Card>
        }
      </div>
    );
  }
}
// Inject router in context
CategoryDelete.contextTypes = {
  router: React.PropTypes.object.isRequired
};


export default CategoryDelete;
