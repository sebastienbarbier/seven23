/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, {Component} from 'react';
import {Link} from 'react-router';

import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';

import CurrencySelector from './currency/CurrencySelector';

const styles = {
  container: {

  },
  subheader: {
    textAlign: 'left',
  },
  item: {
    textAlign: 'left',
    textDecoration: 'none',
  }
};

class Layout extends Component {

  render() {
    return (
        <div style={styles.container}>
          <nav>
            <List>
              <Subheader style={styles.subheader}>General</Subheader>
              <Link to="/transactions" style={styles.item}><ListItem primaryText="Transactions"/></Link>
              <Link to="/changes" style={styles.item}><ListItem primaryText="Changes"/></Link>
              <Link to="/categories" style={styles.item}><ListItem primaryText="Categories" style={styles.item}/></Link>
            </List>
            <Subheader style={styles.subheader}>Currency</Subheader>
            <CurrencySelector />
            <List>
              <Subheader style={styles.subheader}>Settings</Subheader>
              <Link to="/settings" style={styles.item}><ListItem primaryText="Settings" style={styles.item}/></Link>
              <Link to="/logout" style={styles.item}><ListItem primaryText="Logout"/></Link>
            </List>
          </nav>
          <main>
            {this.props.children}
          </main>
        </div>
    );
  }
}

export default Layout;
