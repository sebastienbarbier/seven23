

import "./GetStarted.scss";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import AppActions from "../../actions/AppActions";

import Button from "@mui/material/Button";
import { Link } from "react-router-dom";

import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';

import ModalLayoutComponent from '../layout/ModalLayoutComponent';

import useRouteTitle from "../../hooks/useRouteTitle";
import { isStandAlone } from "../../utils/isStandAlone";

export default function HowToInstall(props) {

  const titleObject = useRouteTitle();

  return (
    <ModalLayoutComponent
      title={ titleObject.title }
      content={<>
        <Container sx={{ pb: 4 }}>
          <Stack spacing="2" direction="column" sx={{ pt: 3, pb: 2 }}>
            <Typography variant="h5">Overview</Typography>

            <Typography>Progressive Web Apps (PWAs) provide a seamless and app-like experience directly through your web browser. Installing a PWA on iOS involves a simple process of adding it to your home screen. This documentation guides you through the steps to install a PWA on your iOS device.</Typography>

            <Typography variant="h5">Instructions</Typography>

            <Typography variant="h6">1. Open Safari</Typography>

            <Typography>Launch the Safari browser on your iOS device.</Typography>

            <Typography variant="h6">2. Navigate to the PWA</Typography>

            <Typography>Visit the website of the Progressive Web App you wish to install.</Typography>

            <Typography variant="h6">3. Access the Share Menu</Typography>

            <Typography>Locate the "Share" icon in Safari, usually represented by a square with an arrow pointing upward. This icon is typically found at the bottom center or top of the browser.</Typography>

            <Typography variant="h6">4. Find "Add to Home Screen"</Typography>

            In the Share menu, scroll or swipe until you find the option labeled "Add to Home Screen." Tap on this option.

            <Typography variant="h6">5. Confirm the Installation</Typography>

            <Typography>Tap the "Add" or "Add to Home Screen" option to confirm the installation. This action will create an icon on your home screen for quick access.</Typography>

            <Typography>The installation process is now complete. You can now launch the PWA from your home screen.</Typography>
          </Stack>

        </Container>
      </>}
      footer={<>
        <Stack spacing={1}>
          <Link tabIndex={-1} to="/">
            <Button
              fullWidth
              variant="text"
            >
              Cancel
            </Button>
          </Link>
        </Stack>
      </>}
    />
  );
}