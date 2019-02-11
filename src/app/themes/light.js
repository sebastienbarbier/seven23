import cyan from '@material-ui/core/colors/cyan';
import orange from '@material-ui/core/colors/orange';
import green from '@material-ui/core/colors/green';
import blue from '@material-ui/core/colors/blue';
import blueGrey from '@material-ui/core/colors/blueGrey';
import indigo from '@material-ui/core/colors/indigo';

const lighttheme = {
  palette: {
    type: 'light',
    background: {
      default: 'rgb(249, 250, 252)'
    },
    primary: blue,
    cardheader: '#f5f5f5',
    // Define color per category in theme to adjust constrast
    default: {
      primary: blue,
      main: blue[600],
    },
    dashboard: {
      primary: blue,
      main: blue[600],
    },
    transactions: {
      primary: cyan,
      main: cyan[700],
    },
    categories: {
      primary: green,
      main: green[600],
    },
    changes: {
      primary: orange,
      main: orange[800],
    },
    report: {
      primary: indigo,
      main: indigo[400],
    },
    settings: {
      primary: blueGrey,
      main: blueGrey[500],
    },
  },
  typography: {
    useNextVariants: true,
  },
};

export { lighttheme };