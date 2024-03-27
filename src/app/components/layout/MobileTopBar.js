/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import Box from "@mui/material/Box";

import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import IconButton from "@mui/material/IconButton";

import AppActions from "../../actions/AppActions";
import useRouteTitle from "../../hooks/useRouteTitle";

import UserButton from "../settings/UserButton";

import "./MobileTopBar.scss";

export default function MobileTopBar(props) {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const titleObject = useRouteTitle();
  const navbar = useSelector((state) => state.state.navbar);

  const hasAccount = useSelector(
    (state) => state.accounts.remote.length + state.accounts.local.length >= 1
  );

  useEffect(() => {
    dispatch(AppActions.navigate(location.pathname));
    if (titleObject.title) {
      dispatch(AppActions.setNavBar(titleObject.title, titleObject.back));
    }
  }, [location]);

  const [title1, setTitle1] = useState(navbar.title);
  const [title2, setTitle2] = useState();
  const [back1, setBack1] = useState();
  const [back2, setBack2] = useState();
  const [next1, setNext1] = useState();
  const [next2, setNext2] = useState();
  const [height, setHeight] = useState();
  const [displayTitle1, setDisplayTitle1] = useState(true);

  useEffect(() => {
    // If ROUTE object has no title, we skip updating navbar.
    // This is to allow user to override this message easily with dynamic value.
    if (navbar && navbar.title) {
      if (
        (displayTitle1 && navbar.title != title1) ||
        (!displayTitle1 && navbar.title != title2)
      ) {
        if (displayTitle1) {
          setTitle2(navbar.title);
          setBack2(navbar.back);
          setNext2(navbar.next);
        } else {
          setTitle1(navbar.title);
          setBack1(navbar.back);
          setNext1(navbar.next);
        }
        setHeight(navbar.height);
        setDisplayTitle1(!displayTitle1);
      }
    }
  }, [navbar]);

  return (
    <div className="wrapper">
      <div className="container_header_title">
        <div
          className={"title" + (displayTitle1 ? " showTitle1" : " showTitle2")}
        >
          <div className={!!back1 || !!next1 ? "hasBackButton" : ""}>
            {!!back1 && (
              <IconButton
                onClick={() => {
                  navigate(back1);
                }}
                size="large"
              >
                <KeyboardArrowLeft style={{ color: "white" }} />
              </IconButton>
            )}
            {!!next1 && (
              <IconButton
                onClick={() => {
                  navigate(next1);
                }}
                size="large"
              >
                <KeyboardArrowRight style={{ color: "white" }} />
              </IconButton>
            )}
            <span>{title1}</span>
          </div>
          <div className={!!back2 || !!next2 ? "hasBackButton" : ""}>
            {!!back2 && (
              <IconButton
                onClick={() => {
                  navigate(back2);
                }}
                size="large"
              >
                <KeyboardArrowLeft style={{ color: "white" }} />
              </IconButton>
            )}
            {!!next2 && (
              <IconButton
                onClick={() => {
                  navigate(next2);
                }}
                size="large"
              >
                <KeyboardArrowRight style={{ color: "white" }} />
              </IconButton>
            )}
            <span>{title2}</span>
          </div>
        </div>
        <div className={"menu" + (hasAccount ? "show" : "")}>
          <UserButton />
        </div>
      </div>
      <Box id="container_header_component" sx={{ height: height }}></Box>
    </div>
  );
}
