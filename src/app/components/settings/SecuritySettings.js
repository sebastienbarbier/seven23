import moment from "moment";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import KeyIcon from "@mui/icons-material/Key";
import Tooltip from "@mui/material/Tooltip";

import AppActions from "../../actions/AppActions";
import EncryptionKeyForm from "./security/EncryptionKeyForm";

import "./SecuritySettings.scss";

export default function SecuritySettings() {
  const dispatch = useDispatch();
  const cipher = useSelector((state) => state.user?.cipher);
  const username = useSelector((state) => state.user?.profile?.username);

  const show_save_key_alert = useSelector(
    (state) => state?.user?.profile?.profile?.key_verified == false
  );

  const [open, setOpen] = useState(false);

  const copyKey = () => {
    navigator.clipboard.writeText(cipher);
    setOpen(true);
    setTimeout(() => setOpen(false), 2000);
  };

  const downloadAsFile = () => {
    const dataStr = "data:text/plain;charset=utf-8," + cipher;
    const date = moment().format("YYYY_MM_DD");
    const dlElement = document.getElementById("downloadAnchorElem");
    dlElement.setAttribute("href", dataStr);
    dlElement.setAttribute(
      "download",
      `seven23_${username}_backup_key_${date}.txt`
    );
    dlElement.click();
  };

  const verifyNow = () => {
    dispatch(
      AppActions.openModal(
        <EncryptionKeyForm
          onSubmit={() => dispatch(AppActions.closeModal())}
          onClose={() => dispatch(AppActions.closeModal())}
        />
      )
    );
  };

  return (
    <Container sx={{ pt: 2 }}>
      <Box sx={{ pb: 2 }}>
        <Typography variant="h5" sx={{ pb: 2 }} className="hideMobile">
          Encryption key
        </Typography>
        <Typography sx={{ opacity: 0.8, fontSize: "1em" }}>
          A backup of your encryption key will be required to recover your data
          if you forget your password.{" "}
          <strong>Without this key, all your data will be lost</strong>.
        </Typography>
      </Box>

      {show_save_key_alert && (
        <>
          <Box sx={{ justifyContent: "center", pb: 4, pt: 2 }}>
            <Alert
              severity="warning"
              id="cy_migrate_alert"
              sx={{
                ".MuiAlert-message": { width: "100%" },
              }}
            >
              <AlertTitle>You need to backup your encryption key</AlertTitle>
              Save a copy of your encryption to a safe location, then click on
              verify my backup.
              <Stack direction="row-reverse" spacing={2} sx={{ pt: 2 }}>
                <Button
                  color="inherit"
                  onClick={() => verifyNow()}
                  size="small"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  Verify my backup
                </Button>
              </Stack>
            </Alert>
          </Box>
        </>
      )}

      <Box className="securitySettings">
        <Box className="key">
          <List>
            <ListItem>
              <ListItemIcon>
                <KeyIcon />
              </ListItemIcon>
              <ListItemText primary="Your encryption key" secondary={cipher} />
            </ListItem>
          </List>
        </Box>
        <Box className="actions">
          <Stack
            direction="row"
            spacing={2}
            sx={{
              height: "100%",
              width: "100%",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Button
              aria-label="download"
              size="small"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={() => downloadAsFile()}
            >
              Download as file
            </Button>
            <Tooltip title={open ? "Copied !" : "Copy to clipboard"}>
              <Button
                aria-label="copy"
                size="small"
                color="primary"
                startIcon={<ContentCopyIcon />}
                onClick={() => copyKey()}
              >
                Copy
              </Button>
            </Tooltip>
          </Stack>
        </Box>
      </Box>

      <a id="downloadAnchorElem"></a>
    </Container>
  );
}
