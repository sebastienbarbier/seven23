import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import { useTheme } from "../../theme";
import { colorLuminance } from '../../utils/colorLuminance';

import DashboardActions from "../../actions/DashboardActions";

import Stack from '@mui/material/Stack';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

import { StyledTabs, StyledTab } from './MonthLineWithControls/StyledTabs';

import Button from '@mui/material/Button';

import MonthLineGraph from "../charts/MonthLineGraph";

import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const RANGE = ['7D','1M','3M','6M','1Y','YTD','ALL']; 

function generateData(account, statistics, theme, range='ALL') {
  if (!statistics || !statistics.graph) { return []; }

  let begin = moment(statistics.stats.beginDate),
        end = moment(statistics.stats.endDate),
        step = 'months';

  if (['7D', '1M'].indexOf(range) != -1) {
    step = 'days';
  }

  if (['7D','1M','3M','6M','1Y','YTD'].indexOf(range) != -1) {
    end = moment(); // .add(1, step)
  }

  if (range == '7D') begin = moment(end).subtract(6/*+1*/, step);
  if (range == '1M') begin = moment(end).subtract(1, 'months'); // .subtract(2, 'days')
  if (range == '3M') begin = moment(end).subtract(2/*+1*/, step);
  if (range == '6M') begin = moment(end).subtract(5/*+1*/, step);
  if (range == '1Y') begin = moment(end).subtract(11/*+1*/, step);
  if (range == 'YTD') end = moment().endOf('year'); // .add(1, 'month')
  if (range == 'YTD') begin = moment(end).subtract(11/*+1*/, step);
  if (range == 'ALL') begin = moment(account.youngest);
  if (range == 'ALL') end = moment(account.oldest);


  const result = [];

  // Generate Graph data
  let lineExpenses = {
    label: 'Expenses',
    values: [],
    color: theme.palette.numbers.red,
  };

  let lineIncomes = {
    label: 'Incomes',
    values: [],
    color: theme.palette.primary[500],
  };

  while (begin.isBefore(end.endOf('day'))) {
    let stat = statistics.stats.perDates[begin.year()]?.months[begin.month()];
    let date = new Date(begin.year(), begin.month());
    if (step == 'days') {
      date = new Date(begin.year(), begin.month(), begin.date());
      stat = statistics.stats.perDates[begin.year()]?.months[begin.month()]?.days[begin.date()];
    }
    if (stat) {
      lineExpenses.values.push({
        date: date,
        value: +stat.expenses * -1,
      });
      lineIncomes.values.push({
        date: date,
        value: stat.incomes,
      });
    } else {
      lineExpenses.values.push({
        date: date,
        value: 0,
      });
      lineIncomes.values.push({
        date: date,
        value: 0,
      });
    }
    begin.add(1, step);
  }

  return [lineExpenses, lineIncomes];
}

// Display a full width component with d3.js MonthLineGraph and some
// maerial UI component to enhanced controls
export default function MonthLineWithControls({
  statistics,
  maxHeight,
  isConfidential,
  disableRangeSelector,
}) {

  const dispatch = useDispatch();
  const theme = useTheme();

  const savedRange = useSelector((state) => disableRangeSelector ? RANGE.length - 1 : state.dashboard.range);
  const savedHiddenLines = useSelector((state) => state.dashboard.hiddenLines);
  const account = useSelector((state) => state.account);

  const [selectedRange, setSelectedRange] = useState(savedRange || 0);
  const [hiddenLines, setHiddenLines] = useState(savedHiddenLines);
  const [data, setData] = useState(() => generateData(account, statistics, theme));

  const handleDurationChange = (event, r) => {
    setSelectedRange(r);
  };

  // We toggle line index from hiidenLines array to enable/disable it
  const handleLegendFilter = (event, r) => {
    if (hiddenLines.indexOf(r) === -1) {
      setHiddenLines([...hiddenLines, r]);
    } else {
      setHiddenLines(hiddenLines.filter(v => v != r));
    }
  };

  useEffect(() => {
    if (!disableRangeSelector) {
      dispatch(DashboardActions.setConfig(selectedRange, hiddenLines));
    }
    if (statistics) {
      setData(generateData(account, statistics, theme, RANGE[selectedRange]).filter((_, i) => hiddenLines.indexOf(i) === -1));
    }
  }, [hiddenLines, statistics, selectedRange]);

  return (
    <Box className="graphContainer" sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', pt: 0.5, pb: 0.5, gap: 0.5 }}>

      { !disableRangeSelector && <Box sx={{ width: '100%' }}>
        <StyledTabs
          value={selectedRange}
          onChange={handleDurationChange}
          aria-label="styled tabs example"
        >
          { RANGE.map((r, i) => {
            return <StyledTab key={i} label={r} disabled={isConfidential} />
          })}
        </StyledTabs>
      </Box> }

      <Box sx={{ position: 'relative', flexGrow: 1, overflow: 'hidden' }}>
        <MonthLineGraph
          values={data}
          isLoading={!Boolean(statistics) || isConfidential || false}
          color={theme.palette.text.secondary}
        />
      </Box>
      { statistics?.graph && 
      <Stack spacing={2} justifyContent='center' direction="row" sx={{ pt: 2, pb: 1 }}>
        { statistics.graph.map((line, i) => {
          return <Button 
            key={i}
            color="default" 
            onClick={(event) => handleLegendFilter(event, i)}
            size="small" 
            disabled={isConfidential}
            sx={hiddenLines.indexOf(i) != -1 ? {
                textTransform: 'capitalize',
                color: theme.palette.text.secondary,
                opacity: 0.8,
              } : {
              textTransform: 'capitalize',
              color: theme.palette.text.primary,
              opacity: 1,
            }}
            startIcon={
              hiddenLines.indexOf(i) != -1 ? 
                <VisibilityOffIcon sx={{ color: theme.palette.text.secondary, opacity: 0.6 }} />
                : <HorizontalRuleIcon sx={{ color: line.color, opacity: 1 }} />
            }>
            { line.label }
          </Button>
        })}
      </Stack>}
    </Box>
  );
}