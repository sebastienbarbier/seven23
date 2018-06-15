import {
  cyan700,
  grey600,
  pinkA100,
  pinkA200,
  pinkA400,
  fullWhite,
} from "material-ui/styles/colors";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import { fade } from "material-ui/utils/colorManipulator";
import spacing from "material-ui/styles/spacing";

const v0darktheme = getMuiTheme({
  spacing: spacing,
  fontFamily: "Roboto, sans-serif",
  borderRadius: 2,
  palette: {
    primary1Color: fullWhite,
    primary2Color: fullWhite,
    primary3Color: fade(fullWhite, 0.7),
    accent1Color: pinkA200,
    accent2Color: pinkA400,
    accent3Color: pinkA100,
    textColor: fullWhite,
    secondaryTextColor: fade(fullWhite, 0.7),
    alternateTextColor: "#303030",
    canvasColor: "#303030",
    borderColor: fade(fullWhite, 0.7),
    disabledColor: fade(fullWhite, 0.7),
    pickerHeaderColor: fade(fullWhite, 0.24),
    clockCircleColor: fade(fullWhite, 0.24),
  }
});

import { createMuiTheme } from '@material-ui/core/styles';
import pink from '@material-ui/core/colors/pink';
import common from '@material-ui/core/colors/common';

const darktheme = createMuiTheme({
  palette: {
    type: 'dark'
  },
});

export { v0darktheme, darktheme };
