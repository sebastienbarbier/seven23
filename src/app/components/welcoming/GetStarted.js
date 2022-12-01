

import "./GetStarted.scss";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Button from "@mui/material/Button";
import { Link } from "react-router-dom";

import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';

export default function GetStarted(props) {

  const navigate = useNavigate();
  let [playAnimation, setPlayAnimation] = useState(false);

  let isStandAlone = ("standalone" in window.navigator) && window.navigator.standalone;

  const isLogged = useSelector((state) => state.server.isLogged);
  const hasAccount = useSelector(
    (state) => (state.accounts.remote.length + state.accounts.local.length) >= 1
  );

  useEffect(() => {
    if (isLogged && !hasAccount) {
      navigate('/create-account');
    }

    setTimeout(() => {
      setPlayAnimation(true);
    }, 200);
  }, []);

  return (
    <div id="cy_get_started" className="welcome_wrapper">
      <div>
        {/* Add some cool animation */}
      </div>
      <main className={`${playAnimation ? "show" : ""} ${isStandAlone ? "standalone" : ""}`}>
        <Container>
          <header>
            <h2>Welcome on board 🥳</h2>
          </header>
          <div className="content">
            <p>
              <strong>Seven23</strong> is a <strong>fully manual budget app</strong>{" "}
              to track personal expenses. It is completely{" "}
              <strong>opensource</strong>, with <strong>privacy by design</strong>.
            </p>
          </div>
          <footer>
            <Stack spacing={1}>
              <Link tabIndex={-1} to="/create-account">
                <Button
                  fullWidth
                  disableElevation
                  variant="contained"
                >
                  Get started
                </Button>
              </Link>
              <Link tabIndex={-1} to="/select-account-type">
                <Button
                  fullWidth
                  variant="text"
                >
                  I have an account
                </Button>
              </Link>
            </Stack>
          </footer>
        </Container>
      </main>
    </div>
  );
}