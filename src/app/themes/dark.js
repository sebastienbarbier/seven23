import { cyan, orange, green, blue, red, blueGrey, indigo } from '@mui/material/colors';

const darktheme = {
  palette: {
    mode: "dark",
    primary: blue,
    background: {
    },
    transparent: {
    },
    numbers: {
      red: red[400],
      blue: blue[400],
      green: green[400],
      yellow: "#FDD835",
    },
    brand: {
      nomadlist: "rgb(255, 71, 66)",
    },
    cardheader: "rgba(255, 255, 255, 0.12)",
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
    search: {
      primary: blueGrey,
      main: blueGrey[600],
    },
    convertor: {
      primary: blueGrey,
      main: blueGrey[600],
    },
    nomadlist: {
      primary: red,
      main: "rgb(255, 71, 66)",
    },
  },
};

export { darktheme };