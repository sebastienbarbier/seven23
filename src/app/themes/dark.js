import {
  blue,
  blueGrey,
  brown,
  cyan,
  deepOrange,
  green,
  grey,
  indigo,
  orange,
  pink,
  red,
} from "@mui/material/colors";

const darktheme = {
  palette: {
    mode: "dark",
    primary: blue,
    background: {
      paper: grey[900],
    },
    transparent: {},
    text: {},
    numbers: {
      red: red[300],
      blue: blue[300],
      green: green[300],
      yellow: orange[300],
    },
    brand: {
      nomadlist: "rgb(255, 71, 66)",
    },
    cardheader: "rgba(255, 255, 255, 0.12)",
    animated: {
      paper: grey[500],
    },
    // Define color per category in theme to adjust constrast
    default: {
      primary: blue,
      main: blue[800],
    },
    dashboard: {
      primary: blue,
      main: blue[800],
    },
    transactions: {
      primary: cyan,
      main: cyan[800],
    },
    categories: {
      primary: green,
      main: green[700],
    },
    changes: {
      primary: orange,
      main: deepOrange[700],
    },
    report: {
      primary: indigo,
      main: indigo[500],
    },
    settings: {
      primary: blueGrey,
      main: blueGrey[800],
    },
    search: {
      primary: pink,
      main: pink[800],
    },
    convertor: {
      primary: brown,
      main: brown[700],
    },
    nomadlist: {
      primary: red,
      main: "rgb(800, 71, 66)",
    },
  },
};

export { darktheme };
