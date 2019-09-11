import moment from "moment";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";

import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";

import {
  injectStripe,
  StripeProvider,
  Elements,
  CardElement
} from "react-stripe-elements";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import CheckoutForm from "./stripe/CheckoutForm";

import UserActions from "../../actions/UserActions";

import { BalancedAmount, ColoredAmount, Amount } from "../currency/Amount";

const styles = theme => ({
  container: {
    padding: "10px 20px 40px 20px",
    fontSize: "0.9rem"
  },
  paid: {
    color: theme.palette.numbers.green
  },
  canceled: {
    color: theme.palette.numbers.yellow
  },
  failed: {
    color: theme.palette.numbers.red
  },
  card: {
    width: "100%",
    maxWidth: 600,
    margin: "auto"
  },
  cardContent: {
    display: "flex",
    flexDirection: "column"
  },
  offers: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    flexWrap: 1
  },
  promocode: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingLeft: 40,
    paddingBottom: 30,
    minWidth: 200
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-end",
    flexGrow: 1,
    padding: "10px 14px"
  }
});

class SubscriptionSettings extends Component {
  constructor(props, context) {
    super(props, context);
    this.props = props;
    this.state = {
      stripe: null,
      promocode: "",
      isWithPromocode: false,
      offer: `${props.products[0].pk}`,
      price: props.products[0].price,
      duration: props.products[0].duration
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({});
  }

  componentDidMount() {
    const script = document.createElement("script");

    script.src = "https://js.stripe.com/v3/";
    script.id = "stripe-js";
    script.async = true;
    document.body.appendChild(script);

    const script2 = document.createElement("script");
    script2.src = "https://checkout.stripe.com/checkout.js";
    document.body.appendChild(script2);

    const { stripe_key } = this.props;
    if (window.Stripe) {
      this.setState({ stripe: window.Stripe(stripe_key) });
    } else {
      document.querySelector("#stripe-js").addEventListener("load", () => {
        // Create Stripe instance once Stripe.js loads
        this.setState({ stripe: window.Stripe(stripe_key) });
      });
    }
  }

  applyCoupon = () => {
    const { dispatch } = this.props;
    const { promocode, offer } = this.state;
    dispatch(UserActions.coupon(offer, promocode))
      .then(result => {
        this.setState({
          price: result.price,
          isWithPromocode: true
        });
      })
      .catch(exception => {
        console.log(exception);
      });
  };

  removePromocode = () => {
    const product = this.props.products.find(p => p.pk == this.state.offer);
    this.setState({
      price: product.price,
      duration: product.duration,
      isWithPromocode: false,
      promocode: ""
    });
  };

  handleChangePromocode = event => {
    this.setState({ promocode: event.target.value });
  };

  handleChangeOffer = event => {
    this.setState({
      offer: this.props.products.find(p => p.pk == event.target.value)
    });
  };

  render() {
    const { valid_until, charges, eur, classes, products } = this.props;
    return (
      <div className="layout_content wrapperMobile">
        <div className={classes.container}>
          <div>
            <p>
              Your account is activated until{" "}
              {moment(valid_until).format("MMMM Do,YYYY HH:mm")}
            </p>

            <Card className={classes.card}>
              <CardContent className={classes.cardContent}>
                <h2 style={{ margin: "0 0 40px 0", fontSize: 24 }}>
                  Extend your subscription
                </h2>
                <div className={classes.offers}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Select an offers</FormLabel>
                    <RadioGroup
                      aria-label="offers"
                      name="offers1"
                      value={this.state.offer}
                      onChange={this.handleChangeOffer}
                    >
                      {products.map(product => {
                        return (
                          <FormControlLabel
                            key={product.pk}
                            value={`${product.pk}`}
                            control={<Radio />}
                            label={
                              <span>
                                {product.duration} months subscription /{" "}
                                <Amount value={product.price} currency={eur} />
                              </span>
                            }
                          />
                        );
                      })}
                    </RadioGroup>
                  </FormControl>
                  <div className={classes.promocode}>
                    <TextField
                      label="Promo Code"
                      margin="normal"
                      disabled={this.state.isWithPromocode}
                      onChange={this.handleChangePromocode}
                      value={this.state.promocode}
                    />
                    {this.state.isWithPromocode ? (
                      <Button onClick={this.removePromocode}>Remove</Button>
                    ) : (
                      <Button onClick={this.applyCoupon}>Apply</Button>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardActions className={classes.actions}>
                {CheckoutForm ? (
                  <StripeProvider stripe={this.state.stripe}>
                    <Elements>
                      <CheckoutForm
                        price={this.state.price}
                        currency={eur}
                        duration={this.state.duration}
                        product={this.state.offer}
                        promocode={this.state.promocode}
                      />
                    </Elements>
                  </StripeProvider>
                ) : (
                  ""
                )}
              </CardActions>
            </Card>

            <h2>Paiement history</h2>

            <div style={{ overflow: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell align="center">Subscription</TableCell>
                    <TableCell align="right">Promo code</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="left">Payment</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {charges && charges.length ? (
                    charges.map(item => {
                      return (
                        <TableRow key={item.pk}>
                          <TableCell align="left">
                            {moment(item.date).format("DD/MM/YY HH:mm")}
                          </TableCell>
                          <TableCell align="center">
                            {item.product.duration} months subscription
                          </TableCell>
                          <TableCell align="right">
                            {item.coupon ? item.coupon.code : ""}
                          </TableCell>
                          <TableCell align="right">
                            <Amount value={item.apply_coupon} currency={eur} />
                          </TableCell>
                          <TableCell align="left">
                            {item.status == "SUCCESS" ? (
                              <span className={classes.paid}>Paid</span>
                            ) : (
                              ""
                            )}
                            {item.status == "CANCELED" ? (
                              <span className={classes.canceled}>Canceled</span>
                            ) : (
                              ""
                            )}
                            {item.status == "FAILED" ? (
                              <span className={classes.failed}>Failed</span>
                            ) : (
                              ""
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No payment
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

SubscriptionSettings.propTypes = {
  classes: PropTypes.object.isRequired,
  valid_until: PropTypes.string.isRequired,
  stripe_key: PropTypes.string.isRequired,
  products: PropTypes.array.isRequired,
  charges: PropTypes.array.isRequired,
  eur: PropTypes.object.isRequired
};

const mapStateToProps = (state, ownProps) => {
  return {
    valid_until: state.user.profile.valid_until,
    stripe_key: state.server.stripe_key,
    products: state.server.products,
    charges: state.user.profile.charges,
    eur: state.currencies.find(c => c.code == "EUR")
  };
};

export default connect(mapStateToProps)(
  withStyles(styles)(SubscriptionSettings)
);
