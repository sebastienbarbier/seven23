import cyan from '@material-ui/core/colors/cyan';
import orange from '@material-ui/core/colors/orange';
import green from '@material-ui/core/colors/green';
import blue from '@material-ui/core/colors/blue';
import blueGrey from '@material-ui/core/colors/blueGrey';
import indigo from '@material-ui/core/colors/indigo';

const darktheme = {
  palette: {
    type: 'dark',
    primary: blue,
    cardheader: 'rgba(255, 255, 255, 0.12)',
    // Define color per category in theme to adjust constrast
    default: {
      primary: blue,
      main: blue[800],
    },
    dashboard: {
      primary: blue,
      main: blue[700],
    },
    transactions: {
      primary: cyan,
      main: cyan[800],
    },
    categories: {
      primary: green,
      main: green[800],
    },
    changes: {
      primary: orange,
      main: orange[900],
    },
    report: {
      primary: indigo,
      main: indigo[500],
    },
    settings: {
      primary: blueGrey,
      main: blueGrey[600],
    },
  },
  typography: {
    useNextVariants: true,
  },
};

export { darktheme };