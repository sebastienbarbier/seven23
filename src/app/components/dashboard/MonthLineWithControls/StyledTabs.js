import React from "react";

import { styled } from '@mui/material/styles';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

const StyledTabs = styled((props) => (
  <Tabs
    {...props}
    TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }}
  />
))({
  '& .MuiTabs-scroller': {
    display: 'flex',
    justifyContent: 'center',
  },
  '& .MuiTabs-indicator': {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    height: 4, // sliding bar height
    position: 'absolute',
    marginBottom: 8,
  },
  '& .MuiTabs-indicatorSpan': {
    maxWidth: 4,
    borderRadius: '100%',
    width: '100%',
    backgroundColor: '#635ee7',
  },
});

const StyledTab = styled((props) => <Tab disabled={props.disabled} disableRipple {...props} />)(
  ({ theme }) => ({
    textTransform: 'none',
    fontWeight: 500,
    fontSize: theme.typography.pxToRem(13),
    marginRight: theme.spacing(0),
    padding: '4px 8px',
    color: theme.palette.text.secondary,
    opacity: 0.7,
    minWidth: 46,
    minHeight: 46,
    '&.Mui-selected': {
      color: theme.palette.primary.main,
      opacity: 1,
    },
    '&.Mui-focusVisible': {
      backgroundColor: theme.palette.primary.main,
    },
  }),
);

export { StyledTabs, StyledTab };