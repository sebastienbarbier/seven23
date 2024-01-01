/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import { useDispatch, useSelector } from "react-redux";

import { useTheme } from "@mui/material/styles";
import { useLocation, useNavigate } from "react-router-dom";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import SettingsNavigation from "./settings/SettingsNavigation";

import UserActions from "../actions/UserActions";

import LayoutSideListPanel from "./layout/LayoutSideListPanel";

export default function Settings(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const theme = useTheme();

  const isDeveloper = useSelector((state) => state.app.isDeveloper);

  const server = useSelector((state) => state.server);
  const isLogout = useSelector((state) => state.state.isLogout);

  const handleLogout = () => {
    setIsLogout(true);
    navigate("/settings");
    dispatch(UserActions.logout())
      .then(() => {
        setIsLogout(false);
        navigate("/");
      })
      .catch(() => {
        setIsLogout(false);
      });
  };

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
