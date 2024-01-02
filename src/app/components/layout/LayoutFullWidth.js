/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */

import Box from "@mui/material/Box";
import ScrollListenner from "./ScrollListenner";

import "./LayoutFullWidth.scss";

export default function LayoutFullWidth(props) {
  return (
    <Box className={`${props.className || ""} layoutFullWidth`}>
      <ScrollListenner>{props.children}</ScrollListenner>
    </Box>
  );
}
