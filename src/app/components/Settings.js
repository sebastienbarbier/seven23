/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import { useSelector } from "react-redux";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import SettingsNavigation from "./settings/SettingsNavigation";

import LayoutSideListPanel from "./layout/LayoutSideListPanel";

export default function Settings(props) {

  const isLogout = useSelector((state) => state.state.isLogout);

  return (
    <LayoutSideListPanel sidePanel={<SettingsNavigation />}>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLogout}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutSideListPanel>
  );
}
