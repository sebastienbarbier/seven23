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

import SubscriptionExpireSoon from '../alerts/SubscriptionExpireSoon';
import SubscriptionExpired from '../alerts/SubscriptionExpired';

import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";

import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CheckoutForm from "./stripe/CheckoutForm";

import UserActions from "../../actions/UserActions";
import ServerActions from "../../actions/ServerActions";

import { BalancedAmount, ColoredAmount, Amount } from "../currency/Amount";

export default function SubscriptionSettings() {
  const dispatch = useDispatch();
  const theme = useTheme();

  const products = useSelector((state) => state.server.products);
  const server = useSelector((state) => state.server);
  const charges = useSelector((state) => state.user.profile.charges);
  const currencies = useSelector(state => state.currencies);
  const valid_until = useSelector((state) => state.user?.profile?.valid_until);
  const eur = useSelector((state) =>
    state.currencies.find((c) => c.code == "EUR")
  );

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [price, setPrice] = useState(products && products[0] ? products[0].price : 0);
  const [duration, setDuration] = useState(products && products[0] ? products[0].duration : 0);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    dispatch(UserActions.fetchProfile());
    dispatch(ServerActions.connect(server.url)).catch(() => {});
  }, []);

  useEffect(() => {
    if (products && !products.find(c => c.pk = selectedProduct?.pk)) {
      setSelectedProduct(products[0]);
    }
  }, [products]);

  useEffect(() => {
    if (valid_until) {
      if (new Date(valid_until) < new Date()) {
        setMessage(<SubscriptionExpired noAction />);
      } else if (moment(valid_until).diff(new Date(), 'days') < 7) {
        setMessage(<SubscriptionExpireSoon noAction valid_until_moment={valid_until ? moment(valid_until) : null} />);
      }
    }
  }, [valid_until])

  const onSubmit = () => {
    dispatch(UserActions.fetchProfile());
  };

  const handleChangeOffer = (event) => {
    setOffer(products?.find((p) => p.pk == event.target.value));
  };

  const selectProduct = (product) => {
    setSelectedProduct(product);
  }

  return (
    <Container sx={{ pt: 2 }}>
      <Typography variant="h5" sx={{ pb: 2 }}>Subscription</Typography>
      <Box>
        <Typography>
          { new Date(valid_until) < new Date() ? `Your account was activated until ` : `Your account is activated until ` }

          {moment(valid_until).format("MMMM Do,")}{" "}
          <span className="year">{moment(valid_until).format("YYYY")}</span>{" "}
          {moment(valid_until).format("HH:mm")} ({ moment(valid_until).fromNow() }).
        </Typography>

        { message && <>
          <Box sx={{ pt: 2 }}>
            {message}
          </Box>
        </>}

        <Box sx={{ pt: 4 }}>
          <FormLabel component="legend">Choose one plan</FormLabel>
            { products && products.sort((a, b) => a.price > b.price).map((product, i) => <>
                <Button
                  color="inherit"
                  className={`pricing ${selectedProduct == product && 'selected'}`}
                  key={product.pk}
                  onClick={() => {
                    selectProduct(product);
                  }}>
                  <p className="price">

                    { product.currency == 'EUR' && <>
                      <Amount value={ product.price } currency={currencies.find(c => c.id == 1)} />
                    </>}

                    { product.currency != 'EUR' && <>
                      <p>{ product.price } { product.currency }</p>
                    </>}
                  </p>
                  <p className="duration">{ product.duration } months</p>
                </Button>
              </>
            ) }

            { !products &&  <>
              <div className={`pricing`}>
                <p className="price">
                  <span className="loading w250" />
                </p>
                <p className="duration"><span className="loading w80" /></p>
              </div>
            </>}

          { CheckoutForm && <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
              <CheckoutForm
                price={selectedProduct?.price}
                currency={eur}
                duration={selectedProduct?.duration}
                disabled={!products || !selectedProduct}
                product={selectedProduct}
                onSubmit={onSubmit}
              />
            </Box>
          </>}
        </Box>

        {/*<Typography variant="h6" sx={{ pb: 2, pt: 4 }}>Payment history</Typography>

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
                          <Box component="span">Paid</Box>
                        ) : (
                          ""
                        )}
                        {item.status == "PENDING" ? (
                          <Box component="span">Pending</Box>
                        ) : (
                          ""
                        )}
                        {item.status == "CANCELED" ? (
                          <Box component="span">Canceled</Box>
                        ) : (
                          ""
                        )}
                        {item.status == "FAILED" ? (
                          <Box component="span">Failed</Box>
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
        </div>*/}
      </Box>
    </Container>
  );
}