import React, {Component} from 'react';
import moment from 'moment';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';

import ServerStore from '../../stores/ServerStore';

import { Card, CardActions, CardText, CardTitle } from 'material-ui/Card';

const styles = {
  flexContainer: {
    display: 'flex',
    width: '100%'
  }
};

class ServerSettings extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      server: ServerStore.server
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      server: ServerStore.server
    });
  }

  componentDidMount() {
    console.log(this.state.server);
  }

  render() {
    return [
      <div style={styles.flexContainer}>
        <div style={{maxWidth: '400px', minWidth: '350px', marginRight: '30px', marginTop: '10px'}}>
          <Card>
            <CardTitle title="Server" subtitle="Details about your hosting" />
             <List>
              <Divider />
              <ListItem
                primaryText="Name"
                disabled={true}
                secondaryText={ this.state.server.name }/>
              <ListItem
                primaryText="API Version"
                disabled={true}
                secondaryText={ this.state.server['api_version'].join('.') }/>
              <ListItem
                primaryText="Administrator email"
                disabled={true}
                secondaryText={ this.state.server.contact || 'Not defined' }/>
              <ListItem
                primaryText="Sign in"
                disabled={true}
                secondaryText={ this.state.server.allow_account_creation ? 'Enable' : 'Disable' }/>
            </List>
          </Card>
        </div>
        <div style={{flexGrow: '1'}}>
          <h2>Terms and conditions</h2>
          <p>Terms and condition are defined by the hosting platform, and is different for every instance.</p>
          <Divider />
          <h3>Publised on { moment(this.state.server.terms_and_conditions_date, 'YYYY-MM-DD').format('MMMM Do,YYYY') }</h3>
          <div dangerouslySetInnerHTML={{__html: this.state.server.terms_and_conditions}}></div>
        </div>
      </div>
    ];
  }
}

export default muiThemeable()(ServerSettings);
