/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import AppActions from "../../actions/AppActions";

import Box from '@mui/material/Box';

import './ScrollListenner.scss';

export default function ScrollListenner(props) {

  const mainRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    // Detect scroll direction
    let lastScrollY = mainRef.current.scrollTop;
    mainRef.current.addEventListener("scroll", () => {
      // If we are on Mobile size we listen to main scroll. Otherwise we don't
      if (window.innerWidth < 896) {
        if (mainRef.current.scrollTop > lastScrollY) {
          // Scroll down
          dispatch(AppActions.hideNavigation(true));
        } else {
          // Scroll up
          dispatch(AppActions.hideNavigation(false));
        }
        lastScrollY = mainRef.current.scrollTop;
      } else {
        dispatch(AppActions.hideNavigation(false));
      }
    });
  });

  return (
    <Box
      ref={mainRef}
      className={`${props.className} scrollListenner`}>
      { props.children }
    </Box>
  );
}