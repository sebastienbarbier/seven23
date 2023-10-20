import axios from "axios";

import { useLocation, Link } from "react-router-dom";

import React from "react";
import { useSelector } from "react-redux";
import moment from "moment";
import md5 from "blueimp-md5";

import Container from "@mui/material/Container";

import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
Stack
import Stack from "@mui/material/Stack";
import MobileStepper from "@mui/material/MobileStepper";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import VerifiedUser from "@mui/icons-material/VerifiedUser";
import Announcement from "@mui/icons-material/Announcement";
import Check from "@mui/icons-material/Check";

import UserActions from "../../actions/UserActions";

export default function TermsAndConditions(props) {

  const server = useSelector(state => state.server);

  const handleCancel = () => {
    props.onClose();
  };

  return (
    <div className="layout dashboard mobile">
      <header className="layout_header showDesktop">
        <Container className="layout_header_top_bar">
          <h2>Terms and conditions</h2>
        </Container>
      </header>
      <main className="layout_content">
        <div className="content">
          <div>
            <Container
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  paddingBottom: 80
                }}
              >
                <div
                  style={{
                    overflow: "auto",
                    margin: "0px 0",
                    padding: "0px 6px 5px 0px",
                    textAlign: "justify",
                    fontSize: "0.9rem",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: server.terms_and_conditions
                  }}
                />
              </Container>
          </div>
        </div>
      </main>
      <footer className="layout_footer">
        <Stack>
          <Button 
              color='inherit'
              onClick={() => handleCancel()}>
              Cancel
            </Button>
          </Stack>
      </footer>
    </div>
  );
}