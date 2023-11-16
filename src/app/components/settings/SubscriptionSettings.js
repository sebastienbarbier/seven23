import moment from "moment";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { useTheme } from '../../theme';

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormHelperText from "@mui/material/FormHelperText";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";

import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CheckoutForm from "./stripe/CheckoutForm";

import UserActions from "../../actions/UserActions";

import { BalancedAmount, ColoredAmount, Amount } from "../currency/Amount";

export default function SubscriptionSettings() {
  const dispatch = useDispatch();
  const theme = useTheme();

  const css = {
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
      maxWidth: "600px",
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
      paddingLeft: "40px",
      paddingBottom: "30px",
      minWidth: "200px",
    },
    actions: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "flex-end",
      flexGrow: 1,
      padding: "10px 14px",
    },
  };

  const valid_until = useSelector((state) => state.user.profile.valid_until);
  const products = useSelector((state) => state.server.products);
  const charges = useSelector((state) => state.user.profile.charges);
  const eur = useSelector((state) =>
    state.currencies.find((c) => c.code == "EUR")
  );

  const [offer, setOffer] = useState(products && products[0] ? `${products[0].pk}` : null);
  const [price, setPrice] = useState(products && products[0] ? products[0].price : 0);
  const [duration, setDuration] = useState(products && products[0] ? products[0].duration : 0);
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
    const product = products?.find((p) => p.pk == offer);
    if (product) {
      setPrice(product?.price);
      setDuration(product?.duration);
      setIsWithPromocode(false);
      setPromocode("");
    }
  };

  const handleChangePromocode = (event) => {
    setPromocode(event.target.value);
  };

  const handleChangeOffer = (event) => {
    setOffer(products?.find((p) => p.pk == event.target.value));
  };

  return (
    <Container sx={{ pt: 2 }}>

      <Typography variant="h5" sx={{ pb: 2 }}>Subscription</Typography>
      <Box sx={css.container}>
        <div>
          <p>
            Your account is activated until{" "}
            {moment(valid_until).format("MMMM Do,")}{" "}
            <span className="year">{moment(valid_until).format("YYYY")}</span>{" "}
            {moment(valid_until).format("HH:mm")}
          </p>

          <Card sx={css.card}>
            <CardContent sx={css.cardContent}>
              <h2 style={{ margin: "0 0 40px 0", fontSize: 24 }}>
                Extend your subscription
              </h2>
              <Box sx={css.offers}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Select an offers</FormLabel>
                  <RadioGroup
                    aria-label="offers"
                    name="offers1"
                    value={offer}
                    onChange={handleChangeOffer}
                  >
                    {products?.map((product) => {
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
                <Box sx={css.promocode} className={"coupon"}>
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
                </Box>
              </Box>
            </CardContent>
            <CardActions sx={css.actions}>
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
                            <Box component="span" sx={css.paid}>Paid</Box>
                          ) : (
                            ""
                          )}
                          {item.status == "PENDING" ? (
                            <Box component="span" sx={css.pending}>Pending</Box>
                          ) : (
                            ""
                          )}
                          {item.status == "CANCELED" ? (
                            <Box component="span" sx={css.canceled}>Canceled</Box>
                          ) : (
                            ""
                          )}
                          {item.status == "FAILED" ? (
                            <Box component="span" sx={css.failed}>Failed</Box>
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
      </Box>
    </Container>
  );
}