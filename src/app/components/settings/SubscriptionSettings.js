import moment from "moment";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { useTheme } from '../../theme';

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import { Alert, AlertTitle } from '@mui/material';

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormHelperText from "@mui/material/FormHelperText";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

import SubscriptionExpireSoon from '../alerts/SubscriptionExpireSoon';
import SubscriptionExpired from '../alerts/SubscriptionExpired';
import SubscriptionCanceled from '../alerts/SubscriptionCanceled';

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

  const [isLoading, setIsLoading] = useState(true);

  const stripe_product = useSelector((state) => state.server.stripe_product);
  const prices = useSelector((state) => state.server.stripe_prices);
  const server = useSelector((state) => state.server);
  const subscription = useSelector((state) => state.server.subscription);
  const charges = useSelector((state) => state.user.profile.charges);
  const currencies = useSelector(state => state.currencies);
  const valid_until = useSelector((state) => state.user?.profile?.valid_until);

  const eur = useSelector((state) =>
    state.currencies.find((c) => c.code == "EUR")
  );
  const [selectedPrices, setSelectedPrices] = useState(null);
  const [price, setPrice] = useState(prices && prices[0] ? prices[0].price : 0);
  const [duration, setDuration] = useState(prices && prices[0] ? prices[0].duration : 0);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    dispatch(UserActions.fetchProfile());
    dispatch(ServerActions.connect(server.url)).catch(() => {}).finally(() => {
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (prices && selectedPrices == null) {
      setSelectedPrices(prices[0]);
    }
  }, [prices]);

  useEffect(() => {
    if (!!valid_until && !isLoading) {
      if (!!subscription?.is_canceled) {
        setMessage(<SubscriptionCanceled valid_until_moment={valid_until ? moment(valid_until) : null} />);
      } else if (new Date(valid_until) < new Date()) {
        setMessage(<SubscriptionExpired noAction />);
      } else if (moment(valid_until).diff(new Date(), 'days') < 7 && !server?.subscription?.is_active) {
        setMessage(<SubscriptionExpireSoon noAction valid_until_moment={valid_until ? moment(valid_until) : null} />);
      } else {
        setMessage(null);
      }
    }
  }, [valid_until, server, subscription, isLoading])

  const handleChangeOffer = (event) => {
    setOffer(prices?.find((p) => p.pk == event.target.value));
  };

  const selectProduct = (price) => {
    setSelectedPrices(price);
  }

  const openManageSubscription = () => {
    dispatch(ServerActions.manageSubscription()).then(url => {
      // Redirect current page to url
      window.location = url;
    });
  }
  return (
    <Container sx={{ pt: 2 }}>
      <Typography variant="h5" sx={{ pb: 2 }} className="hideMobile">Subscription</Typography>
      <Box>
        { !isLoading && !server?.subscription?.is_active && <Typography>
          { new Date(valid_until) < new Date() ? `Your account was activated until ` : `Your account is activated until ` }

          {moment(valid_until).format("MMMM Do,")}{" "}
          <span className="year">{moment(valid_until).format("YYYY")}</span>{" "}
          {moment(valid_until).format("HH:mm")} ({ moment(valid_until).fromNow() }).
        </Typography> }

        { message && <>
          <Box sx={{ pt: 2 }}>
            {message}
          </Box>
        </>}

        { isLoading && <>
          <span className="loading w80" />
        </>}

        { !isLoading && !!subscription && <>

          { !!subscription.is_canceled && !subscription.is_active && <Typography variant="h6" sx={{ pt: 2 }} className="hideMobile">{ server?.subscription?.is_active ? `Current plan` : `Previous plan` }</Typography>}
          <Box
            className={`pricing current`}
            sx={{ mb: 2 }}
            color="inherit">
            <p className="price">

              { server.subscription_price.currency == 'EUR' && <>
                <Amount value={ server.subscription_price.price } currency={currencies.find(c => c.id == 1)} />
              </>}

              { server.subscription_price.currency != 'EUR' && <>
                <p>{ server.subscription_price.price } { server.subscription_price.currency }</p>
              </>}
            </p>
            <p className="duration">{ server.subscription_price.duration } months</p>
          </Box>

          { subscription?.is_active ? <Stack direction={{ xs: 'column', sm: 'column' }} spaceing={2} justifyContent="space-between" alignItems="flex-start">

            { subscription.is_trial ? <>
             <Typography sx={{ pb: 2 }} >Your plan is on trial and will start on {moment(valid_until).format("MMMM Do,")}{" "}<span className="year">{moment(valid_until).format("YYYY")}</span>.</Typography>
            </> : <>
              <Typography sx={{ pb: 2 }} >Your plan renews on {moment(valid_until).format("MMMM Do,")}{" "}<span className="year">{moment(valid_until).format("YYYY")}</span>.</Typography>
            </>}

            <Button
              variant="contained"
              color="primary"
              disableElevation
              onClick={openManageSubscription}>
              Manage my subscription
            </Button>
          </Stack> : <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                disableElevation
                onClick={openManageSubscription}>
                Renew my plan
              </Button>
            </Box>
          </>}

        </>}

        { !isLoading && !subscription && <>
            <Box sx={{ pt: 4 }}>
            <FormLabel component="legend">Choose one plan</FormLabel>
              { prices && prices.sort((a, b) => a.price > b.price).map((product, i) => <>
                  <Button
                    color="inherit"
                    className={`pricing ${selectedPrices?.pk == product?.pk && 'selected'}`}
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

              { !prices &&  <>
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
                  product={stripe_product}
                  selectedPrice={selectedPrices}
                  currency={eur}
                  disabled={!prices || !selectedPrices}
                />
              </Box>
            </>}
          </Box>
        </>}
      </Box>
    </Container>
  );
}