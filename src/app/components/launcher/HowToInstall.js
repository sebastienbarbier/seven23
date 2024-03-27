import { useState } from "react";
import "./GetStarted.scss";

import Button from "@mui/material/Button";
import { Link } from "react-router-dom";

import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";

import ModalLayoutComponent from "../layout/ModalLayoutComponent";

import useRouteTitle from "../../hooks/useRouteTitle";

export default function HowToInstall(props) {
  const [value, setValue] = useState(0);
  const titleObject = useRouteTitle();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ pt: 3, pb: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }

  return (
    <ModalLayoutComponent
      title={titleObject.title}
      content={
        <>
          <Container sx={{ pb: 4, pt: 0.5 }}>
            <Box sx={{ width: "100%" }}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={value}
                  onChange={handleChange}
                  aria-label="basic tabs example"
                  centered
                >
                  <Tab label="iOS" />
                  <Tab label="Android" />
                </Tabs>
              </Box>
              <CustomTabPanel value={value} index={0}>
                <Typography variant="h5" sx={{ pt: 1, pb: 1 }}>
                  Overview
                </Typography>
                <Typography>
                  Progressive Web Apps (PWAs) provide a seamless and app-like
                  experience directly through your web browser. Installing a PWA
                  on iOS involves a simple process of adding it to your home
                  screen.
                </Typography>
                <Typography variant="h6" sx={{ pt: 2, pb: 1 }}>
                  1. Open Safari
                </Typography>
                <img
                  src="/images/how-to-install/ios/1-safari.png"
                  alt="1-safari"
                  style={{ maxWidth: "100%" }}
                />
                <Typography>
                  Launch the Safari browser on your iOS device and access the
                  application&apos;s url.
                </Typography>
                <Typography variant="h6" sx={{ pt: 2, pb: 1 }}>
                  2. Access the Share Menu
                </Typography>
                <img
                  src="/images/how-to-install/ios/2-share.png"
                  alt="2-share"
                  style={{ maxWidth: "100%" }}
                />
                <Typography>
                  Locate the &quot;Share&quot; icon in Safari, usually represented by a
                  square with an arrow pointing upward. This icon is typically
                  found at the bottom center or top of the browser.
                </Typography>
                <Typography variant="h6" sx={{ pt: 2, pb: 1 }}>
                  3. Find &quot;Add to Home Screen&quot;
                </Typography>
                <img
                  src="/images/how-to-install/ios/3-add.png"
                  alt="3-add"
                  style={{ maxWidth: "100%" }}
                />
                In the Share menu, scroll or swipe until you find the option
                labeled &quot;Add to Home Screen.&quot; Tap on this option.
                <Typography variant="h6" sx={{ pt: 2, pb: 1 }}>
                  4. Confirm the Installation
                </Typography>
                <img
                  src="/images/how-to-install/ios/4-confirm.png"
                  alt="4-confirm"
                  style={{ maxWidth: "100%" }}
                />
                <Typography>
                  Tap the &quot;Add&quot; or &quot;Add to Home Screen&quot; option to confirm the
                  installation. This action will create an icon on your home
                  screen for quick access.
                </Typography>
                <Typography variant="h6" sx={{ pt: 2, pb: 1 }}>
                  5. Launch from the home screen
                </Typography>
                <Typography>
                  The installation process is now complete. You can now launch
                  the PWA from your home screen.
                </Typography>
                <img
                  src="/images/how-to-install/ios/5-open.png"
                  alt="5-open"
                  style={{ maxWidth: "100%" }}
                />
              </CustomTabPanel>
              <CustomTabPanel value={value} index={1}>
                <Typography variant="h5" sx={{ pt: 1, pb: 1 }}>
                  Overview
                </Typography>
                <Typography>
                  Progressive Web Apps (PWAs) offer a similar seamless
                  experience on Android devices through a straightforward
                  installation process. Follow these steps to add a PWA to your
                  home screen.
                </Typography>
                <Typography variant="h6" sx={{ pt: 2, pb: 1 }}>
                  1. Open Chrome
                </Typography>
                <img
                  src="/images/how-to-install/android/1-chrome.png"
                  alt="1-safari"
                  style={{ maxWidth: "100%" }}
                />
                <Typography>
                  Launch the Chrome browser on your Android device and navigate
                  to the application&apos;s URL.
                </Typography>
                <Typography variant="h6" sx={{ pt: 2, pb: 1 }}>
                  2. Access the Options Menu
                </Typography>
                <img
                  src="/images/how-to-install/android/2-menu.png"
                  alt="2-share"
                  style={{ maxWidth: "100%" }}
                />
                <Typography>
                  Locate the three-dot icon, typically found in the top-right
                  corner of the browser, to access the options menu.
                </Typography>
                <Typography variant="h6" sx={{ pt: 2, pb: 1 }}>
                  3. Find &quot;Add to Home Screen&quot;
                </Typography>
                <img
                  src="/images/how-to-install/android/3-add.png"
                  alt="3-add"
                  style={{ maxWidth: "100%" }}
                />
                In the options menu, look for the &quot;Add to Home Screen&quot; or a
                similar option. Tap on it to proceed.
                <Typography variant="h6" sx={{ pt: 2, pb: 1 }}>
                  4. Confirm the Installation
                </Typography>
                <img
                  src="/images/how-to-install/android/4-confirm.png"
                  alt="4-confirm"
                  style={{ maxWidth: "100%" }}
                />
                <Typography>
                  A prompt will appear asking you to confirm the installation.
                  Tap &quot;Add&quot; or &quot;Add to Home Screen&quot; to finalize the process.
                </Typography>
                <Typography variant="h6" sx={{ pt: 2, pb: 1 }}>
                  5. Launch from the Home Screen
                </Typography>
                <Typography>
                  The installation is now complete. You can locate the newly
                  created icon on your home screen, providing quick access to
                  the PWA. Tap on the icon to launch the application.
                </Typography>
                <img
                  src="/images/how-to-install/android/5-open.png"
                  alt="5-open"
                  style={{ maxWidth: "100%" }}
                />
              </CustomTabPanel>
            </Box>
          </Container>
        </>
      }
      footer={
        <>
          <Stack spacing={1}>
            <Link tabIndex={-1} to="/">
              <Button fullWidth variant="text">
                Cancel
              </Button>
            </Link>
          </Stack>
        </>
      }
    />
  );
}
