/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import Box from "@mui/material/Box";

import ScrollListenner from "./ScrollListenner";

import "./LayoutDoublePanel.scss";

export default function LayoutDoublePanel(props) {
  return (
    <div className={`${props.className || ""} layoutDoublePanel layout`}>
      <div
        className={`layout_double_columns ${
          props.selectedPanel == "right" ? "showRight" : "showLeft"
        }`}
      >
        <Box className={"leftPanel"}>
          {props.children}

          <ScrollListenner className="leftPanelPaper">
            {props.left}
          </ScrollListenner>
        </Box>

        <Box className={"rightPanel"}>
          <ScrollListenner>{props.right}</ScrollListenner>
        </Box>
      </div>
    </div>
  );
}
