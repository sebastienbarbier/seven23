import moment from "moment";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";

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

import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import CheckoutForm from "./stripe/CheckoutForm";

import UserActions from "../../actions/UserActions";

import { BalancedAmount, ColoredAmount, Amount } from "../currency/Amount";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: "10px 20px 40px 20px",
    fontSize: "0.9rem",
  },
  paid: {
    color: theme.palette.numbers.green,
  },
  canceled: {
    color: theme.palette.numbers.yellow,
  },
  pending: {
    color: theme.palette.numbers.yellow,
  },
  failed: {
    color: theme.palette.numbers.red,
  },
  card: {
    width: "100%",
    maxWidth: 600,
    margin: "auto",
  },
  cardContent: {
    display: "flex",
    flexDirection: "column",
  },
  offers: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    flexWrap: 1,
  },
  promocode: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingLeft: 40,
    paddingBottom: 30,
    minWidth: 200,
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-end",
    flexGrow: 1,
    padding: "10px 14px",
  },
}));

export default function SubscriptionSettings() {
  const dispatch = useDispatch();

  const classes = useStyles();

  const valid_until = useSelector((state) => state.user.profile.valid_until);
  const stripe_key = useSelector((state) => state.server.stripe_key);
  const products = useSelector((state) => state.server.products);
  const charges = useSelector((state) => state.user.profile.charges);
  const eur = useSelector((state) =>
    state.currencies.find((c) => c.code == "EUR")
  );

  const [offer, setOffer] = useState(products[0] ? `${products[0].pk}` : null);
  const [stripe, setStripe] = useState(null);
  const [price, setPrice] = useState(products[0] ? products[0].price : 0);
  const [duration, setDuration] = useState(products[0] ? products[0].duration : 0);
  const [isWithPromocode, setIsWithPromocode] = useState();
  const [promocode, setPromocode] = useState();

  useEffect(() => {
    dispatch(UserActions.fetchProfile());
  }, []);

  const applyCoupon = () => {
    dispatch(UserActions.coupon(offer, promocode))
      .then((result) => {
        setPrice(result.price);
        setIsWithPromocode(true);
      })
      .catch((exception) => {
        console.log(exception);
      });
  };

  const onSubmit = () => {
    dispatch(UserActions.fetchProfile());
  };

  const removePromocode = () => {
    const product = products.find((p) => p.pk == offer);
    setPrice(product.price);
    setDuration(product.duration);
    setIsWithPromocode(false);
    setPromocode("");
  };

  const handleChangePromocode = (event) => {
    setPromocode(event.target.value);
  };

  const handleChangeOffer = (event) => {
    setOffer(products.find((p) => p.pk == event.target.value));
  };

  return (
    <div className="layout_content wrapperMobile">
      <div className={classes.container}>
        <div>
          <p>
            Your account is activated until{" "}
            {moment(valid_until).format("MMMM Do,")}{" "}
            <span className="year">{moment(valid_until).format("YYYY")}</span>{" "}
            {moment(valid_until).format("HH:mm")}
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
                    value={offer}
                    onChange={handleChangeOffer}
                  >
                    {products.map((product) => {
                      return (
                        <FormControlLabel
                          key={product.pk}
                          value={`${product.pk}`}
                          control={<Radio />}
                          label={
                            <span>
                              Hosting - {product.duration} months /{" "}
                              <Amount value={product.price} currency={eur} />
                            </span>
                          }
                        />
                      );
                    })}
                  </RadioGroup>
                </FormControl>
                <div className={"coupon " + classes.promocode}>
                  <TextField
                    label="Promo Code"
                    margin="normal"
                    disabled={isWithPromocode}
                    onChange={handleChangePromocode}
                    value={promocode}
                  />
                  {isWithPromocode ? (
                    <Button className="removeCoupon" onClick={removePromocode}>
                      Remove
                    </Button>
                  ) : (
                    <Button className="applyCoupon" onClick={applyCoupon}>
                      Apply
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
            <CardActions className={classes.actions}>
              {CheckoutForm ? (
                <CheckoutForm
                  price={price}
                  currency={eur}
                  duration={duration}
                  product={offer}
                  promocode={promocode}
                  onSubmit={onSubmit}
                />
              ) : (
                ""
              )}
            </CardActions>
          </Card>

          <h2>Payment history</h2>

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
                  charges.map((item) => {
                    return (
                      <TableRow key={item.pk}>
                        <TableCell align="left">
                          {moment(item.date).format("DD/MM/YY HH:mm")}
                        </TableCell>
                        <TableCell align="center">
                          Hosting - {item.product.duration} months
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
                          {item.status == "PENDING" ? (
                            <span className={classes.pending}>Pending</span>
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