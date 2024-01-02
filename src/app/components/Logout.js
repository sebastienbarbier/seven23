/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import UserActions from "../actions/UserActions";

export default function Logout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(UserActions.logout())
      .then(() => {
        navigate("/");
      })
      .catch(() => {
        navigate(-1);
      });
  }, []);

  return <div />;
}
