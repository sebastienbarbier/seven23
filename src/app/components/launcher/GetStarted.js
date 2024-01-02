import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./GetStarted.scss";

import Button from "@mui/material/Button";
import { Link } from "react-router-dom";

import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { isStandAlone } from "../../utils/isStandAlone";
import InstallApp from "../alerts/InstallApp";

export default function GetStarted(props) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isLogged = useSelector((state) => state.server.isLogged);
  const hasAccount = useSelector(
    (state) => state.accounts.remote.length + state.accounts.local.length >= 1
  );

  useEffect(() => {
    if (isLogged && !hasAccount) {
      navigate("/create-account");
    }
  }, []);

  return (
    <>
      <div id="cy_get_started" className="welcome_wrapper">
        <Container>
          <header>
            <Typography variant="h4">Welcome 🥳</Typography>
          </header>
          <div className="content">
            <p>
              <strong>Seven23</strong> is a{" "}
              <strong>fully manual budget app</strong> to track personal
              expenses. It is completely <strong>opensource</strong>, with{" "}
              <strong>privacy by design</strong>.
            </p>
          </div>
          <footer>
            <Stack spacing={1}>
              <Link tabIndex={-1} to="/create-account">
                <Button fullWidth disableElevation variant="contained">
                  Get started
                </Button>
              </Link>
              <Link tabIndex={-1} to="/login">
                <Button fullWidth variant="text">
                  I have an account
                </Button>
              </Link>
            </Stack>

            {!isStandAlone && (
              <InstallApp className="showMobile" sx={{ mt: 4, mb: 4 }} />
            )}
          </footer>
        </Container>
      </div>
    </>
  );
}
