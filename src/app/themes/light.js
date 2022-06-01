import { cyan, orange, green, blue, red, blueGrey, indigo, pink, brown } from '@mui/material/colors';

const lighttheme = {
  palette: {
    mode: "light",
    background: {
      default: "rgb(249, 250, 252)",
      paper: "rgb(255, 255, 255)",
    },
    transparent: {
      default: "rgba(249, 250, 252, 0%)",
      paper: "rgba(255, 255, 255, 0%)",
    },
    numbers: {
      red: "rgb(244, 67, 54)",
      green: "rgb(76, 175, 80)",
      blue: "#4390F4",
      yellow: "#F9A825",
    },
    brand: {
      nomadlist: "rgb(255, 71, 66)",
    },
    primary: blue,
    cardheader: "#f5f5f5",
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
    search: {
      primary: pink,
      main: pink[700],
    },
    convertor: {
      primary: brown,
      main: brown[500],
    },
    nomadlist: {
      primary: red,
      main: "rgb(255, 71, 66)",
    },
  },
  typography: {
    useNextVariants: true,
    fontSize: 14,
    htmlFontSize: 16,
  },
};

export { lighttheme };
