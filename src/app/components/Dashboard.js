import "./Dashboard.scss";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import { Link, useNavigate } from "react-router-dom";

import { useTheme } from '@mui/material/styles';

import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import ListSubheader from '@mui/material/ListSubheader';
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Close from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import { Alert, AlertTitle } from '@mui/material';

import StatisticsActions from "../actions/StatisticsActions";
import AppActions from "../actions/AppActions";
import BalanceView from "./dashboard/BalanceView";
import Trends from "./dashboard/TrendsView";
import MonthLineWithControls from "./dashboard/MonthLineWithControls";

import CalendarGraph from "./charts/CalendarGraph";

import ChangeRateUnknownAlert from './alerts/ChangeRateUnknownAlert';
import NewVersionAvailable from './alerts/NewVersionAvailable';
import SubscriptionExpireSoon from './alerts/SubscriptionExpireSoon';
import SubscriptionExpired from './alerts/SubscriptionExpired';
import MigrateToCloud from './alerts/MigrateToCloud';
import KeyVerified from './alerts/KeyVerified';

import Welcome from './dashboard/Welcome';

import { BalancedAmount, ColoredAmount } from "./currency/Amount";

import DashboardLayout from "./layout/DashboardLayout";
import BalanceComponent from './dashboard/BalanceComponent';
import TrendsComponent from './dashboard/TrendsComponent';
import TransactionList from "./transactions/TransactionList";

import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import pagination from './swiper/Pagination';

export default function Dashboard(props) {

  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch visibility status of numbers
  const isConfidential = useSelector((state) => state.app.isConfidential);

  const server = useSelector(state => state.server);
  const account = useSelector(state => state.account);
  // Fetch data from state
  const transactions = useSelector((state) => state.transactions);
  const categories = useSelector((state) =>
    state.categories ? state.categories.list : null
  );
  const changes = useSelector((state) =>
    state.changes ? state.changes.list : null
  );

  // generate stats for calendar graph based on statistics data
  const [statistics, setStatistics] = useState(null);
  const [calendar, setCalendar] = useState(null);
  // If transactions change, we refresh statistics
  useEffect(() => {
    if (!transactions) {
      setStatistics(null);
    } else {
      const now = moment().utc().endOf('month').toDate();
      const from = moment(now).subtract(4, 'months').startOf('month').toDate();

      dispatch(StatisticsActions.dashboard(from, now))
        .then((result) => {

          const calendar = result.stats.calendar.filter(day => {
            return day.date <= now && day.date >= from;
          });

          result.graph[0].color = theme.palette.numbers.red;
          result.graph[1].color = theme.palette.numbers.blue;
          setOpenTrend(false);
          setCalendar(calendar);
          setStatistics(result);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [transactions]);

  const valid_until = useSelector((state) => state.user?.profile?.valid_until);

  // Alert states
  const [messages, setMessages] = useState([]); // List of component to display

  const show_update_alert = useSelector((state) => state.state.cacheDidUpdate);
  const show_migration_alert = useSelector((state) =>
    state.server.isLogged && state.accounts.remote.length === 0
  );
  const show_save_key_alert = useSelector((state) =>
    state?.user?.profile?.profile?.key_verified == false && !show_migration_alert
  );
  const show_has_unknown_amount = useSelector((state) =>
    statistics?.stats?.hasUnknownAmount
  );

  // When valid until change we check if user needs to be alerted about his subscription
  useEffect(() => {
    const newMessages = [];

    if (valid_until) {
      if (new Date(valid_until) < new Date()) {
        newMessages.push(<SubscriptionExpired />);
      } else if (moment(valid_until).diff(new Date(), 'days') < 7) {
        newMessages.push(<SubscriptionExpireSoon valid_until_moment={valid_until ? moment(valid_until) : null} />);
      }
    }
    show_update_alert && newMessages.push(<NewVersionAvailable />);
    show_migration_alert && newMessages.push(<MigrateToCloud />);
    show_save_key_alert && newMessages.push(<KeyVerified />);
    show_has_unknown_amount && newMessages.push(<ChangeRateUnknownAlert />);

    setMessages(newMessages);
  }, [valid_until, show_update_alert, show_migration_alert, show_save_key_alert, show_has_unknown_amount, transactions])

  // Toggle Trend component as custom modal view
  const [openTrend, setOpenTrend] = useState(false);
  const [trendComponent, setTrendComponent] = useState(null);
  const handleToggleTrend = (trend) => {
    setTrendComponent(trend && trend.component ? trend.component : null);
    setOpenTrend(!openTrend);
    dispatch(AppActions.hideNavigation(false));
  };

  return (
    <DashboardLayout>

      {/* TREND OVERFLOW WITH `trendComponent` OBJECT AS TEMPLATE */}
      <div className={(openTrend ? "open" : "") + " trendModal"}>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <IconButton onClick={() => setOpenTrend(false)} size="large">
            <Close color="action" />
          </IconButton>
        </div>
        {trendComponent}
      </div>

      {/*{ transactions && transactions.length == 0 && <Welcome className={`${openTrend ? "hide" : ""}`} /> }*/}

      <div className={`${openTrend ? "hide" : ""} layout_dashboard ${!!messages.length ? 'hasMessages' : ''}`}>

        {/* BALANCE VIEW */}
        <div className="paper transparent showMobile">
          <BalanceView
            isLoading={!statistics}
            statistics={statistics}
          />
        </div>

        <div className="paper balance1 hideMobile">

          <BalanceComponent
            label={ moment().format("MMMM") }
            isLoading={!statistics}
            balance={!!statistics && (statistics?.currentYear?.currentMonth?.expenses +
                     statistics?.currentYear?.currentMonth?.incomes)}
            incomes={statistics?.currentYear?.currentMonth?.incomes}
            expenses={statistics?.currentYear?.currentMonth?.expenses}/>
        </div>

        <div className="paper balance2 hideMobile">

          <BalanceComponent
            label={ moment().format("YYYY") }
            isLoading={!statistics}
            balance={!!statistics && (statistics?.currentYear?.expenses +
                        statistics?.currentYear?.incomes)}
            incomes={statistics?.currentYear?.incomes}
            expenses={statistics?.currentYear?.expenses}/>
        </div>

        { !!messages.length && <>
        <div className="paper transparent messages">
          <Swiper pagination={messages.length > 1 && pagination} modules={[Pagination]} className="mySwiper" >
            { messages.map((message, index) => {
              return <SwiperSlide key={index}>{ message }</SwiperSlide>;
            })}
          </Swiper>
        </div>
        </> }

        {/* TRENDS VIEW */}
        <div className="paper trend1 hideMobile">
          <TrendsComponent
            label="30"
            isLoading={!statistics}
            trend={statistics ? statistics.trend30 : null}
            onOpenTrend={handleToggleTrend}
          />
        </div>

        <div className="paper trend2 hideMobile">
          <TrendsComponent
            label="7"
            isLoading={!statistics}
            trend={statistics ? statistics.trend7 : null}
            onOpenTrend={handleToggleTrend}
          />
        </div>

        {/* MONTH GRAPH COMPONENT */}
        <div className="paper graph">
          <MonthLineWithControls
            statistics={statistics}
            isConfidential={isConfidential}
            maxHeight={250} />
        </div>

        {/* TRENDS VIEW */}
        <div className="paper transparent showMobile">
          <Trends
            trend30={statistics ? statistics.trend30 : null}
            trend7={statistics ? statistics.trend7 : null}
            isLoading={!statistics}
            onOpenTrend={handleToggleTrend}
          />
        </div>

        <div className="paper pendings">
          <Typography variant="h6">Pending payments { !!statistics?.pendings.length && <small>({statistics?.pendings.length})</small>}</Typography>
          <Box sx={{ overflow: 'auto', width: '100%' }}>
          { !statistics || statistics?.pendings &&
            <TransactionList
              transactions={statistics?.pendings}
              isLoading={!statistics}
              pagination="6"
              dateFormat="DD MMM YY"
            />
          }
          </Box>
          { statistics && !statistics?.pendings.length && <>
            <div className="emptyContainer">
              <p>No payment expected</p>
            </div>
          </>}
        </div>

        {/* CALENDAR GRAPH WITH  */}
        <div className="paper calendar">
          <Typography variant="h6">Past 3 months</Typography>
          <CalendarGraph
            values={calendar}
            monthsPerLine={4}
            isLoading={!Boolean(statistics) || isConfidential || false}
            onClick={(year, month, day) => { navigate(`/transactions/${year}/${+month+1}/${day}`); }} />
        </div>

        <div className="paper numbers">
          <Stack sx={{ pt: 1, pb: 1, height: '100%' }}>
            <Typography component="h6" variant="h6" sx={{ pb: 1 }}>Statistics</Typography>
            <Typography sx={{ pt: 1, pb: 2 }}><strong>{ account.name }</strong> contains:</Typography>
            <Typography>
              <span style={{ color: theme.palette.transactions.main, fontWeight: 400, fontSize: '1.1em', paddingRight: 2 }}>
                {!transactions ? (
                  <span className="loading w80" />
                ) : (
                  transactions.length
                )}
              </span>{" "}transaction{ transactions?.length > 1 ? 's' : ''}</Typography>
            <Typography>
              <span style={{ color: theme.palette.changes.main, fontWeight: 400, fontSize: '1.1em', paddingRight: 2 }}>
                {!changes ? (
                  <span className="loading w80" />
                ) : (
                  changes.length
                )}
              </span>{" "}change{ changes?.length > 1 ? 's' : ''}</Typography>
            <Typography>
              <span style={{ color: theme.palette.categories.main, fontWeight: 400, fontSize: '1.1em', paddingRight: 2 }}>
                {!categories ? (
                  <span className="loading w80" />
                ) : (
                  categories.length
                )}
              </span>{" "}categorie{ categories?.length > 1 ? 's' : ''}
            </Typography>
            { server.isLogged && server.last_sync && <Typography sx={{ pt: 2, pb: 2, fontSize: '0.9em' }}>Last sync: {moment(server.last_sync).fromNow()}</Typography> }
          </Stack>
        </div>
      </div>
    </DashboardLayout>
  );
}