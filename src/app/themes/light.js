import {
  cyan500,
  cyan700,
  pinkA200,
  grey100,
  grey300,
  grey400,
  grey500,
  white,
  darkBlack,
  fullBlack
} from "material-ui/styles/colors";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import { fade } from "material-ui/utils/colorManipulator";
import spacing from "material-ui/styles/spacing";

const v0lighttheme = getMuiTheme({
  spacing: spacing,
  fontFamily: "Roboto, sans-serif",
  palette: {
    primary1Color: cyan500,
    primary2Color: cyan700,
    primary3Color: grey400,
    accent1Color: "rgba(0, 0, 0, 0.3)",
    accent2Color: grey100,
    accent3Color: grey500,
    textColor: darkBlack,
    alternateTextColor: white,
    canvasColor: white,
    borderColor: grey300,
    disabledColor: fade(darkBlack, 0.3),
    pickerHeaderColor: cyan500,
    clockCircleColor: fade(darkBlack, 0.07),
    shadowColor: fullBlack
  }
});

import { createMuiTheme } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';
import cyan from '@material-ui/core/colors/cyan';
import common from '@material-ui/core/colors/common';

const lighttheme = createMuiTheme({
  palette: {
    type: 'light'
  },
});

export { v0lighttheme, lighttheme };