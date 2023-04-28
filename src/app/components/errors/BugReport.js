

import "./BugReport.scss";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import Button from "@mui/material/Button";
import { Link } from "react-router-dom";

import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';

import UserActions from "../../actions/UserActions";
import AppActions from "../../actions/AppActions";

export default function BugReport(props) {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  let [playAnimation, setPlayAnimation] = useState(false);

  let isStandAlone = ("standalone" in window.navigator) && window.navigator.standalone;

  useEffect(() => {
    setTimeout(() => {
      setPlayAnimation(true);
    }, 200);
  }, []);

  let restart = () => {
    AppActions.reload();
  };

  let reset = () => {
    dispatch(AppActions.reset()).then(() => { AppActions.reload(); })
  };

  let navigate_to = (path) => {
    // React redirect to /dashbaord
    navigate(path);
    dispatch(AppActions.navigate(path));
    AppActions.reload();
  };

  let logout = () => {
    dispatch(UserActions.logout())
      .then(() => {
        navigate("/");
      })
      .catch(() => {
        navigate(-1);
      });
  };

  return (
    <div id="bug_report" className="bug_report">
      <div>
        {/* Add some cool animation */}
      </div>
      <main className={`${playAnimation ? "show" : ""} ${isStandAlone ? "standalone" : ""}`}>
        <Container>
          <header>
            <h2>❌ An unexpected error occured</h2>
          </header>
          <div className="content">
            <p>
              A report has been send to our bug report platform. Please try to refresh, reset your settings, or login/logout from the application.
            </p>
            <Stack spacing={1} direction="row">
              <Button
                variant="text"
                onClick={() => navigate_to('/dashboard')}
              >
                Go to Dashboard
              </Button>
              <Button
                variant="text"
                onClick={() => restart()}
              >
                Refresh the app
              </Button>
              <Button
                variant="text"
                onClick={() => reset()}
              >
                Reset preferences
              </Button>
              <Button
                variant="text"
                onClick={() => logout()}
              >
                Logout
              </Button>
            </Stack>
          </div>
        </Container>
      </main>
    </div>
  );
}