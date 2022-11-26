

import "./GetStarted.scss";
import React, { useEffect, useState } from "react";

import Button from "@mui/material/Button";
import { Link } from "react-router-dom";

import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';

export default function GetStarted(props) {

  let [playAnimation, setPlayAnimation] = useState(false);

  let isStandAlone = ("standalone" in window.navigator) && window.navigator.standalone;

  useEffect(() => {
    setTimeout(() => {
      setPlayAnimation(true);
    }, 200);
  }, []);

  return (
    <div className="welcome_wrapper">
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
            <p>
              You will need to create an account to start tracking your expenses.
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