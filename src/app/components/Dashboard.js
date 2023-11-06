import "./Dashboard.scss";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import { Link, useNavigate } from "react-router-dom";

import { useTheme } from '@mui/material/styles';

import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import ListSubheader from '@mui/material/ListSubheader';

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

import { BalancedAmount, ColoredAmount } from "./currency/Amount";

import DashboardLayout from "./layout/DashboardLayout";
import BalanceComponent from './dashboard/BalanceComponent';
import TrendsComponent from './dashboard/TrendsComponent';

export default function Dashboard(props) {

  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch visibility status of numbers
  const isConfidential = useSelector((state) => state.app.isConfidential);

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
  const show_update_alert = useSelector((state) => state.state.cacheDidUpdate);
  const show_migration_alert = useSelector((state) =>
    state.server.isLogged && state.accounts.remote.length === 0
  );
  const [show_expiring_soon_alert, set_show_expiring_soon_alert] = useState(false);
  const [show_expired_alert, set_show_expired_alert] = useState(false);
  const show_save_key_alert = useSelector((state) =>
    state?.user?.profile?.profile?.key_verified == false && !show_migration_alert
  );

  // When valid until change we check if user needs to be alerted about his subscription
  useEffect(() => {
    if (valid_until) {
      if (new Date(valid_until) < new Date()) {
        set_show_expiring_soon_alert(false);
        set_show_expired_alert(true);
      } else if (moment(valid_until).diff(new Date(), 'days') < 7) {
        set_show_expiring_soon_alert(true);
        set_show_expired_alert(false);
      }
    } else {
      set_show_expiring_soon_alert(false);
      set_show_expired_alert(false);
    }
  }, [valid_until])

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

      <div className="layout_dashboard">

        {/* ALERT ON TOP OF SCREEN */}
        { statistics && statistics.stats && statistics.stats.hasUnknownAmount &&
          <div className="paper"><ChangeRateUnknownAlert /></div>}

        {/* BALANCE VIEW */}
        <div className="paper showMobile">
          <BalanceView
            statistics={statistics}
          />
        </div>

        <div className="paper balance1 hideMobile">

          <BalanceComponent
            label={ moment().format("MMMM") }
            balance={!!statistics && (statistics?.currentYear?.currentMonth?.expenses +
                     statistics?.currentYear?.currentMonth?.incomes)}
            incomes={statistics?.currentYear?.currentMonth?.incomes}
            expenses={statistics?.currentYear?.currentMonth?.expenses}/>
        </div>

        <div className="paper balance2 hideMobile">

          <BalanceComponent
            label={ moment().format("YYYY") }
            balance={!!statistics && (statistics?.currentYear?.expenses +
                        statistics?.currentYear?.incomes)}
            incomes={statistics?.currentYear?.incomes}
            expenses={statistics?.currentYear?.expenses}/>
        </div>

        {/* TRENDS VIEW */}
        <div className="paper trend1 hideMobile">
          <TrendsComponent
            isLoading={!statistics}
            trend={statistics ? statistics.trend30 : null}
            onOpenTrend={handleToggleTrend}
          />
        </div>

        <div className="paper trend2 hideMobile">
          <TrendsComponent
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
        <div className="paper showMobile">
          <Trends
            trend30={statistics ? statistics.trend30 : null}
            trend7={statistics ? statistics.trend7 : null}
            isLoading={!statistics}
            onOpenTrend={handleToggleTrend}
          />
        </div>

        {/* CALENDAR GRAPH WITH  */}
        <div className="paper calendar">
          <CalendarGraph
            values={calendar}
            monthsPerLine={4}
            isLoading={!Boolean(statistics) || isConfidential || false}
            onClick={(year, month, day) => { navigate(`/transactions/${year}/${+month+1}/${day}`); }} />
        </div>

        <div className="paper numbers">
          <p>
            This account contains{" "}
            <span style={{ color: theme.palette.transactions.main }}>
              {!transactions ? (
                <span className="loading w80" />
              ) : (
                transactions.length
              )}
            </span>{" "}
            <strong>transactions</strong>,{" "}
            <span style={{ color: theme.palette.changes.main }}>
              {!changes ? (
                <span className="loading w80" />
              ) : (
                changes.length
              )}
            </span>{" "}
            <strong>changes</strong>, and{" "}
            <span style={{ color: theme.palette.categories.main }}>
              {!categories ? (
                <span className="loading w80" />
              ) : (
                categories.length
              )}
            </span>{" "}
            <strong>categories</strong>.
          </p>
        </div>


        {/* MESSAGES  */}
        { show_update_alert || show_expiring_soon_alert || show_expired_alert || show_migration_alert || show_save_key_alert ?
        <div className="paper messages">
          <Stack spacing={2}>

            {/* App has updated and need to restart */}
            { show_update_alert && <NewVersionAvailable /> }

            {/* Expiration date is coming soon */}
            { show_expiring_soon_alert && <SubscriptionExpireSoon valid_until_moment={valid_until ? moment(valid_until) : null} /> }

            {/* Expiration date is passed */}
            { show_expired_alert && <SubscriptionExpired /> }

            {/* User is logged with local account but no account on server */}
            { show_migration_alert && <MigrateToCloud /> }

            {/* User is logged with local account but no account on server */}
            { show_save_key_alert && <KeyVerified /> }

          </Stack>
        </div>
        : ''}
      </div>
    </DashboardLayout>
  );
}