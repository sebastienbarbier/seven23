import moment from 'moment';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import { injectStripe, StripeProvider, Elements, CardElement } from 'react-stripe-elements';

import CheckoutForm from './stripe/CheckoutForm';

const styles = {
  container: {
    padding: '10px 20px 40px 20px',
    fontSize: '0.9rem',
  },
  black: {
    color: 'black',
  },
  sebastienbarbier: {
    height: '1.8em',
    paddingBottom: '1px',
    verticalAlign: 'bottom',
    fontSize: '1.1em',
  },
};

class SubscriptionSettings extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {stripe: null};
  }

  componentWillReceiveProps(nextProps) {
    this.setState({});
  }

  componentDidMount() {
    const { stripe_key } = this.props;
    if (window.Stripe) {
      this.setState({stripe: window.Stripe(stripe_key)});
    } else {
      document.querySelector('#stripe-js').addEventListener('load', () => {
        // Create Stripe instance once Stripe.js loads
        this.setState({stripe: window.Stripe(stripe_key)});
      });
    }
  }

  render() {
    const { valid_until, user} = this.props;
    return (
      <div className="layout_content wrapperMobile">
        <div className="wrapperMobile" style={styles.container}>
          <div>
            <p>
              Your account is activated until { moment(valid_until).format('MMMM Do,YYYY HH:mm') }
            </p>
            <h2>Extend your subscription</h2>
            <StripeProvider stripe={this.state.stripe}>
              <Elements>
                <CheckoutForm />
              </Elements>
            </StripeProvider>
            <h2>Paiement history</h2>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Name</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Status</TableCell>
                  <TableCell align="right"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No paiement
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    valid_until: state.user.profile.valid_until,
    stripe_key: state.server.stripe_key,
  };
};

export default connect(mapStateToProps)(SubscriptionSettings);